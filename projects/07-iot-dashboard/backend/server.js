require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');
const sensorsRouter = require('./routes/sensors');
const readingsRouter = require('./routes/readings');
const { checkThresholds } = require('./services/alertService');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });

app.use('/api/sensors', apiLimiter, sensorsRouter);
app.use('/api/readings', apiLimiter, readingsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'iot-dashboard' });
});

// Initialize DB schema
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(200),
        type VARCHAR(50) DEFAULT 'weather',
        temp_min_alert REAL DEFAULT 0,
        temp_max_alert REAL DEFAULT 40,
        humidity_max_alert REAL DEFAULT 90,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS readings (
        id SERIAL PRIMARY KEY,
        sensor_id INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        pressure REAL,
        battery_level REAL DEFAULT 100,
        recorded_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_readings_sensor_id ON readings(sensor_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_readings_recorded_at ON readings(recorded_at)`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        sensor_id INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        value REAL,
        threshold REAL,
        acknowledged BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_alerts_sensor_id ON alerts(sensor_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at)`);

    // Insert default sensors if none exist
    const { rows } = await pool.query('SELECT COUNT(*) FROM sensors');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO sensors (name, location, temp_min_alert, temp_max_alert, humidity_max_alert)
        VALUES
          ('Sensor Alpha', 'Living Room', 5, 35, 80),
          ('Sensor Beta', 'Greenhouse', 10, 38, 85),
          ('Sensor Gamma', 'Server Room', 15, 28, 60)
      `);
      console.log('Default sensors inserted.');
    }

    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

// Sensor state for simulation
const sensorState = {};

function getOrInitSensorState(sensorId) {
  if (!sensorState[sensorId]) {
    sensorState[sensorId] = {
      temperature: 20 + Math.random() * 5,
      humidity: 50 + Math.random() * 10,
      pressure: 1013 + Math.random() * 5,
      battery: 85 + Math.random() * 15,
    };
  }
  return sensorState[sensorId];
}

function drift(current, delta, min, max) {
  const next = current + (Math.random() - 0.5) * delta;
  return Math.min(max, Math.max(min, next));
}

// Simulate sensor data every 5 seconds
async function simulateSensorData() {
  try {
    const { rows: sensors } = await pool.query(
      'SELECT * FROM sensors WHERE active = TRUE'
    );

    for (const sensor of sensors) {
      const state = getOrInitSensorState(sensor.id);

      state.temperature = drift(state.temperature, 1.5, -5, 50);
      state.humidity = drift(state.humidity, 3, 10, 100);
      state.pressure = drift(state.pressure, 2, 990, 1040);
      state.battery = Math.max(0, state.battery - 0.01);

      const reading = {
        sensor_id: sensor.id,
        temperature: Math.round(state.temperature * 10) / 10,
        humidity: Math.round(state.humidity * 10) / 10,
        pressure: Math.round(state.pressure * 10) / 10,
        battery_level: Math.round(state.battery * 10) / 10,
      };

      const { rows } = await pool.query(
        `INSERT INTO readings (sensor_id, temperature, humidity, pressure, battery_level)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [reading.sensor_id, reading.temperature, reading.humidity, reading.pressure, reading.battery_level]
      );

      const newReading = { ...rows[0], sensor_name: sensor.name, location: sensor.location };

      // Check thresholds
      const triggeredAlerts = await checkThresholds(reading, sensor);

      // Emit to all connected clients
      io.emit('new_reading', newReading);

      if (triggeredAlerts.length > 0) {
        io.emit('new_alerts', triggeredAlerts.map(a => ({ ...a, sensor_name: sensor.name })));
      }
    }
  } catch (err) {
    console.error('Simulation error:', err.message);
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5002;

initDB().then(() => {
  // Start simulation interval
  setInterval(simulateSensorData, 5000);

  server.listen(PORT, () => {
    console.log(`IoT Dashboard server running on port ${PORT}`);
  });
});
