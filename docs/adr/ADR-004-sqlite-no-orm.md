# ADR-004: expo-sqlite Without ORM

**Status:** Accepted  
**Date:** 2025-01-15  
**Deciders:** Architecture team  

---

## Context

MIND MASTERY stores persistent data across 6 relational tables:

| Table | Purpose | Approx. Rows |
|-------|---------|-------------|
| `sessions` | Completed session records | Hundreds |
| `progress` | Per-practice level/completion | ~50 |
| `journal` | Mood and notes entries | Thousands |
| `user_practices` | User-created custom practices | Tens |
| `practice_texts` | Localized narration texts | ~250 |
| `settings` | Key-value app configuration | ~30 |

Requirements:

- **ACID transactions** — session completion must atomically update progress + create session record
- **WAL mode** — readers don't block writers during active sessions
- **Typed queries** — all database operations must be fully typed in TypeScript (zero `any`)
- **No complex relations** — the data model is flat with occasional foreign keys; no many-to-many joins
- **Migration support** — schema must evolve across app versions without data loss

## Decision

Use **expo-sqlite ~15.0.0** with **hand-written SQL queries** wrapped in typed repository functions. **No ORM** (no Drizzle, no TypeORM, no WatermelonDB).

### Architecture

```
src/db/
├── index.ts           # Singleton: getDatabase(), closeDatabase(), checkpointWal()
├── schema.sql         # Canonical DDL (6 tables, 9 indexes)
├── types.ts           # Row/Input/Update interfaces for every table
├── lifecycle.ts       # initializeDatabase(), app state listener
├── migrations/
│   ├── v1.sql         # Initial schema
│   └── migrator.ts    # Idempotent migration runner
└── queries/
    ├── sessions.ts
    ├── progress.ts
    ├── journal.ts
    ├── userPractices.ts
    ├── practiceTexts.ts
    └── settings.ts
```

### Query pattern

```typescript
// Example: parameterized query with typed return
function getSession(id: string): Promise<SessionRow | null> {
  const db = getDatabase();
  const result = db.getFirstAsync<SessionRow>(
    'SELECT * FROM sessions WHERE id = ?',
    [id],
  );
  return result ?? null;
}
```

## Consequences

### Positive

- **Full control** — we write exactly the SQL we need; no ORM abstraction leakage
- **Zero overhead** — no ORM runtime, no query builder, no schema introspection
- **Typed rows** — generic `db.getFirstAsync<T>()` returns properly typed objects
- **Simple migrations** — versioned SQL files applied sequentially by migrator
- **Bundle size** — no ORM dependency; expo-sqlite is the only DB package

### Negative

- **No schema validation at runtime** — SQL typos cause runtime errors; mitigated by validation scripts (`scripts/validate-schema.ts`)
- **Manual CRUD** — each table needs explicit insert/update/delete functions; mitigated by consistent patterns in `queries/` files
- **No auto-generated types from schema** — types must be manually kept in sync with DDL; mitigated by `src/db/types.ts` single source of truth

### Rejected Alternatives

| Alternative | Reason |
|-------------|--------|
| Drizzle ORM | Adds 40KB+ to bundle; 6 flat tables don't justify ORM overhead; complex Expo integration |
| TypeORM | Heavy, decorator-based, poor React Native support |
| WatermelonDB | Designed for offline-first sync; overkill for local-only storage; large learning curve |
| AsyncStorage (only) | No relational queries, no ACID, no efficient range scans; SQLite is strictly superior for structured data |
| Realm | Proprietary binary format; difficult to debug; no SQL; vendor lock-in |

### Constraints

- **All queries MUST use parameterized bindings** (`?` placeholders) — never interpolate values into SQL strings (SQL injection prevention)
- **Foreign keys enforced** — `PRAGMA foreign_keys = ON` set at connection time
- **WAL mode** — `PRAGMA journal_mode = WAL` for concurrent read/write during sessions
- **Checkpoint on background** — `PRAGMA wal_checkpoint(TRUNCATE)` when app moves to background (FIX-13)
