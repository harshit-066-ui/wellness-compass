import express from 'express';

const app = express();

const PORT = process.env.PORT;

console.log("🚨 PORT VALUE:", PORT);

app.get('/', (req, res) => {
  res.send('WORKING');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Listening on ${PORT}`);
});
