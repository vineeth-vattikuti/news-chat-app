import { useMemo, useState } from 'react';

type AskResponse = {
    ok: boolean;
    style: 'bullets' | 'paragraph';
    answer?: string;
    bullets?: string[];
    citations?: { doc_id: number; spans?: string[] }[];
    usedDocIds?: number[];
    error?: string;
};

export default function App() {
    const [q, setQ] = useState('');
    const [style, setStyle] = useState<'bullets' | 'paragraph'>('bullets');

    const [loading, setLoading] = useState(false);
    const [resp, setResp] = useState<AskResponse | null>(null);
    const [err, setErr] = useState<string | null>(null);


    const disabled = useMemo(() => loading || !q.trim(), [loading, q]);


    async function ask() {
        setLoading(true);
        setErr(null);
        setResp(null);
        try {
            const r = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ query: q, style })
            });
            const data = await r.json();
            if (!r.ok || !data.ok) {
                setErr(data?.error || r.statusText);
            } else {
                setResp(data);
            }
        } catch (e: any) {
            setErr(e?.message ?? String(e));
        } finally {
            setLoading(false);
        }
    }


    return (
        <div style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', margin: 24 }}>
            <h1>News Chat</h1>


            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <label>Style</label>
                <select value={style} onChange={(e) => setStyle(e.target.value as any)}>
                    <option value="bullets">bullets</option>
                    <option value="paragraph">paragraph</option>
                </select>
                <button onClick={ask} disabled={disabled}>{loading ? 'Asking…' : 'Ask'}</button>
            </div>


            <textarea
                value={q}
                onChange={e => setQ(e.target.value)}
                rows={6}
                style={{ width: '100%', marginBottom: 16 }}
                placeholder="What would you like to know about recent financial news?"
            />


            {err && <div style={{ color: '#b00020', whiteSpace: 'pre-wrap' }}>{err}</div>}


            {resp && (
                <div>
                    <h3>Answer</h3>
                    {resp.style === 'bullets' ? (
                        <ul>
                            {(resp.bullets ?? []).map((b, i) => (<li key={i}>{b}</li>))}
                        </ul>
                    ) : (
                        <p>{resp.answer ?? '(no answer)'}</p>
                    )}
                </div>
            )}
        </div>
    );
}
