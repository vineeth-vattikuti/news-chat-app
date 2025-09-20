const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','else','when','while','for','to','of','in','on','at',
  'by','with','from','as','is','are','was','were','be','been','being','that','this','these','those',
  'it','its','into','over','under','about','after','before','between','within','without','not'
]);

export function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const raw = lower.split(/[^a-z0-9$]+/g);
  const toks = raw.filter(t => t && !STOPWORDS.has(t));
  return toks;
}

/** Extract naive tickers from a user query, e.g., AAPL MSFT NVDA. */
export function detectTickersFromQuery(query: string): string[] {
  const toks = query.split(/[^A-Z]/g).filter(Boolean);
  // Allow 2–5 uppercase letters; filter obvious non-tickers
  const tickers = toks.filter(t => /^[A-Z]{2,5}$/.test(t) && !BANNED.has(t));
  return Array.from(new Set(tickers));
}

const BANNED = new Set(['USD','CEO','CFO','AI','IPO','ETF','USA','GDP','CPI']);
