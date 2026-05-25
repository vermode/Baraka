# Backend (Express API)

The brain of the site. Runs on `http://localhost:8080` in dev. Uses **MySQL 8** for storage.

## Commands

```bash
pnpm dev:backend                                    # start dev server (from repo root)
pnpm db:push                                        # apply schema changes to the DB
pnpm --filter @workspace/backend run build          # production build (bundled with esbuild)
```

## What's inside `src/`

| Folder/File | Purpose |
|---|---|
| `index.ts` | Entry point. Starts the HTTP server. |
| `app.ts` | Express app setup: CORS, body parser, logging, routes. |
| `routes/` | One file per resource (auth, users, donations, etc.). Each file exports an Express router. |
| `routes/index.ts` | Wires every router together under `/api`. |
| `middlewares/auth.ts` | `loadUser`, `requireAuth`, `requireAdmin`. |
| `lib/auth.ts` | Password hashing (scrypt) + session token signing (HMAC). |
| `lib/logger.ts` | Pino logger setup (structured JSON logs, secret redaction). |
| `db/index.ts` | Drizzle ORM client (`db`) + the connection pool. |
| `db/schema/` | One file per database table. |
| `db/drizzle.config.ts` | Config for `drizzle-kit push`. |
| `build.mjs` | esbuild bundle script for production builds. |

## How a request flows

```
HTTP request
   |
   v
app.ts            -> cors, cookie-parser, json body, logger, loadUser middleware
   |
   v
routes/index.ts   -> dispatches to the right resource router
   |
   v
routes/<resource>.ts  -> validates body with Zod, queries DB with Drizzle, returns JSON
```

## Adding things

- New endpoint → see `docs/HOW_TO/add-an-api-endpoint.md`
- New table or column → see `docs/HOW_TO/add-a-database-column.md`

## Environment variables

Defined in the repo-root `.env`:

- `DATABASE_URL` — MySQL connection string (`mysql://user:pass@host:3306/baraka`)
- `SESSION_SECRET` — random ≥32-char string used to sign session cookies (the backend refuses to start with anything shorter)
- `CORS_ORIGIN` — comma-separated list of frontend origins allowed to call the API (default: `http://localhost:5173`)
- `OLD_DATABASE_URL` (optional) — old PostgreSQL URL, used only by the one-time `db:migrate-from-postgres` script
- `PORT` (optional, defaults to 8080)
- `LOG_LEVEL` (optional, defaults to "info")
- `NODE_ENV=production` enables the secure cookie flag
