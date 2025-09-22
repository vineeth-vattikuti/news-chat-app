import type { Summarizer, ModelAnswer } from '../provider';

type OpenAIInit = { apiKey?: string | null; model?: string | null };

export function makeOpenAISummarizer(init: OpenAIInit): Summarizer {
    const configuredKey = (init.apiKey ?? '').trim();
    const model = (init.model ?? 'gpt-4o-mini').trim();

    return {
        info: () => ({ provider: 'openai', model }),
        async run(prompt: string): Promise<ModelAnswer> {
            const key = configuredKey || process.env.OPENAI_API_KEY || '';
            if (!key) throw new Error('Missing OPENAI_API_KEY');

            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: 'You are a precise summarizer. Output valid JSON only.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0,
                    top_p: 1
                })
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`OpenAI error: HTTP ${res.status} ${txt}`);
            }
            const data = await res.json();
            const content: string | undefined = data?.choices?.[0]?.message?.content;
            if (!content) throw new Error('OpenAI response missing content');

            return JSON.parse(content) as ModelAnswer;
        }
    };
}
