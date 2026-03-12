require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { generateToken } = require('./middleware/auth');
const { socketAuthMiddleware } = require('./middleware/auth');
const { registerSocketHandlers } = require('./socket/handlers');
const chatRoutes = require('./routes/chat');

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP Rate limiting ────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.use(socketAuthMiddleware);

io.on('connection', (socket) => {
  console.log(`[Socket] User ${socket.userId} connected (${socket.id})`);
  registerSocketHandlers(io, socket);
});

// ── MongoDB (optional) ────────────────────────────────────────────────────────
async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.log('[DB] No MONGODB_URI set - using in-memory storage');
    return;
  }
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DB] MongoDB connected:', process.env.MONGODB_URI);
  } catch (error) {
    console.warn('[DB] MongoDB connection failed - falling back to in-memory storage:', error.message);
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────────

// Health check
app.get('/health', (req, res) => {
  const hasApiKey =
    process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  res.json({
    status: 'ok',
    mode: hasApiKey ? 'openai' : 'mock',
    timestamp: new Date().toISOString(),
  });
});

// Auth: get a demo token (no registration needed for demo)
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Simple demo auth - just use username as userId
  const userId = `user_${username.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const token = generateToken(userId);

  res.json({
    success: true,
    token,
    user: { id: userId, username: username.trim() },
  });
});

// Demo: get token for anonymous user
app.post('/api/auth/demo', (req, res) => {
  const { v4: uuidv4 } = require('uuid');
  const userId = `demo_${uuidv4().split('-')[0]}`;
  const token = generateToken(userId);

  res.json({
    success: true,
    token,
    user: { id: userId, username: 'Demo User' },
  });
});

// Conversations API
app.use('/api/conversations', chatRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('[Error]', err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// ── Start ──────────────────────────────────────────────────────────────────────
async function start() {
  await connectDatabase();

  httpServer.listen(PORT, () => {
    const hasApiKey =
      process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
    console.log(`\n🤖 AI Chatbot Backend running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🔑 Mode: ${hasApiKey ? 'OpenAI API' : 'Mock LLM (no API key)'}`);
    console.log(`💾 Storage: ${process.env.MONGODB_URI ? 'MongoDB' : 'In-memory'}\n`);
  });
}

start().catch(console.error);
