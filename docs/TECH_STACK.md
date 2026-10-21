# Technology Stack

**Synthetic Market Research Platform - Technical Infrastructure**

---

## Overview

The platform is built as a modern full-stack TypeScript application using enterprise-grade frameworks and cloud-native services.

---

## Frontend

### Core Framework
- **React 19** - UI library with hooks-based state management
- **TypeScript** - Strict typing for type safety
- **Vite** - Fast build tool and dev server

### UI Components
- **Material-UI (MUI) v7** - React component library
  - Responsive grid system
  - Pre-built components (Dialog, Card, Chip, etc.)
  - Theme customization
  - Icons from @mui/icons-material

### State Management
- **React Context** - AuthContext for authentication state
- **React Hooks** - useState, useEffect, useMemo
- **No Redux/MobX/Zustand** - Keeping it simple with context + local state

### API Communication
- **Fetch API** - Native HTTP client
- **TypeScript interfaces** - Type-safe API contracts
- **Base URL configuration** - Environment-based API endpoints

### Build & Development
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "test": "vitest"
}
```

### Dependencies (Key)
```json
{
  "react": "^19.x",
  "@mui/material": "^7.x",
  "typescript": "^5.x",
  "vite": "^7.x"
}
```

---

## Backend

### Core Framework
- **NestJS** - Progressive Node.js framework
  - Modular architecture
  - Dependency injection
  - Decorator-based routing
  - Built-in validation

### Language
- **TypeScript** - Strict mode enabled
  - Interfaces for all DTOs
  - Type-safe dependency injection
  - Comprehensive type coverage

### Architecture Pattern
- **Clean Architecture** (Uncle Bob)
  - Domain layer: Pure business logic
  - Application layer: Use cases
  - Infrastructure layer: External services
  - Presentation layer: HTTP controllers

### ORM & Database
- **TypeORM** - TypeScript ORM for SQL databases
  - Entity decorators
  - Repository pattern
  - Migration support
  - Query builder
- **PostgreSQL 16** - Primary database
  - JSON/JSONB support for complex types
  - Full-text search capabilities
  - ACID transactions

### AI/LLM Integration
- **Vertex AI** - Google Cloud AI platform
  - Gemini 1.5 Pro model
  - JSON response mode
  - Configurable temperature/top-p
  - Batch request handling
- **@google-cloud/vertexai** - Official SDK

### Configuration
- **@nestjs/config** - Environment-based configuration
  - `.env` file support
  - Type-safe config service
  - Validation schemas

### Logging
- **NestJS Logger** - Built-in structured logging
  - Context-aware logs
  - Log levels (error, warn, log, debug)
  - Timestamp and process ID

### Validation
- **class-validator** - Decorator-based validation
- **class-transformer** - DTO transformation

### Build & Development
```json
{
  "start:dev": "nest start --watch",
  "build": "nest build",
  "test": "jest",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "lint": "eslint \"{src,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "migration:run": "npm run build && npx typeorm -d dist/infrastructure/database/data-source.js migration:run"
}
```

### Dependencies (Key)
```json
{
  "@nestjs/core": "^11.x",
  "@nestjs/common": "^11.x",
  "typeorm": "^0.3.x",
  "pg": "^8.x",
  "@google-cloud/vertexai": "^1.x",
  "class-validator": "^0.14.x",
  "rxjs": "^7.x"
}
```

---

## Database

### Primary Database
**PostgreSQL 16**

**Why PostgreSQL:**
- JSONB support for complex persona models
- Full-text search for RAG
- Strong ACID guarantees
- Mature ecosystem and tooling
- Excellent performance at scale

**Schema Management:**
- TypeORM migrations
- Optional auto-sync in development (`DB_SYNC=true`), but default is `false`
- Production deployments use a migration-before-deploy flow (see `docs/MIGRATIONS.md`)

**Connection Modes:**
- **Local:** Docker Compose on port 5445
- **Cloud:** Cloud SQL with Cloud SQL Auth Proxy
- **Development:** Optional in-memory mode (`DB_ENABLED=false`)

### Data Models (Key Tables)
```sql
-- Segments: Market segment definitions
segments (
  id uuid PRIMARY KEY,
  name varchar(255),
  description text,
  demographic_criteria jsonb,
  psychographic_traits jsonb,
  behavioral_patterns jsonb,
  created_at timestamp,
  updated_at timestamp
)

