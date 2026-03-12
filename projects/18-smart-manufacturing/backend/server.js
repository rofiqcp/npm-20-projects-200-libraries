require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// ─── In-Memory Data ───────────────────────────────────────────────────────────
let machines = [
  { id: 'm1', name: 'CNC Mill A',       type: 'CNC Mill',       status: 'running',     temperature: 65, vibration: 2.1, power: 18.5, oeeScore: 87, availability: 92, performance: 96, quality: 98, lastMaintenance: '2024-05-15', nextMaintenance: '2024-07-15', cycleTime: 42 },
  { id: 'm2', name: 'Lathe B',           type: 'Lathe',          status: 'running',     temperature: 72, vibration: 3.4, power: 22.0, oeeScore: 82, availability: 88, performance: 94, quality: 99, lastMaintenance: '2024-04-20', nextMaintenance: '2024-06-20', cycleTime: 35 },
  { id: 'm3', name: 'Press C',           type: 'Hydraulic Press', status: 'idle',       temperature: 38, vibration: 0.5, power: 4.2,  oeeScore: 91, availability: 95, performance: 97, quality: 99, lastMaintenance: '2024-06-01', nextMaintenance: '2024-08-01', cycleTime: 28 },
  { id: 'm4', name: 'Welder D',          type: 'Robotic Welder', status: 'running',     temperature: 310, vibration: 1.8, power: 35.0, oeeScore: 78, availability: 84, performance: 93, quality: 100, lastMaintenance: '2024-03-10', nextMaintenance: '2024-06-10', cycleTime: 65 },
  { id: 'm5', name: 'Conveyor E',        type: 'Conveyor Belt',  status: 'running',     temperature: 42, vibration: 1.2, power: 8.5,  oeeScore: 95, availability: 98, performance: 99, quality: 98, lastMaintenance: '2024-06-10', nextMaintenance: '2024-09-10', cycleTime: 12 },
  { id: 'm6', name: 'Grinder F',         type: 'Surface Grinder', status: 'maintenance', temperature: 55, vibration: 5.8, power: 0,    oeeScore: 70, availability: 75, performance: 96, quality: 97, lastMaintenance: '2024-06-18', nextMaintenance: '2024-06-25', cycleTime: 55 },
  { id: 'm7', name: 'Drill Press G',     type: 'Drill Press',    status: 'running',     temperature: 58, vibration: 2.9, power: 12.0, oeeScore: 89, availability: 93, performance: 97, quality: 98, lastMaintenance: '2024-05-28', nextMaintenance: '2024-07-28', cycleTime: 30 },
  { id: 'm8', name: 'Injection Mold H',  type: 'Injection Mold', status: 'error',       temperature: 185, vibration: 4.1, power: 45.0, oeeScore: 65, availability: 70, performance: 95, quality: 97, lastMaintenance: '2024-04-15', nextMaintenance: '2024-06-15', cycleTime: 90 }
];

let productionOrders = [
  { id: 'po1', partName: 'Shaft Assembly',    machineId: 'm1', quantity: 500, completed: 312, status: 'in_progress', priority: 'high',   startDate: '2024-06-15', dueDate: '2024-06-30' },
  { id: 'po2', partName: 'Gear Housing',      machineId: 'm2', quantity: 200, completed: 198, status: 'in_progress', priority: 'medium', startDate: '2024-06-10', dueDate: '2024-06-25' },
  { id: 'po3', partName: 'Bracket Set',       machineId: 'm3', quantity: 1000, completed: 0,  status: 'scheduled',   priority: 'low',    startDate: '2024-07-01', dueDate: '2024-07-20' },
  { id: 'po4', partName: 'Frame Weld',        machineId: 'm4', quantity: 150, completed: 89,  status: 'in_progress', priority: 'high',   startDate: '2024-06-18', dueDate: '2024-06-28' },
  { id: 'po5', partName: 'Conveyor Rollers',  machineId: 'm5', quantity: 300, completed: 300, status: 'completed',   priority: 'medium', startDate: '2024-06-01', dueDate: '2024-06-20' },
  { id: 'po6', partName: 'Precision Parts',   machineId: 'm7', quantity: 800, completed: 445, status: 'in_progress', priority: 'high',   startDate: '2024-06-12', dueDate: '2024-07-05' }
];

