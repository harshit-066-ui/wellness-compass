import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

// Basic test route
app.get('/', (req, res) => {
  res.send('✅ Backend is working');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TEST SERVER running on ${PORT}`);
});
