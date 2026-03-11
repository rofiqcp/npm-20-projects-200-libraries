const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/sensors
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sensors WHERE active = TRUE ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error('Get sensors error:', err);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
});

// GET /api/sensors/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM sensors WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Sensor not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sensor' });
  }
});

// POST /api/sensors
router.post('/', async (req, res) => {
  try {
    const { name, location, type, temp_min_alert, temp_max_alert, humidity_max_alert } = req.body;
    if (!name) return res.status(400).json({ error: 'Sensor name is required' });

    const { rows } = await pool.query(
      `INSERT INTO sensors (name, location, type, temp_min_alert, temp_max_alert, humidity_max_alert)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, location || '', type || 'weather',
       temp_min_alert ?? 0, temp_max_alert ?? 40, humidity_max_alert ?? 90]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create sensor error:', err);
    res.status(500).json({ error: 'Failed to create sensor' });
  }
});

// PUT /api/sensors/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, location, temp_min_alert, temp_max_alert, humidity_max_alert } = req.body;
    const { rows } = await pool.query(
      `UPDATE sensors
       SET name = COALESCE($1, name),
           location = COALESCE($2, location),
           temp_min_alert = COALESCE($3, temp_min_alert),
           temp_max_alert = COALESCE($4, temp_max_alert),
           humidity_max_alert = COALESCE($5, humidity_max_alert)
       WHERE id = $6 RETURNING *`,
      [name, location, temp_min_alert, temp_max_alert, humidity_max_alert, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Sensor not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update sensor' });
  }
});

// DELETE /api/sensors/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'UPDATE sensors SET active = FALSE WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Sensor not found' });
    res.json({ message: 'Sensor deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete sensor' });
  }
});

module.exports = router;
