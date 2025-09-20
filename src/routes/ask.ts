import type { Router } from 'express';
import type { Retriever } from '../retrieval/retrieval';
import { buildPrompt, type AskBody } from '../summarize/prompt';
import { generateSummary } from '../ollama';


export function mountAskRoute(r: Router, retriever: Retriever) {
r.post('/ask', async (req, res) => {
try {
const body = req.body as AskBody;
const query = String(body?.query ?? '').trim();
if (!query) return res.status(400).json({ ok: false, error: 'Missing query' });


const k = Math.min(8, Math.max(1, body?.k ?? 6));
const style = body?.style === 'paragraph' ? 'paragraph' : 'bullets';


const docs = retriever.search(query, k);
if (!docs.length) return res.json({ ok: true, answer: null, citations: [], usedDocIds: [], note: 'No relevant docs in dataset' });


const prompt = buildPrompt(query, docs, style);
const modelOut = await generateSummary(prompt);


// Light sanity checks (strict validators will come in a later commit)
const usedSet = new Set(modelOut.used_doc_ids ?? []);
const validUsed = docs.map(d => d.id).filter(id => usedSet.has(id));


return res.json({
ok: true,
style: modelOut.style,
answer: modelOut.answer,
bullets: modelOut.bullets,
citations: modelOut.citations,
usedDocIds: validUsed,
});
} catch (err: any) {
return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
}
});
}