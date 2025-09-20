import { CONFIG } from './config';
import type { ModelAnswer } from './summarize/prompt';


export async function assertOllamaAvailable(): Promise<void> {
const url = `${CONFIG.OLLAMA_BASE_URL}/api/tags`;
const res = await fetch(url);
if (!res.ok) throw new Error(`Ollama responded with HTTP ${res.status}`);
const data = (await res.json()) as { models?: { name: string }[] };
const names = new Set((data.models ?? []).map(m => m.name));
if (!names.has(CONFIG.OLLAMA_MODEL)) {
throw new Error(`Model '${CONFIG.OLLAMA_MODEL}' not found. Run: ollama pull ${CONFIG.OLLAMA_MODEL}`);
}
}


export function healthPayload(articleCount: number) {
return { ok: true, provider: 'ollama', model: CONFIG.OLLAMA_MODEL, articles: articleCount };
}


export async function generateSummary(prompt: string): Promise<ModelAnswer> {
const res = await fetch(`${CONFIG.OLLAMA_BASE_URL}/api/generate`, {
method: 'POST',
headers: { 'content-type': 'application/json' },
body: JSON.stringify({
model: CONFIG.OLLAMA_MODEL,
prompt,
stream: false,
format: 'json',
options: { temperature: 0, top_p: 1 }
})
});


if (!res.ok) {
const txt = await res.text().catch(() => '');
throw new Error(`Ollama generate failed: HTTP ${res.status} ${txt}`);
}


const data = await res.json() as { response?: string };
if (!data.response) throw new Error('Ollama response missing');


let parsed: ModelAnswer;
try {
parsed = JSON.parse(data.response);
} catch (e: any) {
throw new Error(`Failed to parse model JSON: ${e?.message ?? e}`);
}
return parsed;
}