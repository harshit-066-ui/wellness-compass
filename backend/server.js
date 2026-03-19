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

console.log("SERVER VERSION: CLEAN BUILD V2 🚀");

const app = express();
const PORT = process.env.PORT || 5000;

// ────────────────────────────────────────────────
// 1. MIDDLEWARE
// ────────────────────────────────────────────────
app.use(helmet());

// ✅ CRITICAL FIX: allow ALL origins temporarily (fix CORS instantly)
app.use(cors({
  origin: true,
  credentials: true
}));

// ✅ handle preflight explicitly
app.options('*', cors());

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
// 2. HEALTH ROUTE (NO AUTH!)
// ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ────────────────────────────────────────────────
// 3. API ROUTES (WITH AUTH)
// ────────────────────────────────────────────────
app.use('/api/survey', authMiddleware, surveyRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// ✅ Express v5 safe catch-all
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ────────────────────────────────────────────────
// 4. STATIC FILES (OPTIONAL)
// ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(frontendPath));

// Express v5 safe SPA fallback
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ────────────────────────────────────────────────
// 5. ERROR HANDLER
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ error: 'Internal server error' });
});

// ────────────────────────────────────────────────
// 6. START SERVER
// ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
