const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3011;
const JWT_SECRET = 'microservices-secret';

app.use(cors());
app.use(express.json());

let users = [
  { id: 'u1', name: 'Alice Johnson',  email: 'alice@example.com',  password: bcrypt.hashSync('password123', 10), role: 'admin',    createdAt: '2024-01-15' },
  { id: 'u2', name: 'Bob Smith',      email: 'bob@example.com',    password: bcrypt.hashSync('password123', 10), role: 'customer', createdAt: '2024-02-20' },
  { id: 'u3', name: 'Carol White',    email: 'carol@example.com',  password: bcrypt.hashSync('password123', 10), role: 'customer', createdAt: '2024-03-10' },
  { id: 'u4', name: 'David Lee',      email: 'david@example.com',  password: bcrypt.hashSync('password123', 10), role: 'customer', createdAt: '2024-04-05' },
  { id: 'u5', name: 'Emma Wilson',    email: 'emma@example.com',   password: bcrypt.hashSync('password123', 10), role: 'vendor',   createdAt: '2024-05-01' }
];

app.get('/health', (_, res) => res.json({ status: 'healthy', service: 'user-service', port: PORT }));

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...safe } = user;
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: safe });
});

app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already registered' });
  const user = { id: `u${Date.now()}`, name, email, password: bcrypt.hashSync(password, 10), role: 'customer', createdAt: new Date().toISOString().split('T')[0] };
  users.push(user);
  const { password: _, ...safe } = user;
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token, user: safe });
});

app.get('/users', (_, res) => res.json(users.map(({ password, ...u }) => u)));

app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

app.put('/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users[idx] = { ...users[idx], ...req.body, id: users[idx].id };
  const { password, ...safe } = users[idx];
  res.json(safe);
});

app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
