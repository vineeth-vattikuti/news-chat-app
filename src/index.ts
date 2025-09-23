import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { loadDataset } from './dataset';
import { initRetriever } from './retrieval/retrieval';
import { assertOllamaAvailable, warmUpModel, makeOllamaSummarizer } from './summarize/providers/ollama';
import { mountAskRoute } from './routes/ask';
import { mountDebugRoutes } from './routes/debug';
import { makeSummarizerFromEnv } from './summarize/factory';

async function main() {
    const articles = loadDataset(CONFIG.NEWS_JSON_PATH);
    const retriever = initRetriever(articles);

    const app = express();
    app.use(cors());
    app.use(express.json({ limit: '1mb' }));

    const summarizer = makeSummarizerFromEnv();

    const info = summarizer.info();
    if (info.provider === 'ollama') {
        await assertOllamaAvailable();
        // Fire-and-forget warmup (don’t block server if it fails)
        warmUpModel().then(() => {
            console.log('[api] model warm-up complete');
        }).catch((err) => {
            console.warn('[api] model warm-up failed (non-fatal): ', err.message);
        });
    }

    const api = express.Router();
    api.get('/health', (_req, res) => {
        const info = summarizer.info();
        res.json({ ok: true, provider: info.provider, model: info.model, articles: articles.length });
    });
    mountDebugRoutes(api, retriever);
    mountAskRoute(api, retriever, summarizer);

    app.use('/api', api);

    app.listen(CONFIG.PORT, () => {
        console.log(`[api] listening on http://localhost:${CONFIG.PORT}`);
    });
}

main().catch(err => {
    console.error('[api] fatal:', err);
    process.exit(1);
});
