# Financial News Chat
A small full-stack app to ask questions about recent financial news stored in a JSON file.

- **Backend:** Node.js + Express + TypeScript
- **Retriever:** BM25 (custom)
- **Summarization:** [Ollama](https://ollama.ai/) models (e.g., `qwen3:1.7b`)
- **Frontend:** React + Vite

---

## Getting started
### 1. Clone and install
```bash
git clone <repo-url>
cd <repo>
npm install
```

### 2. Configure environment
Copy the example file and edit as needed:
```bash
cp .env.example .env
```

Defaults:
```dotenv
PORT=5173
NEWS_JSON_PATH=./data/stock_news.json
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:1.7b
```

### 3. Run the API
```bash
npm run dev
```

### 4. Run the client
```bash
cd client
npm install
npm run dev
# → http://localhost:5174
```

---

## API endpoints
| Method | Path                    | Description                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/api/health`           | Status & model info            |
| GET    | `/api/debug/search?q=…` | Inspect BM25 retrieval         |
| POST   | `/api/ask`              | Ask a question & get a summary |

Example:
```bash
curl -s -X POST http://localhost:5173/api/ask \
  -H 'content-type: application/json' \
  -d '{"query":"Latest on Apple and AI","k":4,"style":"bullets"}' | jq
```

---

## Performance
- Default model is `qwen3:1.7b` (~8 s per call on CPU).
- The server warms up the model at startup to reduce first-hit latency.
- For faster responses:
  - lower `k` or `maxCharsPerDoc`
  - try smaller models (e.g., `qwen2.5:3b`).

---

## Testing
Basic integration tests (retriever + API) live in `tests/`. Run them with:
```bash
npm test
```

---
