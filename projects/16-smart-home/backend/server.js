require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3004;
const JWT_SECRET = process.env.JWT_SECRET || 'smart-home-secret';

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// ─── In-Memory Data ───────────────────────────────────────────────────────────
const users = [
  { id: '1', username: 'admin', password: bcrypt.hashSync('password123', 10), role: 'admin' }
];

let devices = [
  { id: 'd1',  name: 'Living Room Light',  type: 'light',      room: 'Living Room', status: 'on',  brightness: 80, power: 12 },
  { id: 'd2',  name: 'Bedroom Light',      type: 'light',      room: 'Bedroom',     status: 'off', brightness: 60, power: 0  },
  { id: 'd3',  name: 'Kitchen Light',      type: 'light',      room: 'Kitchen',     status: 'on',  brightness: 100, power: 15 },
  { id: 'd4',  name: 'Living Room Thermo', type: 'thermostat', room: 'Living Room', status: 'on',  temperature: 22, targetTemp: 22, power: 8 },
  { id: 'd5',  name: 'Bedroom Thermo',     type: 'thermostat', room: 'Bedroom',     status: 'off', temperature: 20, targetTemp: 20, power: 0 },
  { id: 'd6',  name: 'Front Camera',       type: 'camera',     room: 'Entrance',    status: 'on',  recording: true, power: 5  },
  { id: 'd7',  name: 'Back Camera',        type: 'camera',     room: 'Backyard',    status: 'on',  recording: false, power: 5 },
  { id: 'd8',  name: 'Front Door Lock',    type: 'lock',       room: 'Entrance',    status: 'on',  locked: true, power: 2  },
  { id: 'd9',  name: 'Garage Lock',        type: 'lock',       room: 'Garage',      status: 'on',  locked: true, power: 2  },
  { id: 'd10', name: 'Ceiling Fan',        type: 'fan',        room: 'Living Room', status: 'off', speed: 0, power: 0  },
  { id: 'd11', name: 'Bedroom Fan',        type: 'fan',        room: 'Bedroom',     status: 'off', speed: 0, power: 0  },
  { id: 'd12', name: 'Smart Plug',         type: 'plug',       room: 'Kitchen',     status: 'on',  voltage: 230, power: 45 }
];

let automationRules = [
  { id: 'r1', name: 'Morning Lights',   condition: 'time == 07:00', action: 'turn_on_lights',    enabled: true,  triggerCount: 42 },
  { id: 'r2', name: 'Night Mode',       condition: 'time == 23:00', action: 'turn_off_lights',   enabled: true,  triggerCount: 38 },
  { id: 'r3', name: 'Hot Day AC',       condition: 'temp > 28',     action: 'set_thermostat_20', enabled: true,  triggerCount: 12 },
  { id: 'r4', name: 'Motion Security',  condition: 'motion == true', action: 'start_recording',  enabled: false, triggerCount: 7  },
  { id: 'r5', name: 'Away Lock',        condition: 'presence == false', action: 'lock_all',      enabled: true,  triggerCount: 20 }
];

const scenes = {
  'good_morning': { name: 'Good Morning', icon: '🌅', actions: [
    { deviceId: 'd1', changes: { status: 'on', brightness: 70 } },
    { deviceId: 'd2', changes: { status: 'on', brightness: 50 } },
    { deviceId: 'd4', changes: { status: 'on', targetTemp: 22 } },
    { deviceId: 'd8', changes: { locked: false } }
  ]},
  'good_night': { name: 'Good Night', icon: '🌙', actions: [
    { deviceId: 'd1', changes: { status: 'off' } },
    { deviceId: 'd3', changes: { status: 'off' } },
    { deviceId: 'd4', changes: { targetTemp: 19 } },
    { deviceId: 'd8', changes: { locked: true } },
    { deviceId: 'd9', changes: { locked: true } }
  ]},
  'away': { name: 'Away Mode', icon: '🏠', actions: [
    { deviceId: 'd1', changes: { status: 'off' } },
    { deviceId: 'd2', changes: { status: 'off' } },
    { deviceId: 'd3', changes: { status: 'off' } },
    { deviceId: 'd8', changes: { locked: true } },
    { deviceId: 'd9', changes: { locked: true } },
    { deviceId: 'd6', changes: { recording: true } }
  ]},
  'movie_mode': { name: 'Movie Mode', icon: '🎬', actions: [
    { deviceId: 'd1', changes: { status: 'on', brightness: 20 } },
    { deviceId: 'd3', changes: { status: 'off' } },
    { deviceId: 'd10', changes: { status: 'on', speed: 2 } }
  ]}
};

