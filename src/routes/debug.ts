import type { Router } from 'express';
import type { Retriever } from '../retrieval/retrieval';

export function mountDebugRoutes(r: Router, retriever: Retriever) {
  // GET /api/debug/search?q=...&k=10
  r.get('/debug/search', (req, res) => {
    const q = String(req.query.q ?? '').trim();
    const k = Math.min(
      50,
      Math.max(1, Number.isFinite(Number(req.query.k)) ? Number(req.query.k) : 10)
    );

    if (!q) {
      return res.status(400).json({ ok: false, error: "Missing query parameter 'q'" });
    }

    const results = retriever.search(q, k).map(d => ({
      id: d.id,
      title: d.title,
      ticker: d.ticker,
      score: Number(d.score.toFixed(6)),
      link: d.link,
    }));

    res.json({ ok: true, q, k, results });
  });
}
