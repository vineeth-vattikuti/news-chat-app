import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { loadDataset } from './dataset';
import { initRetriever } from './retrieval/retrieval';
import { mountDebugRoutes } from './routes/debug';

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
    articles: articles.length,
    message: 'API running; retriever ready'
  });
});

// Debug routes
const api = express.Router();
mountDebugRoutes(api, retriever);
app.use('/api', api);

app.listen(CONFIG.PORT, () => {
  console.log(`[api] listening on http://localhost:${CONFIG.PORT}`);
  console.log(`[api] dataset: ${articles.length} articles; retriever initialized`);
  console.log(`[api] try: GET /api/debug/search?q=NVDA`);
});
