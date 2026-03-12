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
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// ─── In-Memory Data ───────────────────────────────────────────────────────────
let buildings = [
  { id: 'b1', name: 'HQ Tower',        type: 'Office',      floors: 28, area: 45000, consumption: 1850, solar: 280, wind: 0,   grid: 1570, efficiency: 'B', targetKwh: 1700, co2Rate: 0.45 },
  { id: 'b2', name: 'Research Campus', type: 'R&D',         floors: 6,  area: 22000, consumption: 920,  solar: 420, wind: 150, grid: 350,  efficiency: 'A', targetKwh: 900,  co2Rate: 0.45 },
  { id: 'b3', name: 'Warehouse Alpha', type: 'Industrial',  floors: 3,  area: 80000, consumption: 3200, solar: 800, wind: 200, grid: 2200, efficiency: 'C', targetKwh: 2800, co2Rate: 0.45 },
  { id: 'b4', name: 'Data Center',     type: 'Data Center', floors: 4,  area: 8000,  consumption: 5400, solar: 0,   wind: 0,   grid: 5400, efficiency: 'D', targetKwh: 5000, co2Rate: 0.45 },
  { id: 'b5', name: 'Retail Park',     type: 'Retail',      floors: 2,  area: 35000, consumption: 1100, solar: 350, wind: 80,  grid: 670,  efficiency: 'A', targetKwh: 1000, co2Rate: 0.45 }
];

let alerts = [
  { id: 'al1', buildingId: 'b4', buildingName: 'Data Center', type: 'critical', message: 'Consumption 8% above monthly target', timestamp: new Date(Date.now()-180000).toISOString(), acknowledged: false },
  { id: 'al2', buildingId: 'b3', buildingName: 'Warehouse Alpha', type: 'warning', message: 'Solar output 15% below forecast', timestamp: new Date(Date.now()-600000).toISOString(), acknowledged: false }
];

const energyHistory = {};
buildings.forEach(b => {
  energyHistory[b.id] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    consumption: +(b.consumption / 24 + (Math.random() - 0.5) * 80).toFixed(1),
    solar: +(b.solar / 24 * (i >= 6 && i <= 18 ? 2 : 0.1) * (0.8 + Math.random() * 0.4)).toFixed(1),
    wind: +(b.wind / 24 * (0.6 + Math.random() * 0.8)).toFixed(1)
  }));
});

const CARBON_FACTOR = 0.45; // kg CO2/kWh for grid

// ─── Real-Time Simulation ─────────────────────────────────────────────────────
setInterval(() => {
  const hour = new Date().getHours();
  const isDaytime = hour >= 7 && hour <= 19;

  buildings.forEach(b => {
    const prevConsumption = b.consumption;
    b.consumption = Math.max(100, +(b.consumption + (Math.random() - 0.5) * 50).toFixed(0));
    b.solar = isDaytime ? Math.max(0, +(b.solar + (Math.random() - 0.5) * 20).toFixed(0)) : Math.round(b.solar * 0.05);
    b.wind  = Math.max(0, +(b.wind + (Math.random() - 0.5) * 15).toFixed(0));
    b.grid  = Math.max(0, b.consumption - b.solar - b.wind);

    const reading = {
      buildingId: b.id,
      timestamp: new Date().toISOString(),
      consumption: b.consumption,
      solar: b.solar,
      wind: b.wind,
      grid: b.grid,
      renewablePct: b.consumption > 0 ? +((b.solar + b.wind) / b.consumption * 100).toFixed(1) : 0
    };
    io.emit('energy_reading', reading);

    // Check thresholds
    if (b.consumption > b.targetKwh * 1.1 && prevConsumption <= b.targetKwh * 1.1) {
      const alert = {
        id: uuidv4(), buildingId: b.id, buildingName: b.name, type: 'warning',
        message: `Consumption ${Math.round((b.consumption / b.targetKwh - 1) * 100)}% above target`,
        timestamp: new Date().toISOString(), acknowledged: false
      };
      alerts.unshift(alert);
      if (alerts.length > 30) alerts.pop();
      io.emit('alert_generated', alert);
    }
  });
}, 4000);

