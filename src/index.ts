import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { loadDataset } from './dataset';
import { assertOllamaAvailable, healthPayload } from './ollama';

async function main() {
  await assertOllamaAvailable();
  const articles = loadDataset(CONFIG.NEWS_JSON_PATH);

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json(healthPayload(articles.length));
  });

  app.listen(CONFIG.PORT, () => {
    console.log(`[api] listening on http://localhost:${CONFIG.PORT}`);
    console.log(`[api] provider: ollama, model: ${CONFIG.OLLAMA_MODEL}`);
  });
}

main().catch(err => {
  console.error('[api] fatal:', err);
  process.exit(1);
});
