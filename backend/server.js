import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import surveyRoutes from './routes/surveyRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 8080;

console.log("🚀 SERVER TEST BUILD STARTING...");

// ────────────────────────────────────────────────
// 1. SIMPLE CORS (SAFE FOR TESTING)
// ────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all for now
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,PATCH,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Anonymous-ID'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ────────────────────────────────────────────────
// 2. BASIC MIDDLEWARE
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
// 3. HEALTH + ROOT (IMPORTANT FOR RAILWAY)
// ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 🔥 DEBUG SUPABASE
app.get('/api/debug', async (req, res) => {
  try {
    const { getSupabase } = await import('./utils/supabase.js');
    const supabase = getSupabase();

    if (!supabase) {
      return res.json({ error: 'Supabase NOT initialized' });
    }

    return res.json({ message: 'Supabase OK' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────
// 4. API ROUTES
// ────────────────────────────────────────────────
app.use('/api/survey', authMiddleware, surveyRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/habits', authMiddleware, habitRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// catch unknown API routes
app.all(/^\/api\/.*/, (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ────────────────────────────────────────────────
// 5. ERROR HANDLER
// ────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ────────────────────────────────────────────────
// 6. START SERVER
// ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
