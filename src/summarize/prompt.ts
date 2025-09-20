import type { RankedDoc } from '../retrieval/retrieval';


export type AskBody = {
    query: string;
    k?: number; // optional override for topK
    style?: 'bullets' | 'paragraph';
};


export type ModelAnswer = {
    style: 'bullets' | 'paragraph';
    answer?: string; // present when style === 'paragraph'
    bullets?: string[]; // present when style === 'bullets'
    citations: { doc_id: number; spans?: string[] }[];
    used_doc_ids: number[];
};


/** Build a compact context to keep prompts fast. */
export function buildContext(docs: RankedDoc[], maxCharsPerDoc = 1200) {
    return docs.map((d, i) => {
        const body = (d.body ?? '').replace(/\s+/g, ' ').slice(0, maxCharsPerDoc);
        return `[#${i + 1} DOC ${d.id} | ${d.ticker} ]\nTitle: ${d.title}\nLink: ${d.link}\nBody: ${body}`;
    }).join("\n\n");
}


export function buildPrompt(query: string, docs: RankedDoc[], style: 'bullets' | 'paragraph') {
    const context = buildContext(docs);
    const schema = JSON.stringify({
        style: "bullets|paragraph",
        answer: "string?",
        bullets: ["string"],
        citations: [{ doc_id: 0, spans: ["string?"] }],
        used_doc_ids: [0]
    }, null, 2);


    return [
        `You are a precise summarizer grounded ONLY in the provided documents.`,
        `Rules:`,
        `- Answer the user's query using only the supplied text.`,
        `- If the information is not present, say so.`,
        `- Keep it concise and non-repetitive.`,
        `- Include citations: for each claim, cite at least one doc_id.`,
        `- Output MUST be valid JSON that matches the schema.`,
        `- Do not include markdown or prose outside the JSON.`,
        `\nUser query:\n${query}`,
        `\nDocuments:\n${context}`,
        `\nOutput schema (example types, not literal):\n${schema}`,
        `\nOutput requirements:`,
        `- style: one of "bullets" or "paragraph". Use "${style}".`,
        `- If style is "bullets", return 3-6 short bullets and omit 'answer'.`,
        `- If style is "paragraph", return a concise paragraph (around 5 sentences) in 'answer' and omit 'bullets'.`,
        `- 'citations' must list only doc_ids from 'used_doc_ids'.`,
        `- 'used_doc_ids' must be the set of document ids referenced.`
    ].join('\n');
}
