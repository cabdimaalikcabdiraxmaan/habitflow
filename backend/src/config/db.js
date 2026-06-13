import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected');
    console.log(result.rows[0]);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}