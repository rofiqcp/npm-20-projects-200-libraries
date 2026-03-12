const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/iot_dashboard',
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;
