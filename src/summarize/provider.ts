export type ModelAnswer = {
    style: 'bullets' | 'paragraph';
    answer?: string;
    bullets?: string[];
    citations?: { doc_id: number; spans?: string[] }[];
    used_doc_ids: number[];
    // keep loose compatibility if some models echo extra fields
    [k: string]: unknown;
};

export interface Summarizer {
    run(prompt: string): Promise<ModelAnswer>;
    info(): { provider: string; model: string };
}
