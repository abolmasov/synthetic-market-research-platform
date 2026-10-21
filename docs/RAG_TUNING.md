# RAG Tuning Guide

Production hardening for the RAG system: corpus curation, chunking/retrieval tuning, and evaluation.

## Corpus

The seed corpus includes **100+ documents** across 6 industries:

| Industry | Documents | Source |
|----------|-----------|--------|
| Sleep & Wellness | 10 | Demo (rag.seed.ts) |
| Fitness & Sports | 8 | Demo |
| Nutrition & Diet | 8 | Demo |
| E-commerce & Retail | 20 | Extended demo (`rag.seed.demo.ts`) |
| SaaS & Technology | 20 | Production |
| Financial Services | 20 | Production |

**Total:** 26 inline demo + 75 extended demo = **101 documents**

### Adding Documents

- **Demo corpus:** `backend/src/infrastructure/persistence/seed/rag.seed.ts`
- **Extended demo corpus:** `backend/src/infrastructure/persistence/seed/rag.seed.demo.ts`

Use the Documents UI (`/documents`) or `POST /rag/ingest/text` / `POST /rag/ingest/file` to add more.

## Chunking Parameters

| Env Var | Default | Description |
|---------|---------|-------------|
| `RAG_CHUNK_SIZE` | 2000 | Characters per chunk |
| `RAG_CHUNK_OVERLAP` | 200 | Overlap between chunks |

**Tuning guidance:**
- **Larger chunks (2500–3000):** Better context, fewer chunks, may miss fine-grained matches
- **Smaller chunks (1200–1500):** More precise retrieval, more chunks, possible context loss
- **Overlap (10–15% of size):** 200–300 chars typical; higher overlap preserves context across boundaries

## Retrieval Parameters

| Env Var | Default | Description |
|---------|---------|-------------|
| `RAG_TOP_K` | 10 | Number of chunks returned per query |
| `RAG_MIN_RELEVANCE_SCORE` | (none) | Optional: filter out results below this score (0–1) |

**Tuning guidance:**
- **TOP_K:** 8–15 typical; higher = more context but more noise
- **MIN_RELEVANCE_SCORE:** Use 0.4–0.6 to drop low-relevance results; leave unset to return all top-K

## Evaluation Harness

Run the benchmark to measure retrieval quality:

```bash
cd backend

# 1. Start the backend (in another terminal)
npm run start:dev

# 2. Get a JWT (register or login)
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"eval@example.com","password":"test1234","name":"Eval User"}'

# 3. Run evaluation (use access_token from response)
RAG_EVAL_TOKEN=<your-jwt> npm run rag:eval
```

**Benchmark:** 10 queries across sleep, fitness, e-commerce, SaaS, and financial services. Metrics:
- Keyword hit rate (expected keywords in results)
- Document hit rate (expected documents in results)
- Average relevance score

**Benchmark file:** `backend/scripts/benchmark-queries.json`

Add queries with `expectedKeywords` and `expectedDocumentTitles` to expand the benchmark.

## Tuning Workflow

1. **Seed corpus:** Ensure `SEED_ENABLED=true`, `RAG_PROVIDER=pgvector`, `DB_ENABLED=true`
2. **Clear and re-seed:** `DELETE /seed/rag-documents` then `POST /seed/rag-documents` (or restart with empty corpus)
3. **Run eval:** `RAG_EVAL_TOKEN=... npm run rag:eval`
4. **Adjust params:** Change `RAG_CHUNK_SIZE`, `RAG_TOP_K`, `RAG_MIN_RELEVANCE_SCORE` in `.env`
5. **Re-seed** (chunking changes require re-ingestion)
6. **Re-run eval** and compare metrics

## Production Deployment

RAG env vars are set in `deploy-backend.yml` and `cloudbuild.yaml`. Add `RAG_CHUNK_SIZE`, `RAG_CHUNK_OVERLAP`, and `RAG_MIN_RELEVANCE_SCORE` to deployment configs if you tune them.
