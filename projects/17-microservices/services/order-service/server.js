const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3013;

app.use(cors());
app.use(express.json());

let orders = [
  { id: 'o1', userId: 'u1', items: [{ productId: 'p1', quantity: 1, price: 79.99 }], total: 79.99,  status: 'delivered', createdAt: '2024-06-01', shippingAddress: '123 Main St' },
  { id: 'o2', userId: 'u2', items: [{ productId: 'p2', quantity: 1, price: 199.99 }, { productId: 'p5', quantity: 2, price: 29.99 }], total: 259.97, status: 'shipped',  createdAt: '2024-06-10', shippingAddress: '456 Oak Ave' },
  { id: 'o3', userId: 'u3', items: [{ productId: 'p9', quantity: 1, price: 59.99 }], total: 59.99,  status: 'processing', createdAt: '2024-06-15', shippingAddress: '789 Pine Rd' },
  { id: 'o4', userId: 'u4', items: [{ productId: 'p6', quantity: 1, price: 35.99 }, { productId: 'p8', quantity: 1, price: 24.99 }], total: 60.98, status: 'pending',   createdAt: '2024-06-18', shippingAddress: '321 Elm St' },
  { id: 'o5', userId: 'u2', items: [{ productId: 'p10', quantity: 1, price: 129.99 }], total: 129.99, status: 'delivered', createdAt: '2024-05-28', shippingAddress: '456 Oak Ave' }
];

app.get('/health', (_, res) => res.json({ status: 'healthy', service: 'order-service', port: PORT }));

app.get('/orders', (req, res) => {
  const { userId, status } = req.query;
  let result = [...orders];
  if (userId) result = result.filter(o => o.userId === userId);
  if (status) result = result.filter(o => o.status === status);
  res.json(result);
});

app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/orders', (req, res) => {
  const { userId, items, shippingAddress } = req.body;
  if (!userId || !items || !items.length) return res.status(400).json({ error: 'userId and items are required' });
  const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
  const order = {
    id: `o${Date.now()}`, userId, items, total: +total.toFixed(2),
    status: 'pending', createdAt: new Date().toISOString().split('T')[0],
    shippingAddress: shippingAddress || 'N/A'
  };
  orders.push(order);
  res.status(201).json(order);
});

app.put('/orders/:id/status', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  orders[idx].status = status;
  res.json(orders[idx]);
});

app.get('/orders/analytics/summary', (req, res) => {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const byStatus = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});
  res.json({ totalOrders: orders.length, totalRevenue: +totalRevenue.toFixed(2), byStatus });
});

app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
