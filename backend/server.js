import express from 'express';

console.log("🚨 ROOT:", process.cwd());

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('OK WORKING');
});

app.get('/test', (req, res) => {
  res.send('TEST OK');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log("🚀 Listening on", PORT);
});
