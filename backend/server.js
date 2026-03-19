import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
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
// 1. CORS (FINAL FIX - NO cors() PACKAGE)
// ────────────────────────────────────────────────
const allowedOrigins = [
  'https://considerate-harmony-production.up.railway.app',
  'https://creative-wonder-production-18e4.up.railway.app',
  'http://localhost:5173'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Anonymous-ID'
  );

  // ✅ Handle preflight requests properly
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ────────────────────────────────────────────────
// 2. OTHER MIDDLEWARE
// ────────────────────────────────────────────────
app.use(helmet());

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
// 3. API ROUTES
// ────────────────────────────────────────────────
app.use('/api/survey', authMiddleware, surveyRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ Express v5 safe catch-all (NO "*")
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ────────────────────────────────────────────────
// 4. STATIC + SPA FALLBACK
// ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(frontendPath));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ────────────────────────────────────────────────
// 5. ERROR HANDLER
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ────────────────────────────────────────────────
// 6. START SERVER (Railway compatible)
// ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
