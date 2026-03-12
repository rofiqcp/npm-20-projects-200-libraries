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
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// ─── In-Memory Data ───────────────────────────────────────────────────────────
let shipments = [
  { id: 's1',  trackingId: 'TRK-001', origin: 'Shanghai, CN',      destination: 'Los Angeles, US', status: 'in_transit',  lat: 35.2,   lng: 170.5, carrier: 'OceanFreight Co', weight: 2400, eta: '2024-07-10', progress: 62 },
  { id: 's2',  trackingId: 'TRK-002', origin: 'Rotterdam, NL',     destination: 'New York, US',    status: 'in_transit',  lat: 47.8,   lng: -35.2, carrier: 'Atlantic Lines',  weight: 850,  eta: '2024-06-28', progress: 78 },
  { id: 's3',  trackingId: 'TRK-003', origin: 'Mumbai, IN',        destination: 'Dubai, AE',       status: 'delivered',   lat: 25.2,   lng: 55.3,  carrier: 'IndoArabia Ship', weight: 1200, eta: '2024-06-20', progress: 100 },
  { id: 's4',  trackingId: 'TRK-004', origin: 'Guangzhou, CN',     destination: 'Hamburg, DE',     status: 'in_transit',  lat: 28.5,   lng: 90.2,  carrier: 'EuroAsia Lines',  weight: 3100, eta: '2024-07-15', progress: 35 },
  { id: 's5',  trackingId: 'TRK-005', origin: 'Chicago, US',       destination: 'Toronto, CA',     status: 'out_for_delivery', lat: 43.5, lng: -79.8, carrier: 'FedEx Ground', weight: 45, eta: '2024-06-22', progress: 90 },
  { id: 's6',  trackingId: 'TRK-006', origin: 'Tokyo, JP',         destination: 'Sydney, AU',      status: 'customs',     lat: 20.3,   lng: 155.8, carrier: 'Pacific Airways', weight: 380,  eta: '2024-06-25', progress: 55 },
  { id: 's7',  trackingId: 'TRK-007', origin: 'São Paulo, BR',     destination: 'Lisbon, PT',      status: 'in_transit',  lat: 15.0,   lng: -30.5, carrier: 'Trans-Atlantic', weight: 700,  eta: '2024-06-30', progress: 48 },
  { id: 's8',  trackingId: 'TRK-008', origin: 'Cairo, EG',         destination: 'London, UK',      status: 'processing',  lat: 30.0,   lng: 31.2,  carrier: 'MedShip',         weight: 290,  eta: '2024-07-05', progress: 15 },
  { id: 's9',  trackingId: 'TRK-009', origin: 'Singapore, SG',     destination: 'Vancouver, CA',   status: 'in_transit',  lat: 22.0,   lng: 130.0, carrier: 'Pacific Trade',   weight: 1800, eta: '2024-07-12', progress: 42 },
  { id: 's10', trackingId: 'TRK-010', origin: 'Nairobi, KE',       destination: 'Brussels, BE',    status: 'in_transit',  lat: 10.0,   lng: 18.5,  carrier: 'AfriEuro Cargo',  weight: 560,  eta: '2024-07-08', progress: 58 },
  { id: 's11', trackingId: 'TRK-011', origin: 'Seoul, KR',         destination: 'Chicago, US',     status: 'delayed',     lat: 40.2,   lng: -155.0, carrier: 'Korean Air Cargo', weight: 420, eta: '2024-07-03', progress: 45 },
  { id: 's12', trackingId: 'TRK-012', origin: 'Frankfurt, DE',     destination: 'Moscow, RU',      status: 'in_transit',  lat: 52.5,   lng: 40.3,  carrier: 'EuroRail',        weight: 980,  eta: '2024-06-27', progress: 70 },
  { id: 's13', trackingId: 'TRK-013', origin: 'Mexico City, MX',   destination: 'Houston, US',     status: 'delivered',   lat: 25.8,   lng: -97.4, carrier: 'BorderEx',        weight: 660,  eta: '2024-06-21', progress: 100 },
  { id: 's14', trackingId: 'TRK-014', origin: 'Jakarta, ID',       destination: 'Perth, AU',       status: 'in_transit',  lat: -15.0,  lng: 110.5, carrier: 'SEA Freight',     weight: 2200, eta: '2024-07-06', progress: 55 },
  { id: 's15', trackingId: 'TRK-015', origin: 'Cape Town, ZA',     destination: 'Amsterdam, NL',   status: 'in_transit',  lat: -5.0,   lng: 0.0,   carrier: 'Cape Lines',      weight: 1500, eta: '2024-07-18', progress: 28 }
];

