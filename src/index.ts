import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { loadDataset } from './dataset';
import { initRetriever } from './retrieval/retrieval';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Load data and build retriever
const articles = loadDataset(CONFIG.NEWS_JSON_PATH);
const retriever = initRetriever(articles);

// Stash for later use by /api/ask
app.locals.retriever = retriever;
app.locals.articlesCount = articles.length;

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    articles: app.locals.articlesCount,
    message: 'API running; retriever ready'
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`[api] listening on http://localhost:${CONFIG.PORT}`);
  console.log(`[api] dataset: ${articles.length} articles; retriever initialized`);
});
