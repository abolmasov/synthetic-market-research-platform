# Development Setup Guide

This guide reflects the actual repo defaults and scripts.

## Prerequisites

- Node.js 20 (recommended; CI uses Node 20)
- Docker Desktop (for local Postgres)
- Git

Optional:

- Google Cloud SDK (`gcloud`) if you want to run Vertex AI-backed flows locally

## Quick Start

### Windows (Recommended)

From the repo root:

```powershell
./run-local.ps1
```

This script:

- starts Postgres via `docker compose`
- creates `backend/.env` and `frontend/.env` from `*.env.example` if missing
- launches backend + frontend in separate terminals

### Manual (All Platforms)

1. Start Postgres (repo root):

```bash
docker compose up -d
```

2. Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

3. Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Default local ports:

- API: `http://localhost:3003` (Swagger: `http://localhost:3003/api`)
- UI: `http://localhost:5175`
- Postgres: `localhost:5445`

### Linux / macOS one-liner

```bash
./run-local.sh
```

## Configuration Notes

### Backend `.env` (Key Vars)

The canonical list lives in `backend/.env.example`.

- `PORT` defaults to `3003`
- `CORS_ORIGIN` should include `http://localhost:5175` for local dev

Database (Docker Compose defaults from `docker-compose.yml`):

- `DB_ENABLED=true`
- `DB_HOST=127.0.0.1`
- `DB_PORT=5445`
- `DB_USER=smr`
- `DB_PASSWORD=smr`
- `DB_NAME=smr`
- `DB_SYNC=false` (recommended; use migrations)

If your local database is empty (no tables yet), you can temporarily set `DB_SYNC=true`, start the backend once to let TypeORM create tables, then set it back to `false`. See `docs/MIGRATIONS.md`.

In-memory mode (no Postgres required):

- set `DB_ENABLED=false`
- set `RAG_PROVIDER=inmemory` (pgvector RAG requires Postgres)

### Frontend `.env`

The canonical list lives in `frontend/.env.example`.

- `VITE_API_BASE_URL=http://localhost:3003`

## AI modes

Persona generation and simulations call the pluggable `LlmProvider`.

| `LLM_MODE` | Behavior |
|------------|----------|
| `mock` (default when `GOOGLE_CLOUD_PROJECT` is empty) | Deterministic offline responses — no API keys |
| `vertex` | Gemini via Vertex AI |

**Offline / demo (default):** leave `LLM_MODE=mock` in `backend/.env`.

**Real Gemini locally:**

1. Create a GCP project and enable the Vertex AI API.
2. `gcloud auth application-default login`
3. Set in `backend/.env`:
   - `LLM_MODE=vertex`
   - `GOOGLE_CLOUD_PROJECT=<your-project-id>`
   - Optional: `GEMINI_MODEL=gemini-2.0-flash`

## RAG (Retrieval)

The `.env.example` file defaults to `RAG_PROVIDER=inmemory` (built-in demo sources).

To enable pgvector-backed retrieval:

- Ensure Postgres is running (`docker compose up -d`)
- Set `DB_ENABLED=true`
- Set `RAG_PROVIDER=pgvector`
- Apply migrations when schema changes exist (see `docs/MIGRATIONS.md`)

Endpoints:

- `POST /rag/ingest/text` (requires `admin` or `analyst`)
- `POST /rag/ingest/file` (multipart, field name `file`, requires `admin` or `analyst`)
- `GET /rag/stats` (requires auth)
- `DELETE /rag/documents` (admin only)
- `POST /rag/query` (requires auth)

## Tests / Lint

Backend (from `backend/`):

```bash
npm run format
npm run lint
npm test
```

Frontend (from `frontend/`):

```bash
npm run lint
npm test
```

**Last Updated:** 2026-02-16
