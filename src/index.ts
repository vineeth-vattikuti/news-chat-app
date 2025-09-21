import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { loadDataset } from './dataset';
import { initRetriever } from './retrieval/retrieval';
import { assertOllamaAvailable, healthPayload, warmUpModel } from './ollama';
import { mountAskRoute } from './routes/ask';
import { mountDebugRoutes } from './routes/debug';

async function main() {
    await assertOllamaAvailable();

    // Fire-and-forget warmup (don’t block server if it fails)
    warmUpModel().then(() => {
        console.log('[api] model warm-up complete');
    }).catch(() => {
        console.log('[api] model warm-up skipped (non-fatal)');
    });

    const articles = loadDataset(CONFIG.NEWS_JSON_PATH);
    const retriever = initRetriever(articles);

    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '1mb' }));

    const api = express.Router();
    api.get('/health', (_req, res) => res.json(healthPayload(articles.length)));
    mountDebugRoutes(api, retriever);
    mountAskRoute(api, retriever);

    app.use('/api', api);

    app.listen(CONFIG.PORT, () => {
        console.log(`[api] listening on http://localhost:${CONFIG.PORT}`);
    });
}

main().catch(err => {
    console.error('[api] fatal:', err);
    process.exit(1);
});
