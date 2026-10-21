# Database Migrations

TypeORM migrations keep schema changes explicit and reviewable. Use `DB_SYNC=false` for normal development; reserve `DB_SYNC=true` for bootstrapping a brand-new local database once.

## Commands

From `backend/`:

```bash
npm run migration:show
npm run migration:run
npm run migration:revert
```

## Environment

| Variable | Purpose |
|----------|---------|
| `DB_SYNC` | When `true`, TypeORM creates/updates tables on startup (local bootstrap only) |
| `DB_RUN_MIGRATIONS` | When `true`, runs pending migrations on API startup |
| `DB_ENABLED` | When `false`, the API uses in-memory repositories (no Postgres) |

Migration sources live in `backend/src/infrastructure/database/migrations/`. The CLI data source is `backend/src/infrastructure/database/data-source.ts`.

## Adding a migration

1. Add a file under `backend/src/infrastructure/database/migrations/`.
2. Register the class in `data-source.ts` and `typeorm.module.ts`.
3. Run `npm run migration:run` locally and verify affected endpoints.

Prefer forward-fix migrations over revert in shared databases.