// ─── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/buildings', (_, res) => res.json(buildings));

app.get('/api/buildings/:id', (req, res) => {
  const b = buildings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Building not found' });
  res.json({ ...b, history: energyHistory[b.id] || [] });
});

app.get('/api/energy/current', (_, res) => {
  const totalConsumption = buildings.reduce((s, b) => s + b.consumption, 0);
  const totalSolar       = buildings.reduce((s, b) => s + b.solar, 0);
  const totalWind        = buildings.reduce((s, b) => s + b.wind, 0);
  const totalGrid        = buildings.reduce((s, b) => s + b.grid, 0);
  const renewablePct     = totalConsumption > 0 ? +((totalSolar + totalWind) / totalConsumption * 100).toFixed(1) : 0;

  res.json({
    totalConsumption, totalSolar, totalWind, totalGrid, renewablePct,
    costPerHour: +(totalGrid / 1000 * 0.12).toFixed(2),
    co2PerHour: +(totalGrid / 1000 * CARBON_FACTOR).toFixed(2),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/energy/history', (req, res) => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = new Date(); h.setHours(h.getHours() - 23 + i, 0, 0, 0);
    const totalC = buildings.reduce((s, b) => s + (energyHistory[b.id]?.[i]?.consumption || 0), 0);
    const totalS = buildings.reduce((s, b) => s + (energyHistory[b.id]?.[i]?.solar || 0), 0);
    const totalW = buildings.reduce((s, b) => s + (energyHistory[b.id]?.[i]?.wind || 0), 0);
    return { time: h.toISOString(), consumption: +totalC.toFixed(0), solar: +totalS.toFixed(0), wind: +totalW.toFixed(0), grid: Math.max(0, +(totalC - totalS - totalW).toFixed(0)) };
  });
  res.json(hours);
});

app.get('/api/alerts', (_, res) => res.json(alerts));

app.put('/api/alerts/:id/acknowledge', (req, res) => {
  const idx = alerts.findIndex(a => a.id === req.params.id);
  if (idx !== -1) alerts[idx].acknowledged = true;
  res.json(alerts[idx] || { error: 'Not found' });
});

app.get('/api/sustainability', (_, res) => {
  const totalMonthlyGrid = buildings.reduce((s, b) => s + b.grid * 24 * 30, 0);
  const totalMonthlyRenewable = buildings.reduce((s, b) => s + (b.solar + b.wind) * 24 * 30, 0);
  const totalConsumption = totalMonthlyGrid + totalMonthlyRenewable;
  const renewablePct = totalConsumption > 0 ? +((totalMonthlyRenewable / totalConsumption) * 100).toFixed(1) : 0;
  const co2Saved = +(totalMonthlyRenewable / 1000 * CARBON_FACTOR).toFixed(1);
  const co2Emitted = +(totalMonthlyGrid / 1000 * CARBON_FACTOR).toFixed(1);
  const sustainabilityScore = Math.min(100, Math.round(renewablePct + (buildings.filter(b => b.efficiency === 'A').length / buildings.length) * 20));

  res.json({
    renewablePct, co2Saved, co2Emitted, sustainabilityScore,
    monthlyCost: +(totalMonthlyGrid / 1000 * 0.12).toFixed(0),
    treesEquivalent: Math.round(co2Saved / 21),
    efficiencyDistribution: buildings.reduce((acc, b) => { acc[b.efficiency] = (acc[b.efficiency] || 0) + 1; return acc; }, {})
  });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.emit('initial_state', { buildings, alerts });
  socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

server.listen(PORT, () => console.log(`Energy Management backend on port ${PORT}`));