// ─── Sensor history ───────────────────────────────────────────────────────────
const sensorHistory = [];
const generateEnergyHistory = () => {
  const hours = [];
  for (let i = 23; i >= 0; i--) {
    const h = new Date(); h.setHours(h.getHours() - i, 0, 0, 0);
    hours.push({ time: h.toISOString(), kwh: +(Math.random() * 2 + 0.5).toFixed(2) });
  }
  return hours;
};
let energyHistory = generateEnergyHistory();

// ─── MQTT Simulation ──────────────────────────────────────────────────────────
setInterval(() => {
  const reading = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    sensors: devices.filter(d => d.status === 'on').map(d => ({
      deviceId: d.id, deviceName: d.name, type: d.type,
      value: d.type === 'thermostat' ? +(d.temperature + (Math.random() - 0.5) * 0.5).toFixed(1)
           : d.type === 'fan' ? d.speed
           : d.power + Math.round((Math.random() - 0.5) * 2),
      unit: d.type === 'thermostat' ? '°C' : 'W'
    }))
  };
  sensorHistory.push(reading);
  if (sensorHistory.length > 100) sensorHistory.shift();
  io.emit('sensor_reading', reading);

  // Randomly update a device state
  const activeDevices = devices.filter(d => d.status === 'on' && d.type === 'thermostat');
  activeDevices.forEach(d => {
    d.temperature = +(d.temperature + (Math.random() - 0.5) * 0.3).toFixed(1);
    io.emit('device_update', d);
  });
}, 3000);

// Automation trigger simulation
setInterval(() => {
  const rule = automationRules.filter(r => r.enabled)[Math.floor(Math.random() * automationRules.filter(r => r.enabled).length)];
  if (rule && Math.random() < 0.1) {
    rule.triggerCount++;
    io.emit('automation_triggered', { ruleId: rule.id, ruleName: rule.name, timestamp: new Date().toISOString() });
  }
}, 10000);

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// ─── Device Routes ────────────────────────────────────────────────────────────
app.get('/api/devices', (req, res) => res.json(devices));

app.put('/api/devices/:id', (req, res) => {
  const idx = devices.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Device not found' });
  devices[idx] = { ...devices[idx], ...req.body };
  io.emit('device_update', devices[idx]);
  res.json(devices[idx]);
});

app.post('/api/devices/:id/control', (req, res) => {
  const idx = devices.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Device not found' });
  const { action, value } = req.body;
  const device = devices[idx];
  if (action === 'toggle') device.status = device.status === 'on' ? 'off' : 'on';
  if (action === 'setBrightness') { device.brightness = value; device.power = Math.round(value * 0.15); }
  if (action === 'setTemperature') device.targetTemp = value;
  if (action === 'setSpeed') { device.speed = value; device.power = value * 15; }
  if (action === 'toggleLock') device.locked = !device.locked;
  if (device.status === 'off') device.power = 0;
  devices[idx] = device;
  io.emit('device_update', device);
  res.json(device);
});

// ─── Automation Routes ────────────────────────────────────────────────────────
app.get('/api/automation-rules', (req, res) => res.json(automationRules));

app.post('/api/automation-rules', (req, res) => {
  const rule = { id: uuidv4(), ...req.body, triggerCount: 0 };
  automationRules.push(rule);
  res.status(201).json(rule);
});

app.put('/api/automation-rules/:id', (req, res) => {
  const idx = automationRules.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  automationRules[idx] = { ...automationRules[idx], ...req.body };
  res.json(automationRules[idx]);
});

app.delete('/api/automation-rules/:id', (req, res) => {
  automationRules = automationRules.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

// ─── Scene Routes ─────────────────────────────────────────────────────────────
app.get('/api/scenes', (req, res) => res.json(Object.entries(scenes).map(([id, s]) => ({ id, ...s }))));

app.post('/api/scenes/:id/activate', (req, res) => {
  const scene = scenes[req.params.id];
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  scene.actions.forEach(({ deviceId, changes }) => {
    const idx = devices.findIndex(d => d.id === deviceId);
    if (idx !== -1) {
      devices[idx] = { ...devices[idx], ...changes };
      io.emit('device_update', devices[idx]);
    }
  });
  res.json({ success: true, scene: req.params.id, activatedAt: new Date().toISOString() });
});

// ─── Energy Routes ────────────────────────────────────────────────────────────
app.get('/api/energy/current', (req, res) => {
  const totalPower = devices.reduce((sum, d) => sum + (d.power || 0), 0);
  res.json({
    totalPower,
    totalKwh: +(totalPower / 1000).toFixed(4),
    costPerHour: +(totalPower / 1000 * 0.12).toFixed(4),
    devices: devices.map(d => ({ id: d.id, name: d.name, power: d.power || 0 }))
  });
});

app.get('/api/energy/history', (req, res) => res.json(energyHistory));

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('initial_state', { devices, automationRules });
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

server.listen(PORT, () => console.log(`Smart Home backend running on port ${PORT}`));