let warehouses = [
  { id: 'w1', name: 'Los Angeles Hub',  location: 'Los Angeles, US', lat: 34.0,  lng: -118.2, capacity: 10000, used: 7234, products: [{ name: 'Electronics', qty: 3400 }, { name: 'Apparel', qty: 2100 }, { name: 'Furniture', qty: 1734 }] },
  { id: 'w2', name: 'Rotterdam Port',   location: 'Rotterdam, NL',   lat: 51.9,  lng: 4.5,   capacity: 15000, used: 9876, products: [{ name: 'Machinery',   qty: 4500 }, { name: 'Chemicals', qty: 3200 }, { name: 'Food',      qty: 2176 }] },
  { id: 'w3', name: 'Singapore Hub',    location: 'Singapore, SG',   lat: 1.3,   lng: 103.8, capacity: 8000,  used: 5120, products: [{ name: 'Electronics', qty: 2800 }, { name: 'Rubber',    qty: 1500 }, { name: 'Steel',     qty: 820  }] },
  { id: 'w4', name: 'Chicago Center',   location: 'Chicago, US',     lat: 41.9,  lng: -87.6, capacity: 12000, used: 8100, products: [{ name: 'Auto Parts', qty: 4000 }, { name: 'Food',      qty: 2500 }, { name: 'Pharma',    qty: 1600 }] },
  { id: 'w5', name: 'Dubai Logistics',  location: 'Dubai, AE',       lat: 25.2,  lng: 55.3,  capacity: 9500,  used: 6200, products: [{ name: 'Luxury',     qty: 2800 }, { name: 'Oil Equip', qty: 1900 }, { name: 'Textiles',  qty: 1500 }] }
];

// ─── GPS Simulation ───────────────────────────────────────────────────────────
setInterval(() => {
  const activeShipments = shipments.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery');
  if (activeShipments.length === 0) return;

  const updated = activeShipments[Math.floor(Math.random() * activeShipments.length)];
  const idx = shipments.findIndex(s => s.id === updated.id);

  shipments[idx].lat  = +(updated.lat  + (Math.random() - 0.5) * 0.5).toFixed(4);
  shipments[idx].lng  = +(updated.lng  + (Math.random() - 0.5) * 0.5).toFixed(4);
  shipments[idx].progress = Math.min(100, +(updated.progress + Math.random() * 0.3).toFixed(1));

  io.emit('shipment_location_update', { id: updated.id, lat: shipments[idx].lat, lng: shipments[idx].lng, progress: shipments[idx].progress });

  // Delivery alert when progress near 100
  if (shipments[idx].progress >= 98 && shipments[idx].status === 'in_transit') {
    shipments[idx].status = 'delivered';
    io.emit('delivery_alert', { shipmentId: updated.id, trackingId: updated.trackingId, message: 'Package delivered!' });
  }
}, 3000);

// ─── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/shipments', (req, res) => {
  const { status, search } = req.query;
  let result = [...shipments];
  if (status && status !== 'all') result = result.filter(s => s.status === status);
  if (search) result = result.filter(s =>
    s.trackingId.toLowerCase().includes(search.toLowerCase()) ||
    s.origin.toLowerCase().includes(search.toLowerCase()) ||
    s.destination.toLowerCase().includes(search.toLowerCase())
  );
  res.json(result);
});

app.get('/api/shipments/:id', (req, res) => {
  const s = shipments.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Shipment not found' });
  res.json(s);
});

app.post('/api/shipments', (req, res) => {
  const shipment = {
    id: uuidv4(), trackingId: `TRK-${Math.floor(Math.random() * 9000) + 1000}`,
    ...req.body, status: 'processing', progress: 0,
    lat: 0, lng: 0
  };
  shipments.push(shipment);
  res.status(201).json(shipment);
});

app.put('/api/shipments/:id/status', (req, res) => {
  const idx = shipments.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Shipment not found' });
  shipments[idx].status = req.body.status;
  io.emit('shipment_location_update', shipments[idx]);
  res.json(shipments[idx]);
});

app.get('/api/warehouses', (_, res) => res.json(warehouses));

app.get('/api/analytics', (_, res) => {
  const byStatus = shipments.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {});
  const totalWeight = shipments.reduce((s, sh) => s + (sh.weight || 0), 0);
  const deliveryRate = ((byStatus.delivered || 0) / shipments.length * 100).toFixed(1);
  const avgProgress = (shipments.reduce((s, sh) => s + sh.progress, 0) / shipments.length).toFixed(1);

  res.json({ totalShipments: shipments.length, byStatus, totalWeight, deliveryRate, avgProgress,
    monthly: ['Jan','Feb','Mar','Apr','May','Jun'].map(m => ({
      month: m, shipped: Math.round(80 + Math.random() * 40), delivered: Math.round(70 + Math.random() * 40)
    }))
  });
});

app.get('/api/route-optimize/:id', (req, res) => {
  const s = shipments.find(s => s.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  const waypoints = [
    { lat: s.lat, lng: s.lng, label: 'Current' },
    { lat: (s.lat + 5), lng: (s.lng + 10), label: 'Waypoint 1' },
    { lat: (s.lat + 12), lng: (s.lng + 25), label: 'Waypoint 2' },
    { lat: 34.0, lng: -118.2, label: s.destination }
  ].sort((a, b) => a.lat - b.lat);
  res.json({ waypoints, estimatedSavings: '12%', optimizedEta: s.eta });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.emit('initial_state', { shipments });
  socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

server.listen(PORT, () => console.log(`Supply Chain backend on port ${PORT}`));
