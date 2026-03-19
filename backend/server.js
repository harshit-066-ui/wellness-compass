import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('WORKING');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('SERVER RUNNING ON', PORT);
});

// ────────────────────────────────────────────────
// 6. START SERVER
// ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
