import type { Doc } from './bm25';
import { normalize } from './tokenize';

export function dedupeByLinkOrTitle<T extends Pick<Doc, 'link' | 'title'>>(docs: T[]): T[] {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const d of docs) {
        const key = d.link ? d.link.trim() : normalize(d.title).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(d);
    }
    return out;
}
