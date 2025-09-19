import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT ?? 5173);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
