# Code Tour

A guided walk through the codebase, following real user actions.

## Top-level folders

```
baraka/
├── frontend/        The website you see in the browser (React + Vite)
├── backend/         The API server (Express + Drizzle + PostgreSQL)
├── api-contract/    The shared agreement between frontend & backend
├── docs/            You are here
├── .env             Your local secrets (NEVER commit this)
├── .env.example     A template showing which secrets to set
└── package.json     The root commands (pnpm dev, pnpm db:push, etc.)
```

## What happens when you open `http://localhost:5173/`

1. **Browser** asks Vite for the page.
2. Vite serves `frontend/index.html`, which loads `frontend/src/main.tsx`.
3. `main.tsx` mounts the `<App />` component from `frontend/src/App.tsx`.
4. `App.tsx` wires up:
   - **Routing** (`wouter`) — picks which page to show based on the URL.
   - **Data fetching** (`@tanstack/react-query`) — caches API responses.
   - **Theme** (`next-themes`) — dark/light mode.
   - **Language** (custom `LanguageContext`) — Arabic / English.
5. The URL is `/`, so wouter renders `frontend/src/pages/Home.tsx`.
6. `Home.tsx` lists landing sections from `frontend/src/components/landing/`:
   `Hero`, `Trust`, `Features`, `Directory`, `LiveImpact`, `LatestNews`, etc.
7. Some sections fetch live data (e.g. `LiveImpact` calls `useGetStats()` which is a generated hook from `api-contract/react-client/`).
8. That hook makes a `GET /api/stats` request. The Vite dev server proxies `/api/*` to the backend (port 8080).
9. **Backend** routes the request to `backend/src/routes/stats.ts`, which queries the database via Drizzle and returns JSON.
10. React Query stores the result in cache; the component re-renders with the data.

## What happens when you click **Login** and submit

1. You're on `frontend/src/pages/Login.tsx`.
2. The form uses `react-hook-form` + Zod for validation.
3. On submit, it calls `login()` from `useAuth` (`frontend/src/hooks/useAuth.ts`), which under the hood calls the generated `login()` function from `api-contract/react-client/`.
4. That sends `POST /api/auth/login` with `{ email, password }` as JSON.
5. Vite proxy forwards to the backend.
6. **Backend** `backend/src/routes/auth.ts:62` handles it:
   - Validates the body against `LoginBody` (Zod schema generated from the OpenAPI spec).
   - Looks up the user by email in PostgreSQL via Drizzle (`db.select().from(usersTable)...`).
   - Hashes the submitted password with `scrypt` and compares (constant-time) — see `backend/src/lib/auth.ts`.
   - If correct, signs a session token (HMAC-SHA256) and sets it as an `httpOnly` cookie called `baraka_session`.
   - Responds with the user info.
7. Frontend stores nothing — the cookie is automatic. React Query invalidates `getMe`, the page re-renders authenticated, and the user is redirected.

## What happens when you `pnpm db:push`

1. Runs `drizzle-kit push` using `backend/src/db/drizzle.config.ts`.
2. Drizzle Kit reads all schema files in `backend/src/db/schema/*.ts`.
3. Compares with the live database and runs ALTER/CREATE statements to match.
4. Done — your tables now match the code.

## What happens when you regenerate the API contract (`pnpm codegen`)

1. Reads `api-contract/spec/openapi.yaml` (the single source of truth for the API).
2. Uses `orval` to generate two folders of code:
   - `api-contract/zod/src/generated/` — Zod validation schemas (used by the backend to validate incoming bodies).
   - `api-contract/react-client/src/generated/` — typed React Query hooks (used by the frontend to call the API).
3. Re-typechecks everything to make sure both sides still compile.

This is how the frontend and backend stay perfectly in sync: change `openapi.yaml`, run codegen, both sides update.

## Auth in one paragraph

When you sign up, your password is hashed using **scrypt** (a slow, salted hash) and saved as `salt:hash`. When you log in, the backend hashes your submitted password the same way and uses `timingSafeEqual` to compare. On success the backend gives you a cookie containing `userId.HMAC(userId, SESSION_SECRET)`. Every subsequent request includes that cookie automatically; the backend verifies the HMAC to know who you are. Logout just clears the cookie. The cookie is `httpOnly` (JavaScript can't read it) and `sameSite=lax` (basic CSRF protection).

## Database in one paragraph

We use **PostgreSQL** + **Drizzle ORM**. The schema is TypeScript files in `backend/src/db/schema/`. Each file defines one table (e.g. `users.ts`, `donations.ts`). You write queries in TypeScript like `db.select().from(usersTable).where(eq(usersTable.email, email))` — Drizzle turns them into safe SQL (no injection, ever). When you change a schema file, run `pnpm db:push` to update the actual database.
