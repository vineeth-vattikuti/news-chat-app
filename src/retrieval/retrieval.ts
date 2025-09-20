import { buildBM25, scoreBM25, Doc, BM25Index } from './bm25';
import { dedupeByLinkOrTitle } from './dedupe';
import { detectTickersFromQuery } from './tokenize';
import type { Article } from '../dataset';

export type RankedDoc = Doc & { score: number };

export type Retriever = {
  search: (query: string, topK?: number) => RankedDoc[];
};

export function initRetriever(articles: Article[]): Retriever {
  // Assign stable ids based on in-order appearance
  const docs: Doc[] = articles.map((a, i) => ({
    id: i + 1,
    title: a.title,
    link: a.link,
    ticker: a.ticker,
    body: a.full_text ?? ''
  }));

  // Build index once at startup
  const baseIndex: BM25Index = buildBM25(docs);

  function search(query: string, topK = 10): RankedDoc[] {
    if (!query.trim()) return [];

    // Score
    const scores = scoreBM25(baseIndex, query);

    // Ticker boost
    const tickers = new Set(detectTickersFromQuery(query));
    if (tickers.size) {
      for (const d of docs) {
        if (tickers.has(d.ticker)) {
          const cur = scores.get(d.id) ?? 0;
          scores.set(d.id, cur * 1.15 + 0.25); // gentle boost
        }
      }
    }

    // Rank
    const ranked: RankedDoc[] = Array.from(scores.entries())
      .map(([id, score]) => {
        const d = docs[id - 1]; // ids are 1-based
        return { ...d, score };
      })
      .sort((a, b) => b.score - a.score);

    // Dedupe and slice
    const deduped = dedupeByLinkOrTitle(ranked);
    return deduped.slice(0, topK);
  }

  return { search };
}
