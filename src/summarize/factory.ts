import type { Summarizer } from './provider';
import { makeOllamaSummarizer } from './providers/ollama';
import { makeOpenAISummarizer } from './providers/openai';

export function makeSummarizerFromEnv(): Summarizer {
    const provider = (process.env.SUMMARIZER_PROVIDER ?? 'ollama').toLowerCase();
    if (provider === 'openai') {
        return makeOpenAISummarizer({
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL
        });
    }
    return makeOllamaSummarizer();
}