-- Personas: Synthetic individuals
personas (
  id uuid PRIMARY KEY,
  name varchar(255),
  segment_id uuid REFERENCES segments(id),
  age integer,
  gender varchar(50),
  location varchar(255),
  income integer,
  occupation varchar(255),
  personality jsonb,  -- OCEAN traits
  health_profile jsonb,
  cognitive_profile jsonb,  -- Biases
  decision_style jsonb,
  motivations jsonb,
  barriers jsonb,
  trust_channel varchar(255),
  purchase_triggers jsonb,
  budget_range varchar(100),
  context_notes text,
  created_at timestamp
)

-- Hypotheses: Test statements
hypotheses (
  id uuid PRIMARY KEY,
  stage varchar(10),  -- H1, H2, H3
  title varchar(500),
  statement text,
  status varchar(50),
  success_criteria text,
  created_at timestamp
)

-- Simulations: Test results
simulations (
  id uuid PRIMARY KEY,
  hypothesis text,
  status varchar(50),
  summary jsonb,
  decisions jsonb,
  rag_sources jsonb,
  top_signals jsonb,
  objections jsonb,
  created_at timestamp,
  completed_at timestamp
)
```

---

## AI & LLM Services

### Vertex AI (Gemini 1.5 Pro)

**Purpose:** AI-powered persona generation and simulation reasoning

**Capabilities:**
- Text generation with configurable creativity (temperature 0-1)
- JSON mode for structured output
- System prompt support
- Multi-turn conversations (future)

**Configuration:**
```typescript
{
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: 'us-central1',
  model: 'gemini-1.5-pro'
}
```

**Cost Management:**
- Batch processing (5 personas per batch)
- Rate limiting
- Cost tracking per simulation
- Caching for repeated queries (planned)

**Prompting Strategy:**
1. **System 1 (Emotional):**
   - High temperature (0.7 + neuroticism/500)
   - First-person perspective
   - Personality-driven
   - Single-sentence output

2. **System 2 (Rational):**
   - Low temperature (0.2)
   - JSON response mode
   - Budget/barrier-aware
   - Structured decision output

---

## RAG (Retrieval Augmented Generation)

### Implementation (pgvector)

**Vector Database:** PostgreSQL with pgvector extension (v0.8.1 in Cloud SQL)

**Embedding Model:** Vertex AI `text-embedding-005` (768 dimensions)

**Pipeline:**
```
Document Ingestion → Chunking → Embedding → pgvector Store
                                              ↓
Query → Embedding → Cosine Similarity Search → Top K Results → LLM Context
```

**Chunking:** Character-based, 2000 chars per chunk, 200 char overlap, paragraph-aware splitting.

**Document Ingestion:** Supports PDF, TXT, MD, HTML, CSV, JSON via `POST /rag/ingest/file` (multipart) or `POST /rag/ingest/text` (JSON).

**Corpus:**
- 26-doc demo corpus auto-seeds on backend startup
- 24-doc starter corpus loadable from the frontend Documents page
- Production corpus needs curation (target: 100+ quality docs)

**Modes:**
- `RAG_PROVIDER=inmemory` — Built-in demo sources (default in `.env.example`, used in CI)
- `RAG_PROVIDER=pgvector` — Vector search via PostgreSQL + pgvector (requires Vertex embeddings)

**HNSW Index:** Created on `document_chunks.embedding` for fast approximate nearest-neighbor queries.

---

## Infrastructure

### Local Development

**Docker Compose:**
```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5445:5432"  # External:Internal
    environment:
      POSTGRES_USER: smr
      POSTGRES_PASSWORD: smr
      POSTGRES_DB: smr
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Environment Variables:**
```env
# Backend
DB_ENABLED=true               # false = in-memory repos, true = PostgreSQL
DB_HOST=localhost
DB_PORT=5445
DB_USER=smr
DB_PASSWORD=smr
DB_NAME=smr
DB_SYNC=false                 # Keep false; use migrations
DB_RUN_MIGRATIONS=false
LLM_MODE=mock
GOOGLE_CLOUD_PROJECT=
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGIN=http://localhost:5175
```

