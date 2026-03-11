import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

let pool = null;
let useDatabase = false;

export async function initDB() {
  if (!process.env.DATABASE_URL) {
    console.log('📦 No DATABASE_URL found — using in-memory mock data');
    return false;
  }
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000 });
    await pool.query('SELECT 1');
    useDatabase = true;
    console.log('✅ PostgreSQL connected');
    return true;
  } catch (err) {
    console.log('⚠️  PostgreSQL not available — using in-memory mock data');
    pool = null;
    return false;
  }
}

export function getPool() {
  return pool;
}

export function isUsingDatabase() {
  return useDatabase;
}
