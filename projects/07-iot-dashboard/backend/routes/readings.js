const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/readings?sensor_id=1&hours=24
router.get('/', async (req, res) => {
  try {
    const hours = Math.min(Math.max(parseInt(req.query.hours) || 24, 1), 168);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 1000);
    const { sensor_id } = req.query;

    const params = [hours, limit];
    let query = `
      SELECT r.*, s.name as sensor_name, s.location
      FROM readings r
      JOIN sensors s ON r.sensor_id = s.id
      WHERE r.recorded_at >= NOW() - ($1 * INTERVAL '1 hour')
    `;

    if (sensor_id) {
      params.push(sensor_id);
      query += ` AND r.sensor_id = $${params.length}`;
    }

    query += ' ORDER BY r.recorded_at DESC LIMIT $2';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get readings error:', err);
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

// GET /api/readings/averages?sensor_id=1&hours=24
router.get('/averages', async (req, res) => {
  try {
    const hours = Math.min(Math.max(parseInt(req.query.hours) || 24, 1), 168);
    const { sensor_id } = req.query;

    const params = [hours];
    let query = `
      SELECT
        sensor_id,
        s.name as sensor_name,
        s.location,
        ROUND(AVG(temperature)::numeric, 1) as avg_temp,
        ROUND(MIN(temperature)::numeric, 1) as min_temp,
        ROUND(MAX(temperature)::numeric, 1) as max_temp,
        ROUND(AVG(humidity)::numeric, 1) as avg_humidity,
        ROUND(AVG(pressure)::numeric, 1) as avg_pressure,
        COUNT(*) as reading_count
      FROM readings r
      JOIN sensors s ON r.sensor_id = s.id
      WHERE r.recorded_at >= NOW() - ($1 * INTERVAL '1 hour')
    `;

    if (sensor_id) {
      params.push(sensor_id);
      query += ` AND r.sensor_id = $${params.length}`;
    }

    query += ' GROUP BY r.sensor_id, s.name, s.location ORDER BY sensor_id';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get averages error:', err);
    res.status(500).json({ error: 'Failed to fetch averages' });
  }
});

// GET /api/readings/latest
router.get('/latest', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (r.sensor_id)
        r.*,
        s.name as sensor_name,
        s.location,
        s.temp_min_alert,
        s.temp_max_alert,
        s.humidity_max_alert
      FROM readings r
      JOIN sensors s ON r.sensor_id = s.id
      WHERE s.active = TRUE
      ORDER BY r.sensor_id, r.recorded_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Get latest readings error:', err);
    res.status(500).json({ error: 'Failed to fetch latest readings' });
  }
});

// GET /api/readings/alerts
router.get('/alerts', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT a.*, s.name as sensor_name, s.location
      FROM alerts a
      JOIN sensors s ON a.sensor_id = s.id
      ORDER BY a.created_at DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// PUT /api/readings/alerts/:id/acknowledge
router.put('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE alerts SET acknowledged = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

module.exports = router;