### Testing
- **Backend:** Jest unit tests (`npm test`), colocated `*.spec.ts`
- **Frontend:** Vitest + Testing Library (`npm test`)
- **Coverage:** Backend: `npm run test:cov`; Frontend: `npx vitest --coverage`

### Version Control
- **Git** - Source control
- **GitHub** - Repository hosting
- **.gitignore** - Exclude node_modules, .env, dist

### IDE Recommendations
- **VS Code** - Recommended IDE
  - Extensions: ESLint, Prettier, TypeScript
  - Settings: Format on save, auto-import

---

## Security

### Current Implementation
- JWT authentication (`/auth/register`, `/auth/login`, `/auth/me`, `/auth/bootstrap-admin`)
- Role-based access: `@Roles('admin','analyst')` on all mutation endpoints + global `RolesGuard`
- `@Public()` decorator bypasses auth on health, auth, and legal endpoints
- API throttling: 10 req/sec, 100 req/min via `@nestjs/throttler`
- CORS configuration via `CORS_ORIGIN`
- Input validation with `class-validator` (`whitelist: true, forbidNonWhitelisted: true`)
- SQL injection protection (TypeORM parameterized queries)
- Global exception filter with user-friendly error messages
- Structured request logging via `LoggerInterceptor`
- Environment variable separation

### Missing (Medium Priority)
- Workspace/organization isolation (multi-tenancy)
- Fine-grained per-resource access control
- Seed controller requires admin role (enforced)
- Secret rotation
- Audit logging

---

## Performance Considerations

### Current
- Batch processing for LLM calls (5 at a time)
- PostgreSQL connection pooling
- TypeORM query optimization

### Planned
- Redis for caching (LLM responses)
- Database query optimization and indexing
- Queue-based simulation workers for higher concurrency

---

## Monitoring & Observability

### Current
- NestJS Logger for application logs
- Console output in development

### Planned
- Structured logging (JSON format)
- OpenTelemetry traces for simulation pipelines
- Error tracking (e.g. Sentry)

---

## Scalability (design direction)

### Current limits
- Single backend process
- In-memory or single Postgres instance
- Batched LLM calls (5 concurrent)

### Future improvements
- Job queue for long-running simulations
- Read replicas when persistence grows
- Parallel LLM batches with rate-limit aware workers

---

## Technology Decisions & Rationale

### Why NestJS?
- Enterprise-grade architecture patterns
- Built-in dependency injection
- TypeScript-first approach
- Modular and testable

### Why React?
- Component-based UI development
- Large ecosystem and community
- Excellent TypeScript support
- Material-UI provides professional components

### Why PostgreSQL?
- JSONB for flexible schema
- Full-text search for RAG
- Mature and reliable
- pgvector extension for embeddings in the same database

### Why Vertex AI / Gemini?
- Strong structured JSON output for persona and simulation schemas
- Swappable via `LlmProvider` (`mock` mode for offline demos)
- JSON response mode for reliable parsing

### Why Clean Architecture?
- Testability and maintainability
- Framework independence
- Clear separation of concerns
- Easy to extend and refactor

---

**Last Updated:** February 16, 2026  
**Tech Stack Version:** 1.0.0
