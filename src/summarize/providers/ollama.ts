import { CONFIG } from '../../config';
import type { Summarizer, ModelAnswer } from '../provider';

/**
 * Minimal Ollama-based summarizer that expects the model to return a single JSON object
 * (we set `format: 'json'` to strongly nudge correct output).
 */
export function makeOllamaSummarizer(): Summarizer {
    return {
        info: () => ({ provider: 'ollama', model: CONFIG.OLLAMA_MODEL }),
        async run(prompt: string): Promise<ModelAnswer> {
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

            const data = (await res.json()) as { response?: string };
            if (!data.response) {
                throw new Error('Ollama response missing');
            }

            // The model is instructed to return a single JSON object string.
            // Parse directly; callers should handle any validation they need.
            return JSON.parse(data.response) as ModelAnswer;
        }
    };
}

/**
 * Optional: verify Ollama is reachable and the configured model exists.
 * Useful to call once at startup (non-essential for the provider itself).
 */
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

/**
 * Optional: light warm-up to reduce first-hit latency. Non-fatal if it fails.
 */
export async function warmUpModel(prompt = 'ok'): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const res = await fetch(`${CONFIG.OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                model: CONFIG.OLLAMA_MODEL,
                prompt,
                stream: false,
                options: { temperature: 0, top_p: 1, num_predict: 1 }
            }),
            signal: controller.signal
        });
        if (res.ok) {
            await res.text().catch(() => {});
        }
    } catch {
        // swallow — warmup should never crash startup
    } finally {
        clearTimeout(timeout);
    }
}
