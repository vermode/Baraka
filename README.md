# بركة — Baraka

A charity platform for Jordan. RTL Arabic-first website where donors, charities, and admins can connect.

> **Setting up the project on a new laptop?** Follow [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) — step-by-step, beginner-friendly.
>
> **New to this codebase?** Read [`docs/START_HERE.md`](./docs/START_HERE.md) for a tour.

## Quick start

```bash
pnpm install         # one-time
cp .env.example .env # then fill in DATABASE_URL and SESSION_SECRET
pnpm db:push         # create the database tables
pnpm dev             # runs frontend (5173) + backend (8080)
```

Open <http://localhost:5173>.

## Folders

```
frontend/        React + Vite (the website)
backend/         Express + Drizzle + MySQL (the API)
api-contract/    Shared API definition (OpenAPI -> Zod + React Query hooks)
docs/            Beginner-friendly guides and walkthroughs
```

Each folder has its own `README.md` explaining what's inside.

## Common commands

```bash
pnpm dev               # both frontend + backend
pnpm dev:frontend
pnpm dev:backend
pnpm db:push           # apply schema changes to DB
pnpm codegen           # regenerate API client from openapi.yaml
pnpm typecheck         # type-check the whole workspace
pnpm run build         # production build of everything
```

## Tech stack at a glance

- **Frontend**: React 19, Vite 7, TailwindCSS 4, shadcn/ui, React Query, Wouter, Leaflet
- **Backend**: Express 5, Drizzle ORM, MySQL 8, Pino, scrypt-based sessions, Helmet, rate limiting
- **Shared**: OpenAPI 3 + Orval codegen → Zod schemas and React Query hooks
- **Tooling**: pnpm workspaces, TypeScript 5.9, esbuild

See [`docs/CODE_TOUR.md`](./docs/CODE_TOUR.md) for a deeper walkthrough.

## Creating the first admin user

```bash
# after signing up via the website:
mysql -u baraka_app -p baraka -e "UPDATE users SET role = 'admin' WHERE email = 'you@example.com';"
```

## First-time setup?

See [`docs/HOW_TO/setup-mysql.md`](./docs/HOW_TO/setup-mysql.md) for installing MySQL on Windows.
See [`docs/SECURITY.md`](./docs/SECURITY.md) for the security posture and threat model.
