const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json());

let products = [
  { id: 'p1',  name: 'Wireless Headphones',   category: 'Electronics',   price: 79.99,  stock: 45,  rating: 4.5, image: '🎧', description: 'Premium wireless over-ear headphones with noise cancellation' },
  { id: 'p2',  name: 'Smart Watch',            category: 'Electronics',   price: 199.99, stock: 28,  rating: 4.7, image: '⌚', description: 'Advanced smartwatch with health tracking and GPS' },
  { id: 'p3',  name: 'Running Shoes',          category: 'Sports',        price: 89.99,  stock: 62,  rating: 4.3, image: '👟', description: 'Lightweight running shoes for all terrains' },
  { id: 'p4',  name: 'Coffee Maker',           category: 'Appliances',    price: 49.99,  stock: 33,  rating: 4.1, image: '☕', description: 'Programmable drip coffee maker with thermal carafe' },
  { id: 'p5',  name: 'Yoga Mat',               category: 'Sports',        price: 29.99,  stock: 87,  rating: 4.6, image: '🧘', description: 'Eco-friendly non-slip yoga mat with alignment lines' },
  { id: 'p6',  name: 'Laptop Stand',           category: 'Electronics',   price: 35.99,  stock: 52,  rating: 4.4, image: '💻', description: 'Adjustable aluminum laptop stand for ergonomic setup' },
  { id: 'p7',  name: 'Water Bottle',           category: 'Sports',        price: 19.99,  stock: 120, rating: 4.2, image: '🍶', description: 'Insulated stainless steel water bottle, 32oz' },
  { id: 'p8',  name: 'Desk Organizer',         category: 'Office',        price: 24.99,  stock: 41,  rating: 4.0, image: '🗂', description: 'Bamboo desk organizer with multiple compartments' },
  { id: 'p9',  name: 'Bluetooth Speaker',      category: 'Electronics',   price: 59.99,  stock: 38,  rating: 4.8, image: '🔊', description: 'Portable waterproof Bluetooth speaker' },
  { id: 'p10', name: 'Mechanical Keyboard',    category: 'Electronics',   price: 129.99, stock: 19,  rating: 4.9, image: '⌨️', description: 'TKL mechanical keyboard with RGB backlighting' }
];

app.get('/health', (_, res) => res.json({ status: 'healthy', service: 'product-service', port: PORT }));

app.get('/products', (req, res) => {
  let result = [...products];
  if (req.query.category) result = result.filter(p => p.category === req.query.category);
  if (req.query.search) result = result.filter(p => p.name.toLowerCase().includes(req.query.search.toLowerCase()));
  if (req.query.minPrice) result = result.filter(p => p.price >= +req.query.minPrice);
  if (req.query.maxPrice) result = result.filter(p => p.price <= +req.query.maxPrice);
  res.json(result);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/products', (req, res) => {
  const product = { id: `p${Date.now()}`, ...req.body, rating: 0 };
  products.push(product);
  res.status(201).json(product);
});

app.put('/products/:id', (req, res) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  products[idx] = { ...products[idx], ...req.body };
  res.json(products[idx]);
});

app.delete('/products/:id', (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

app.get('/products/categories/list', (req, res) => {
  const cats = [...new Set(products.map(p => p.category))];
  res.json(cats);
});

app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`));
