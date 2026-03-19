import express from 'express';

const app = express();

// 🔥 MUST use Railway port
const PORT = process.env.PORT || 8080;

console.log('🚀 TEST SERVER STARTING...');

// ────────────────────────────────────────────────
// ROOT (Railway health check)
// ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('✅ WORKING');
});

// ────────────────────────────────────────────────
// HEALTH CHECK
// ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ────────────────────────────────────────────────
// START SERVER (IMPORTANT FIX APPLIED)
// ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
});
