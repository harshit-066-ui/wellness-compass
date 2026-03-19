import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import surveyRoutes from './routes/surveyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

console.log("🚀 FINAL SERVER BUILD");

// ────────────────────────────────────────────────
// 1. SECURITY + CORS
// ────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  'https://considerate-harmony-production.up.railway.app',
  'https://creative-wonder-production-18e4.up.railway.app',
  'http://localhost:5173',
  'https://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman / curl

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn('❌ CORS blocked:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// ────────────────────────────────────────────────
// 2. BASIC MIDDLEWARE
// ────────────────────────────────────────────────
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
// 3. DEBUG ROUTES (VERY IMPORTANT)
// ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ────────────────────────────────────────────────
// 4. API ROUTES
// ────────────────────────────────────────────────
app.use('/api/survey', authMiddleware, surveyRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// ✅ Express v5-safe 404
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ────────────────────────────────────────────────
// 5. ERROR HANDLER
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ────────────────────────────────────────────────
// 6. START SERVER (RAILWAY SAFE)
// ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚨 PORT: ${PORT}`);
  console.log(`🚀 Listening on ${PORT}`);
});
