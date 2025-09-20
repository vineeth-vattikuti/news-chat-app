import { tokenize } from './tokenize';

export type Doc = {
  id: number;
  title: string;
  link: string;
  ticker: string;
  body: string; // from full_text
};

export type BM25Index = {
  docs: Doc[];
  avgdl: number;
  docLen: Float64Array;           // per doc idx
  termDf: Map<string, number>;    // df per term
  termPostings: Map<string, Map<number, number>>; // term -> (docId -> tf)
  idToPos: Map<number, number>;   // docId -> position
  k1: number;
  b: number;
};

export function buildBM25(docs: Doc[], k1 = 1.2, b = 0.75): BM25Index {
  const idToPos = new Map<number, number>();
  docs.forEach((d, i) => idToPos.set(d.id, i));

  const termDf = new Map<string, number>();
  const termPostings = new Map<string, Map<number, number>>();
  const docLen = new Float64Array(docs.length);

  let totalLen = 0;
  docs.forEach((d, i) => {
    const text = `${d.title} ${d.body}`;
    const toks = tokenize(text);
    totalLen += toks.length;
    docLen[i] = toks.length;

    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);

    for (const [term, count] of tf) {
      if (!termPostings.has(term)) termPostings.set(term, new Map());
      termPostings.get(term)!.set(d.id, count);
      termDf.set(term, (termDf.get(term) ?? 0) + 1);
    }
  });

  const avgdl = docs.length ? totalLen / docs.length : 0;

  return { docs, avgdl, docLen, termDf, termPostings, idToPos, k1, b };
}

function idf(N: number, df: number): number {
  // BM25 idf variant with +0.5 smoothing
  return Math.log((N - df + 0.5) / (df + 0.5) + 1);
}

export function scoreBM25(index: BM25Index, query: string): Map<number, number> {
  const qToks = tokenize(query);
  const N = index.docs.length;
  const scores = new Map<number, number>();
  const seen = new Set<number>();

  for (const term of qToks) {
    const df = index.termDf.get(term);
    if (!df) continue;
    const postings = index.termPostings.get(term)!;
    const idfTerm = idf(N, df);
    for (const [docId, tf] of postings) {
      const pos = index.idToPos.get(docId)!;
      const dl = index.docLen[pos];
      const denom = tf + index.k1 * (1 - index.b + index.b * (dl / index.avgdl || 1));
      const contrib = idfTerm * ((tf * (index.k1 + 1)) / (denom || 1));
      scores.set(docId, (scores.get(docId) ?? 0) + contrib);
      seen.add(docId);
    }
  }
  return scores;
}
