import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import habitRoutes from './routes/habits.js';
import profileRoutes from './routes/profile.js';
import statsRoutes from './routes/stats.js';
import dotenv from 'dotenv';
import { pool } from './config/db.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/db-test', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Habit"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default app;
