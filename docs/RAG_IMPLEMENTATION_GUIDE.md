# RAG (Retrieval Augmented Generation)

This document describes the RAG implementation that exists in this repo today and how to run it.

## What RAG Does Here

When a simulation runs, each persona's System 2 prompt receives "Market Facts". Those facts come from a `RagSourceProvider` implementation.

## Supported Modes

### Mode A: In-memory

- Config: `RAG_PROVIDER=inmemory` (the `backend/.env.example` default)
- Behavior: `POST /rag/query` returns a small static set of sources.
- Ingestion: disabled (no `/rag/ingest/*` backing store)

This mode is useful for development when you do not want to manage a document corpus. Note: the local working `.env` file may already be set to `pgvector` — check your `backend/.env`.

### Mode B: pgvector (PostgreSQL)

- Config: `DB_ENABLED=true` and `RAG_PROVIDER=pgvector`
- Behavior: `POST /rag/query` runs a similarity search over `document_chunks`.
- Ingestion: enabled via the API so you can upload/ingest documents.

The local Docker Compose database uses a pgvector-enabled image (`pgvector/pgvector:pg16`).

## Local Setup (pgvector)

1. Start Postgres:

```bash
docker compose up -d
```

2. In `backend/.env` (copy from `backend/.env.example` if needed):

- `DB_ENABLED=true`
- `RAG_PROVIDER=pgvector`

## Database Schema Requirements

pgvector mode requires:

- `CREATE EXTENSION vector` installed in the target database
- `document_chunks.embedding` stored as `vector(768)`

TypeORM maps the embedding as a string and writes a pgvector literal (e.g. `[0.01,0.02,...]`).

If you are starting from an empty local database:

1. Temporarily set `DB_SYNC=true` and start the backend once to create tables.
2. Then run (in psql):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE document_chunks
  ALTER COLUMN embedding TYPE vector(768)
  USING embedding::vector;
```

3. Set `DB_SYNC=false` again.

4. Start the backend:

```bash
cd backend
npm run start:dev
```

5. Verify RAG is enabled:

```bash
curl -X POST http://localhost:3003/rag/ingest/file \
  -H "Authorization: Bearer <token>" \
  -F "file=@./docs/sample.pdf" \
  -F "sourceType=report" \
  -F "industry=sleep" \
  -F "title=Sample PDF"
```

### Stats

`GET /rag/stats`

### Delete All Documents

`DELETE /rag/documents` (admin role required)

## Query Endpoint

`POST /rag/query`

```bash
curl -X POST http://localhost:3003/rag/query \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"hypothesis":"A $49/month science-backed sleep supplement"}'
```

## Data Model

RAG stores chunks in a `document_chunks` table.

- Chunking is character-based (defaults: `RAG_CHUNK_SIZE=2000`, `RAG_CHUNK_OVERLAP=200`).
- Embeddings are created via Vertex AI embeddings and stored as a pgvector literal string (e.g. `[0.01,0.02,...]`).
- Query-time similarity uses pgvector's `<=>` operator.

Notes:

- TypeORM maps the embedding field as a string to avoid a custom vector column type.
- Retrieval quality depends heavily on the corpus you ingest.

## Configuration

These env vars are read by the RAG implementation:

- `RAG_PROVIDER`: `inmemory` or `pgvector`
- `RAG_TOP_K`: number of chunks returned per query (default `10`)
- `RAG_CHUNK_SIZE`: chunk size in characters (default `2000`)
- `RAG_CHUNK_OVERLAP`: overlap in characters (default `200`)

## Local vs pgvector mode

| Mode | When to use | Requirements |
|------|-------------|--------------|
| `RAG_PROVIDER=inmemory` | Quick demos, CI, no embedding API | None (built-in demo sources) |
| `RAG_PROVIDER=pgvector` | Real document retrieval | Postgres + pgvector, `GOOGLE_CLOUD_PROJECT` for embeddings |

## Future migration path

If you outgrow pgvector (very large corpora, low-latency requirements), you can add a new `RagSourceProvider` that queries Vertex AI Vector Search and switch providers via `RAG_PROVIDER`.

**Last Updated:** 2026-02-16
