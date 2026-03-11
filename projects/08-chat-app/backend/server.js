require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const pool = require('./db');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/messages', require('./routes/messages'));

let redisClient = null;

async function initRedis() {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.warn('Redis error:', err.message));
    await redisClient.connect();
    console.log('Redis connected');
  } catch (err) {
    console.warn('Redis unavailable, continuing without it:', err.message);
    redisClient = null;
  }
}

async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.warn('DB init warning:', err.message);
  }
}

require('./socket/handlers')(io, redisClient);

const PORT = process.env.PORT || 5003;

(async () => {
  await initRedis();
  await initDB();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
