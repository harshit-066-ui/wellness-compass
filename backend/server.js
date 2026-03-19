import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';

import surveyRoutes from './routes/surveyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ BUILD VERSION LOG (VERY IMPORTANT)
console.log("SERVER VERSION: CLEAN BUILD V2 🚀");

// ────────────────────────────────────────────────
// MIDDLEWARE
// ────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'https://creative-wonder-production-18e4.up.railway.app',
  'http://localhost:5173',
  'https://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
}));

app.use((req, res, next) => {
  req.guestId = req.headers['x-anonymous-id'] || 'anonymous';
  next();
});

// ────────────────────────────────────────────────
// API ROUTES
// ────────────────────────────────────────────────
app.use('/api/survey', authMiddleware, surveyRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ API 404 (Express v5 safe)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ────────────────────────────────────────────────
// STATIC + SPA
// ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(frontendPath));

// ✅ SPA fallback (no wildcard)
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ────────────────────────────────────────────────
// ERROR HANDLER
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ────────────────────────────────────────────────
// START SERVER (Railway compatible)
// ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

