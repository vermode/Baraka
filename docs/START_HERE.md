# Start Here — Baraka Codebase Tour

Welcome! This is a guide for someone who is new to coding. Read this file first.

## What is Baraka?

A website for charities in Jordan. People can donate, charities can register, admins can manage everything.

## The big picture

The site has **two main parts** that talk to each other:

```
+--------------+   HTTP requests   +-------------+
|   FRONTEND   |  -------------->  |   BACKEND   |
| (what you    |                   | (the brain) |
|  see in the  |  <--------------  |             |
|  browser)    |    JSON replies   |             |
+--------------+                   +-------------+
                                          |
                                          v
                                   +-------------+
                                   |  DATABASE   |
                                   |  (MySQL 8)  |
                                   +-------------+
```

- **Frontend** (folder `frontend/`) — React. Runs at `http://localhost:5173` during development.
- **Backend** (folder `backend/`) — Express. Runs at `http://localhost:8080` during development.
- **Database** — MySQL 8. Stores users, donations, organizations, etc.

There's a third folder, **`api-contract/`**, that defines the *contract* between frontend and backend — what URLs exist, what data they accept, what they return. Both sides use it to stay in sync.

## How to run it (Windows)

1. Make sure you have **Node 22+** and **pnpm** installed.
   - Check: `node --version` and `pnpm --version` in PowerShell.
   - If pnpm is missing: `npm install -g pnpm`
2. Make sure **MySQL 8** is running and you have a database called `baraka`.
   See `docs/HOW_TO/setup-mysql.md` for step-by-step install instructions.
3. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `SESSION_SECRET`.
4. Install dependencies (only the first time): `pnpm install`
5. Create the database tables: `pnpm db:push`
6. Start everything: `pnpm dev`
7. Open `http://localhost:5173` in your browser.

## Where to look for things

| I want to... | Look in... |
|---|---|
| Change something you see on the page | `frontend/src/pages/` or `frontend/src/components/` |
| Add a new API endpoint | `backend/src/routes/` |
| Change a database table | `backend/src/db/schema/` |
| Change colors / styling | `frontend/src/index.css` and Tailwind classes in components |
| Add a new page | `frontend/src/pages/` then register it in `frontend/src/App.tsx` |

## Next reads

- `docs/CODE_TOUR.md` — a deeper walkthrough with real file examples
- `docs/HOW_TO/add-a-page.md`, `add-an-api-endpoint.md`, `add-a-database-column.md` — recipes
- The `README.md` inside each big folder explains that folder
