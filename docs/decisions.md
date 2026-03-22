# Architectural Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-20 | Drizzle ORM over raw SQLite | Type-safe schema, migrations, query builder |
| 2026-03-20 | Zustand over Redux | Minimal boilerplate, hooks-first API, no provider needed |
| 2026-03-20 | Expo Router | File-based routing, first-class Expo support, web compat |
| 2026-03-20 | React Query for remote data | Async state, caching, offline queue built-in |
| 2026-03-21 | EAS for Internal Distribution | Secure, repeatable cloud builds for Android/iOS preview |
| 2026-03-21 | Platform-Isolated Architecture | Use `.native.ts` extensions to strictly separate Web mocks from Native modules (SQLite, SecureStore) |
