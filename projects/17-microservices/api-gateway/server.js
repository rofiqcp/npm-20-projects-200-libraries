const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

const app = express();
const PORT = 3005;
const JWT_SECRET = 'microservices-secret';

const SERVICES = {
  users:    'http://localhost:3011',
  products: 'http://localhost:3012',
  orders:   'http://localhost:3013'
};

app.use(cors());
app.use(express.json());

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[GATEWAY] ${new Date().toISOString()} ${req.method} ${req.path}`);
  res.setHeader('X-Gateway', 'ECommerce-Gateway-v1');
  next();
});

// ─── JWT Auth Middleware ──────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authorization token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid or expired token' }); }
};

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    axios.get(`${SERVICES.users}/health`, { timeout: 2000 }),
    axios.get(`${SERVICES.products}/health`, { timeout: 2000 }),
    axios.get(`${SERVICES.orders}/health`, { timeout: 2000 })
  ]);
  const status = {
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      'user-service':    { status: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy', port: 3011 },
      'product-service': { status: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy', port: 3012 },
      'order-service':   { status: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy', port: 3013 }
    }
  };
  res.json(status);
});

// ─── Auth Proxy ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { data } = await axios.post(`${SERVICES.users}/auth/login`, req.body);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Service unavailable' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { data } = await axios.post(`${SERVICES.users}/auth/register`, req.body);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: 'Service unavailable' });
  }
});

// ─── User Service Proxy ───────────────────────────────────────────────────────
app.use('/api/users', async (req, res) => {
  try {
    const { data } = await axios({
      method: req.method, url: `${SERVICES.users}/users${req.path}`,
      data: req.body, headers: { Authorization: req.headers.authorization }
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 503).json(err.response?.data || { error: 'User service unavailable' });
  }
});

// ─── Product Service Proxy ────────────────────────────────────────────────────
app.use('/api/products', async (req, res) => {
  try {
    const url = `${SERVICES.products}/products${req.path === '/' ? '' : req.path}`;
    const { data } = await axios({ method: req.method, url, data: req.body, params: req.query });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 503).json(err.response?.data || { error: 'Product service unavailable' });
  }
});

// ─── Order Service Proxy ──────────────────────────────────────────────────────
app.use('/api/orders', async (req, res) => {
  try {
    const { data } = await axios({
      method: req.method, url: `${SERVICES.orders}/orders${req.path === '/' ? '' : req.path}`,
      data: req.body, headers: { Authorization: req.headers.authorization }
    });
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 503).json(err.response?.data || { error: 'Order service unavailable' });
  }
});

// ─── GraphQL ──────────────────────────────────────────────────────────────────
const schema = buildSchema(`
  type Product { id: ID! name: String! price: Float! category: String! stock: Int! }
  type User { id: ID! name: String! email: String! }
  type Order { id: ID! userId: String! total: Float! status: String! }
  type Query {
    products(category: String): [Product]
    product(id: ID!): Product
    users: [User]
    orders: [Order]
  }
`);

const root = {
  products: async ({ category }) => {
    try {
      const { data } = await axios.get(`${SERVICES.products}/products${category ? `?category=${category}` : ''}`);
      return data;
    } catch { return []; }
  },
  product: async ({ id }) => {
    try { const { data } = await axios.get(`${SERVICES.products}/products/${id}`); return data; }
    catch { return null; }
  },
  users: async () => {
    try { const { data } = await axios.get(`${SERVICES.users}/users`); return data; }
    catch { return []; }
  },
  orders: async () => {
    try { const { data } = await axios.get(`${SERVICES.orders}/orders`); return data; }
    catch { return []; }
  }
};

app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }));

app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
