# Financial News Chat

A small full-stack app to ask questions about recent financial news stored in a JSON file.

- **Backend:** Node.js + Express + TypeScript
- **Retriever:** BM25 (custom)
- **Summarization:** configurable (local [Ollama](https://ollama.ai/) or [OpenAI](https://platform.openai.com/))
- **Frontend:** React + Vite

---

## Getting started

### 1. Clone and install
```bash
git clone <your-repo-url>
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
SUMMARIZER_PROVIDER=ollama   # or: openai

# Ollama settings (when SUMMARIZER_PROVIDER=ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:1.7b

# OpenAI settings (when SUMMARIZER_PROVIDER=openai)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

### 3. Install & prepare Ollama (if using local models)

> Skip this if you’re using OpenAI.

1. [Download and install Ollama](https://ollama.ai/download) for your OS.
2. Pull the model you configured in `.env`:
   ```bash
   ollama pull qwen3:1.7b
   ```
3. Start the Ollama service (if not already running):
   ```bash
   ollama serve
   ```

### 4. Run the API
```bash
npm run dev
```

### 5. Run the client
```bash
cd client
npm install
npm run dev
# → http://localhost:5174
```

---

## Provider selection

Choose your summarizer backend in `.env`:

| Provider | Requirements | Notes |
|----------|--------------|-------|
| `ollama` (default) | Install Ollama & pull the model | Runs locally, no network |
| `openai` | Valid `OPENAI_API_KEY` and model name (e.g., `gpt-4o-mini`) | Uses OpenAI’s API |

Check which provider is active:
```bash
curl http://localhost:5173/api/health
# → { "ok": true, "provider": "openai", "model": "gpt-4o-mini", "articles": 100 }
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

- `qwen3:1.7b` on CPU ~8 s per call; first call is warmed up on server start.
- With OpenAI, latency depends on their API and model.
- For faster responses:
  - lower `k` or `maxCharsPerDoc`
  - use a smaller model (e.g., `gpt-4o-mini`, `qwen2.5:3b`).

---

## Testing

Basic integration tests (retriever + API) live in `tests/`. Run them with:
```bash
npm test
```
