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

console.log("SERVER VERSION: CLEAN BUILD V2 🚀");

// ────────────────────────────────────────────────
// 1. MIDDLEWARE
// ────────────────────────────────────────────────
app.use(helmet());

// ✅ FIXED: allow your Railway frontend
const allowedOrigins = [
  'https://considerate-harmony-production.up.railway.app', // ✅ YOUR FRONTEND
  'https://creative-wonder-production-18e4.up.railway.app',
  'http://localhost:5173',
  'https://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

// ✅ SIMPLE + RELIABLE CORS (no breaking logic)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ IMPORTANT: handle preflight properly (Express v5 safe)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Anonymous-ID');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

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
// 2. API ROUTES
// ────────────────────────────────────────────────
app.use('/api/survey', authMiddleware, surveyRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Express v5 SAFE (no "*")
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ────────────────────────────────────────────────
// 3. STATIC (optional)
// ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(frontendPath));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ────────────────────────────────────────────────
// 4. ERROR HANDLER
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Railway binding
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
