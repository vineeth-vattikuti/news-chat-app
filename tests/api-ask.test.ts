import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';

import { buildPrompt } from '../src/summarize/prompt';
import type { Summarizer, ModelAnswer } from '../src/summarize/provider';
import { mountAskRoute } from '../src/routes/ask';
import { initRetriever } from '../src/retrieval/retrieval';

const DOCS = [
    { id: 1, title: 'Apple AI modem', ticker: 'AAPL', link: '#', body: 'Apple is working on AI modem chips.' },
    { id: 2, title: 'NVIDIA GPUs', ticker: 'NVDA', link: '#', body: 'NVIDIA announced new AI GPUs.' }
];

// Fake summarizer that just echoes data back
class FakeSummarizer implements Summarizer {
    info() {
        return { provider: 'fake', model: 'mock' };
    }
    async run(prompt: string): Promise<ModelAnswer> {
        return {
            style: 'bullets',
            answer: undefined,
            bullets: ['one', 'two'],
            citations: [],
            used_doc_ids: [1]
        };
    }
}

describe('POST /api/ask', () => {
    let app: express.Express;

    beforeAll(() => {
        const retriever = initRetriever(DOCS as any);
        const summarizer = new FakeSummarizer();
        app = express();
        app.use(cors());
        app.use(express.json());
        const api = express.Router();
        mountAskRoute(api, retriever, summarizer);
        app.use('/api', api);
    });

    it('returns 200 and summary payload', async () => {
        const res = await request(app)
            .post('/api/ask')
            .send({ query: 'Apple modem', k: 2, style: 'bullets' });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.bullets).toEqual(['one', 'two']);
        expect(res.body.usedDocIds).toEqual([1]);
    });

    it('400s on missing query', async () => {
        const res = await request(app).post('/api/ask').send({});
        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
    });
});
