import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { loadDataset } from './dataset';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const articles = loadDataset(CONFIG.NEWS_JSON_PATH);
console.log(`[api] loaded ${articles.length} articles`);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    articles: articles.length,
    message: 'API running and dataset loaded',
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`[api] listening on http://localhost:${CONFIG.PORT}`);
});
