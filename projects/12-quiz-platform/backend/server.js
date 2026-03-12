require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const quizzesRoutes = require('./routes/quizzes');
const attemptsRoutes = require('./routes/attempts');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many auth requests, please try again later' } });
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/attempts', attemptsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: 'in-memory' });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Optional DB / Redis connections (non-blocking) ───────────────────────────
async function tryConnectDB() {
  try {
    const mysql = require('mysql2/promise');
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'quiz_platform',
      waitForConnections: true,
      connectionLimit: 10,
    });
    await pool.query('SELECT 1');
    console.log('✅ MySQL connected');
    app.locals.db = pool;
  } catch {
    console.log('⚠️  MySQL not available — using in-memory mock data');
  }
}

async function tryConnectRedis() {
  try {
    const { createClient } = require('redis');
    const client = createClient({
      socket: { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 },
      password: process.env.REDIS_PASSWORD || undefined,
    });
    client.on('error', () => {});
    await client.connect();
    console.log('✅ Redis connected');
    app.locals.redis = client;
  } catch {
    console.log('⚠️  Redis not available — using in-memory leaderboard cache');
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Quiz Platform API running on http://localhost:${PORT}`);
  await tryConnectDB();
  await tryConnectRedis();
});

module.exports = app;
