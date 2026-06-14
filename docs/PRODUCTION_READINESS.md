# Production Readiness

A snapshot of the backend's production hardening, layer by layer. Status key:
**Done** = already in place, **Added** = implemented in this pass, **TODO** = not
done yet (intentional / needs infra).

| # | Layer | Status | Where |
|---|-------|--------|-------|
| 1 | Security headers (Helmet + CSP) | Done | `backend/src/app.ts` |
| 2 | CORS allowlist (no wildcard) | Done | `backend/src/app.ts` |
| 3 | Request body size cap (100 kB) | Done | `backend/src/app.ts` |
| 4 | Input validation (Zod from OpenAPI) | Done | `backend/src/routes/*` |
| 5 | Auth: scrypt hashing + httpOnly/sameSite session cookie | Done | `backend/src/lib/auth.ts` |
| 6 | App-level ownership / authorization checks | Done | e.g. `routes/donations.ts` |
| 7 | Structured logging with secret redaction | Done | `backend/src/lib/logger.ts` |
| 8 | Centralized error handler (no stack-trace leaks) | Done | `backend/src/app.ts` |
| 9 | Rate limiting | Added | API-wide baseline + stricter `/api/auth` |
| 10 | HTTP caching (ETag + `Cache-Control` on public reads) | Added | `backend/src/app.ts` |
| 11 | Error tracking hook | Added | `backend/src/lib/observability.ts` |
| 12 | Liveness + readiness probes | Added | `GET /api/healthz`, `GET /api/readyz` |
| 13 | Graceful shutdown (drain + close DB pool) | Added | `backend/src/index.ts` |
| — | CI (typecheck + build on every push/PR) | Added | `.github/workflows/ci.yml` |

## What was added in this pass

- **Rate limiting (layer 9).** A baseline limiter (300 req / 15 min / IP) now
  applies to all of `/api`, with the existing strict auth limiter (20 / 15 min)
  stacked on top of `/api/auth`.
- **Caching (layer 10).** Express already emits a weak ETag per response (cheap
  304s). We additionally set `Cache-Control: public, max-age=30,
  stale-while-revalidate=60` on the public, non-personalized read endpoints
  (`/api/stats`, `/api/organizations`, `/api/beneficiaries`,
  `/api/announcements`). Per-user data is never cached.
- **Error tracking (layer 11).** All unhandled errors funnel through
  `captureException`. No heavy SDK is bundled until `ERROR_TRACKING_DSN` is set
  and the SDK is wired in `observability.ts` — keeping dependencies lean.
- **Readiness probe (layer 12).** `GET /api/readyz` runs `SELECT 1`; it returns
  `503` when the database is unreachable so a load balancer can route around the
  instance. `GET /api/healthz` remains the liveness probe.
- **Graceful shutdown (layer 13).** On `SIGTERM`/`SIGINT` the server stops
  accepting connections, lets in-flight requests finish, closes the MySQL pool,
  then exits — with a 10 s hard-timeout fallback.
- **CI.** `.github/workflows/ci.yml` installs with a frozen lockfile, then runs
  `pnpm typecheck` and the per-package builds on every push and pull request.

## Known TODO / out of scope

- **DB-level RLS:** not available — MySQL has no row-level security, so
  authorization stays at the application layer (layer 6).
- **Frontend bundle size:** the initial JS bundle is ~1 MB (Leaflet, Recharts,
  Framer Motion). Lazy-loading the map/dashboard routes would cut this; not done
  yet.
- **Error-tracking SDK:** the hook exists; the actual service (e.g. Sentry) is
  not installed.
