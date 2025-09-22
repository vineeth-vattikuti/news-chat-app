import { describe, it, expect } from 'vitest';
import { initRetriever } from '../src/retrieval/retrieval';

type Doc = {
    id: number;
    title: string;
    ticker: string;
    link: string;
    body: string;
};

const FIXTURE: Doc[] = [
    {
        id: 1,
        title: 'Apple unveils new iPhone SE 4',
        ticker: 'AAPL',
        link: 'https://example.com/aapl-se4',
        body: 'Apple announced the iPhone SE 4 featuring improved modem and AI-driven camera features.',
    },
    {
        id: 2,
        title: 'NVIDIA posts record AI GPU revenue',
        ticker: 'NVDA',
        link: 'https://example.com/nvda-gpu',
        body: 'NVIDIA reported a surge in data center revenue driven by AI GPU demand.',
    },
    {
        id: 3,
        title: 'Microsoft expands Copilot',
        ticker: 'MSFT',
        link: 'https://example.com/msft-copilot',
        body: 'Microsoft expands Copilot features across Office with improved AI assistants.',
    },
];

describe('BM25 retriever', () => {
    it('ranks the most relevant doc highest for a targeted query', () => {
        const retriever = initRetriever(FIXTURE as any);
        const results = retriever.search('Apple iPhone SE 4 modem', 3);

        expect(results.length).toBeGreaterThan(0);
        // Expect the Apple doc (id:1) to be ranked first
        expect(results[0].id).toBe(1);

        // Ensure basic scoring presence
        expect(typeof results[0].score).toBe('number');
        expect(results[0].score).toBeGreaterThan(0);
    });

    it('returns at most K results and preserves doc shape', () => {
        const retriever = initRetriever(FIXTURE as any);
        const k = 2;
        const results = retriever.search('AI GPU revenue', k);

        expect(results.length).toBeLessThanOrEqual(k);
        for (const r of results) {
            expect(r).toHaveProperty('id');
            expect(r).toHaveProperty('title');
            expect(r).toHaveProperty('ticker');
            expect(r).toHaveProperty('link');
            expect(r).toHaveProperty('body');
            expect(r).toHaveProperty('score');
        }
    });
});