let alerts = [
  { id: 'a1', machineId: 'm8', machineName: 'Injection Mold H', type: 'error',   message: 'Temperature sensor reading abnormal (185°C)', timestamp: new Date(Date.now()-120000).toISOString(), acknowledged: false },
  { id: 'a2', machineId: 'm6', machineName: 'Grinder F',        type: 'warning', message: 'High vibration detected — maintenance in progress', timestamp: new Date(Date.now()-300000).toISOString(), acknowledged: true },
  { id: 'a3', machineId: 'm4', machineName: 'Welder D',         type: 'warning', message: 'OEE below threshold (78%)', timestamp: new Date(Date.now()-600000).toISOString(), acknowledged: false }
];

const sensorHistory = {};
machines.forEach(m => { sensorHistory[m.id] = []; });

// ─── Sensor Simulation ────────────────────────────────────────────────────────
setInterval(() => {
  machines.forEach(machine => {
    if (machine.status === 'maintenance') return;

    const drift = (base, range) => +(base + (Math.random() - 0.5) * range).toFixed(1);
    machine.temperature = drift(machine.temperature, machine.status === 'running' ? 2 : 0.5);
    machine.vibration   = Math.max(0, drift(machine.vibration, 0.3));
    machine.power       = machine.status === 'running' ? Math.max(0, drift(machine.power, 1.5)) : 0;

    // Check thresholds
    if (machine.temperature > 300 && machine.type !== 'Robotic Welder' && machine.type !== 'Injection Mold') {
      const alert = { id: uuidv4(), machineId: machine.id, machineName: machine.name, type: 'warning',
        message: `High temperature: ${machine.temperature}°C`, timestamp: new Date().toISOString(), acknowledged: false };
      alerts.unshift(alert);
      if (alerts.length > 50) alerts.pop();
      io.emit('alert_generated', alert);
    }

    const reading = { timestamp: new Date().toISOString(), temperature: machine.temperature, vibration: machine.vibration, power: machine.power };
    sensorHistory[machine.id].push(reading);
    if (sensorHistory[machine.id].length > 20) sensorHistory[machine.id].shift();

    io.emit('machine_update', machine);
  });
}, 2000);

// ─── OEE Calculation ─────────────────────────────────────────────────────────
const calculateOEE = () => {
  const avgAvail = machines.reduce((s, m) => s + m.availability, 0) / machines.length;
  const avgPerf  = machines.reduce((s, m) => s + m.performance, 0) / machines.length;
  const avgQual  = machines.reduce((s, m) => s + m.quality, 0) / machines.length;
  return {
    overall: +((avgAvail / 100) * (avgPerf / 100) * (avgQual / 100) * 100).toFixed(1),
    availability: +avgAvail.toFixed(1), performance: +avgPerf.toFixed(1), quality: +avgQual.toFixed(1),
    byMachine: machines.map(m => ({ id: m.id, name: m.name, oee: m.oeeScore }))
  };
};

// ─── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/machines', (_, res) => res.json(machines));

app.get('/api/machines/:id', (req, res) => {
  const m = machines.find(m => m.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Machine not found' });
  res.json({ ...m, history: sensorHistory[m.id] || [] });
});

app.put('/api/machines/:id/status', (req, res) => {
  const idx = machines.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Machine not found' });
  machines[idx].status = req.body.status;
  io.emit('machine_update', machines[idx]);
  res.json(machines[idx]);
});

app.get('/api/production-orders', (_, res) => res.json(productionOrders));

app.post('/api/production-orders', (req, res) => {
  const order = { id: `po${Date.now()}`, ...req.body, completed: 0, status: 'scheduled' };
  productionOrders.push(order);
  res.status(201).json(order);
});

app.put('/api/production-orders/:id', (req, res) => {
  const idx = productionOrders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  productionOrders[idx] = { ...productionOrders[idx], ...req.body };
  res.json(productionOrders[idx]);
});

app.get('/api/oee', (_, res) => res.json(calculateOEE()));

app.get('/api/alerts', (_, res) => res.json(alerts));

app.put('/api/alerts/:id/acknowledge', (req, res) => {
  const idx = alerts.findIndex(a => a.id === req.params.id);
  if (idx !== -1) alerts[idx].acknowledged = true;
  res.json(alerts[idx] || { error: 'Alert not found' });
});

app.get('/api/sensor-history/:machineId', (req, res) => {
  res.json(sensorHistory[req.params.machineId] || []);
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.emit('initial_state', { machines, productionOrders, alerts });
  socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

server.listen(PORT, () => console.log(`Smart Manufacturing backend on port ${PORT}`));
