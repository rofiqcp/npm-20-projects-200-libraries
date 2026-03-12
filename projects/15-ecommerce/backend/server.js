require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// ─── In-Memory Database ───────────────────────────────────────────────────────
const db = {
  users: [
    { id: 1, email: 'admin@shop.com', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', firstName: 'Admin', lastName: 'User', role: 'admin', createdAt: new Date('2024-01-01') },
    { id: 2, email: 'user@shop.com', password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', firstName: 'John', lastName: 'Doe', role: 'user', createdAt: new Date('2024-02-01') }
  ],
  products: [
    { id: 1, name: 'MacBook Pro 14"', description: 'Apple MacBook Pro with M3 chip, 16GB RAM, 512GB SSD', price: 1999.99, stock: 15, category: 'Electronics', images: ['https://via.placeholder.com/400x300/1a1a2e/white?text=MacBook+Pro'], rating: 4.8, reviewsCount: 124 },
    { id: 2, name: 'Sony WH-1000XM5', description: 'Industry-leading noise-canceling wireless headphones', price: 349.99, stock: 32, category: 'Electronics', images: ['https://via.placeholder.com/400x300/16213e/white?text=Sony+Headphones'], rating: 4.7, reviewsCount: 89 },
    { id: 3, name: 'iPhone 15 Pro', description: 'Apple iPhone 15 Pro with A17 Pro chip, titanium design', price: 1099.99, stock: 28, category: 'Electronics', images: ['https://via.placeholder.com/400x300/0f3460/white?text=iPhone+15+Pro'], rating: 4.9, reviewsCount: 256 },
    { id: 4, name: 'Samsung 4K Monitor', description: '27" 4K UHD IPS monitor with HDR600', price: 599.99, stock: 20, category: 'Electronics', images: ['https://via.placeholder.com/400x300/533483/white?text=Samsung+Monitor'], rating: 4.6, reviewsCount: 67 },
    { id: 5, name: 'Mechanical Keyboard', description: 'TKL mechanical keyboard with Cherry MX switches', price: 129.99, stock: 45, category: 'Electronics', images: ['https://via.placeholder.com/400x300/e94560/white?text=Keyboard'], rating: 4.5, reviewsCount: 203 },
    { id: 6, name: 'Premium Cotton T-Shirt', description: '100% organic cotton, available in 8 colors', price: 29.99, stock: 150, category: 'Clothing', images: ['https://via.placeholder.com/400x300/2d6a4f/white?text=T-Shirt'], rating: 4.3, reviewsCount: 88 },
    { id: 7, name: 'Slim Fit Jeans', description: 'Classic slim fit jeans in premium denim', price: 69.99, stock: 80, category: 'Clothing', images: ['https://via.placeholder.com/400x300/1b4332/white?text=Jeans'], rating: 4.4, reviewsCount: 115 },
    { id: 8, name: 'Running Sneakers', description: 'Lightweight running shoes with responsive cushioning', price: 119.99, stock: 60, category: 'Clothing', images: ['https://via.placeholder.com/400x300/40916c/white?text=Sneakers'], rating: 4.6, reviewsCount: 178 },
    { id: 9, name: 'JavaScript: The Definitive Guide', description: 'Comprehensive JavaScript reference by David Flanagan', price: 49.99, stock: 35, category: 'Books', images: ['https://via.placeholder.com/400x300/d62828/white?text=JS+Book'], rating: 4.7, reviewsCount: 445 },
    { id: 10, name: 'Clean Code', description: 'A Handbook of Agile Software Craftsmanship by Robert Martin', price: 39.99, stock: 50, category: 'Books', images: ['https://via.placeholder.com/400x300/f77f00/white?text=Clean+Code'], rating: 4.8, reviewsCount: 892 },
    { id: 11, name: 'Design Patterns', description: 'Elements of Reusable Object-Oriented Software (Gang of Four)', price: 44.99, stock: 28, category: 'Books', images: ['https://via.placeholder.com/400x300/fcbf49/white?text=Design+Patterns'], rating: 4.6, reviewsCount: 334 },
    { id: 12, name: 'Smart LED Desk Lamp', description: 'Adjustable brightness and color temperature, USB-C charging', price: 59.99, stock: 40, category: 'Home', images: ['https://via.placeholder.com/400x300/eae2b7/333?text=Desk+Lamp'], rating: 4.5, reviewsCount: 156 },
    { id: 13, name: 'Ergonomic Office Chair', description: 'Lumbar support, adjustable armrests, breathable mesh', price: 349.99, stock: 12, category: 'Home', images: ['https://via.placeholder.com/400x300/003049/white?text=Office+Chair'], rating: 4.7, reviewsCount: 267 },
    { id: 14, name: 'Standing Desk Converter', description: 'Adjustable height desk riser for dual monitors', price: 189.99, stock: 18, category: 'Home', images: ['https://via.placeholder.com/400x300/606c38/white?text=Desk+Converter'], rating: 4.4, reviewsCount: 89 },
    { id: 15, name: 'Coffee Maker Pro', description: 'Programmable 12-cup coffee maker with thermal carafe', price: 79.99, stock: 55, category: 'Home', images: ['https://via.placeholder.com/400x300/283618/white?text=Coffee+Maker'], rating: 4.3, reviewsCount: 201 },
    { id: 16, name: 'Yoga Mat Premium', description: 'Non-slip 6mm thick yoga mat with carrying strap', price: 34.99, stock: 90, category: 'Sports', images: ['https://via.placeholder.com/400x300/bc6c25/white?text=Yoga+Mat'], rating: 4.5, reviewsCount: 312 },
    { id: 17, name: 'Resistance Bands Set', description: 'Set of 5 resistance bands with handles and door anchor', price: 24.99, stock: 120, category: 'Sports', images: ['https://via.placeholder.com/400x300/dda15e/333?text=Resistance+Bands'], rating: 4.4, reviewsCount: 445 },
    { id: 18, name: 'Smart Water Bottle', description: 'Tracks hydration, LED reminder, insulated stainless steel', price: 44.99, stock: 75, category: 'Sports', images: ['https://via.placeholder.com/400x300/606c38/white?text=Water+Bottle'], rating: 4.3, reviewsCount: 167 },
    { id: 19, name: 'Wireless Gaming Mouse', description: 'Lightweight wireless gaming mouse, 25K DPI sensor', price: 89.99, stock: 38, category: 'Electronics', images: ['https://via.placeholder.com/400x300/370617/white?text=Gaming+Mouse'], rating: 4.7, reviewsCount: 289 },
    { id: 20, name: 'Protein Powder Whey', description: 'Premium whey protein, 25g per serving, vanilla flavor', price: 54.99, stock: 65, category: 'Sports', images: ['https://via.placeholder.com/400x300/6a994e/white?text=Protein+Powder'], rating: 4.6, reviewsCount: 523 }
  ],
  orders: [],
  reviews: [],
  wishlists: [],
  nextOrderId: 1
};

// password for all demo users: "password123"
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-secret-key-2024';

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
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = { id: db.users.length + 1, email, password: hash, firstName, lastName, role: 'user', createdAt: new Date() };
    db.users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Products Routes ──────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  let products = [...db.products];
  const { search, category, minPrice, maxPrice, sort } = req.query;
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
  if (category && category !== 'All') products = products.filter(p => p.category === category);
  if (minPrice) products = products.filter(p => p.price >= parseFloat(minPrice));
  if (maxPrice) products = products.filter(p => p.price <= parseFloat(maxPrice));
  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  res.json({ products, total: products.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const reviews = db.reviews.filter(r => r.productId === product.id);
  res.json({ ...product, reviews });
});

app.post('/api/products', authMiddleware, (req, res) => {
  const product = { id: db.products.length + 1, ...req.body, rating: 0, reviewsCount: 0, createdAt: new Date() };
  db.products.push(product);
  res.status(201).json(product);
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
  const idx = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.products[idx] = { ...db.products[idx], ...req.body };
  res.json(db.products[idx]);
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
  const idx = db.products.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.products.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
app.post('/api/products/:id/reviews', authMiddleware, (req, res) => {
  const { rating, comment } = req.body;
  const review = { id: db.reviews.length + 1, productId: parseInt(req.params.id), userId: req.user.id, rating, comment, createdAt: new Date() };
  db.reviews.push(review);
  const product = db.products.find(p => p.id === review.productId);
  if (product) { product.reviewsCount++; product.rating = ((product.rating * (product.reviewsCount - 1)) + rating) / product.reviewsCount; }
  res.status(201).json(review);
});

// ─── Orders Routes ────────────────────────────────────────────────────────────
app.get('/api/orders', authMiddleware, (req, res) => {
  const userOrders = db.orders.filter(o => o.userId === req.user.id);
  res.json(userOrders);
});

app.post('/api/orders', authMiddleware, (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  const totalAmount = items.reduce((sum, item) => {
    const product = db.products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const order = {
    id: db.nextOrderId++,
    userId: req.user.id,
    items,
    totalAmount: totalAmount.toFixed(2),
    status: 'pending',
    shippingAddress,
    paymentMethod,
    createdAt: new Date()
  };
  db.orders.push(order);
  // Update stock
  items.forEach(item => {
    const product = db.products.find(p => p.id === item.productId);
    if (product) product.stock = Math.max(0, product.stock - item.quantity);
  });
  res.status(201).json(order);
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const order = db.orders.find(o => o.id === parseInt(req.params.id) && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// ─── Payment (Mock Stripe) ────────────────────────────────────────────────────
app.post('/api/payments/intent', authMiddleware, (req, res) => {
  const { amount } = req.body;
  // Mock payment intent
  res.json({
    clientSecret: `mock_pi_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
    amount,
    currency: 'usd',
    status: 'requires_payment_method'
  });
});

app.post('/api/payments/confirm', authMiddleware, (req, res) => {
  const { orderId, paymentIntentId } = req.body;
  const order = db.orders.find(o => o.id === parseInt(orderId));
  if (order) {
    order.status = 'paid';
    order.paymentIntentId = paymentIntentId;
    order.paidAt = new Date();
  }
  res.json({ success: true, message: 'Payment confirmed (mock)', order });
});

// ─── Wishlist ─────────────────────────────────────────────────────────────────
app.get('/api/wishlist', authMiddleware, (req, res) => {
  const items = db.wishlists.filter(w => w.userId === req.user.id);
  const products = items.map(w => db.products.find(p => p.id === w.productId)).filter(Boolean);
  res.json(products);
});

app.post('/api/wishlist/:productId', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.productId);
  const exists = db.wishlists.find(w => w.userId === req.user.id && w.productId === productId);
  if (exists) { db.wishlists.splice(db.wishlists.indexOf(exists), 1); return res.json({ added: false }); }
  db.wishlists.push({ userId: req.user.id, productId });
  res.json({ added: true });
});

// ─── Stats (Admin) ────────────────────────────────────────────────────────────
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  const totalRevenue = db.orders.filter(o => o.status === 'paid').reduce((s, o) => s + parseFloat(o.totalAmount), 0);
  res.json({
    totalProducts: db.products.length,
    totalOrders: db.orders.length,
    totalUsers: db.users.length,
    totalRevenue: totalRevenue.toFixed(2),
    recentOrders: db.orders.slice(-5).reverse()
  });
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(db.products.map(p => p.category))];
  res.json(['All', ...categories]);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'E-Commerce Platform', port: PORT }));

app.listen(PORT, () => console.log(`E-Commerce backend running on port ${PORT}`));
module.exports = app;
