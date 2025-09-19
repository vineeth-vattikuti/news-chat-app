import { CONFIG } from './config';

export async function assertOllamaAvailable(): Promise<void> {
  const tagsUrl = new URL('/api/tags', CONFIG.OLLAMA_BASE_URL).toString();

  let res;
  try {
    res = await fetch(tagsUrl);
  } catch (err: any) {
    throw new Error(`Failed to reach Ollama at ${CONFIG.OLLAMA_BASE_URL}: ${err.message}`);
  }

  if (!res.ok) {
    throw new Error(`Ollama responded with ${res.status}`);
  }

  const data = await res.json() as { models?: { name: string }[] };
  const names = new Set((data.models ?? []).map(m => m.name));
  if (!names.has(CONFIG.OLLAMA_MODEL)) {
    throw new Error(
      `Model '${CONFIG.OLLAMA_MODEL}' not found in Ollama. ` +
      `Run: ollama pull ${CONFIG.OLLAMA_MODEL}`
    );
  }
}

export function healthPayload(articleCount: number) {
  return {
    ok: true,
    provider: 'ollama',
    model: CONFIG.OLLAMA_MODEL,
    articles: articleCount,
  };
}
