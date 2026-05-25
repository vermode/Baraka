# Database

The site's data lives in **MySQL 8**. This folder defines all the tables and exports the database client.

> First-time install? See `docs/HOW_TO/setup-mysql.md`.

## Files

| File | Purpose |
|---|---|
| `index.ts` | Creates the connection pool and exports the `db` client + every table. |
| `drizzle.config.ts` | Config for `drizzle-kit push` (where to find the schema, how to connect). |
| `migrate-from-postgres.ts` | One-time script to copy data from an old PostgreSQL DB. Safe to delete once you've run it. |
| `schema/index.ts` | Re-exports every table file. |
| `schema/users.ts` | The `users` table — login, role, account type. |
| `schema/organizations.ts` | Charities. |
| `schema/beneficiaries.ts` | People who need help. |
| `schema/donations.ts` | Donations made by users. |
| `schema/announcements.ts` | News/updates posted by charities. |
| `schema/notifications.ts` | In-app notifications for users. |
| `schema/help_requests.ts` | Help requests submitted by visitors. |
| `schema/registration_requests.ts` | Charity registration applications waiting for admin approval. |

## How to change the schema

1. Edit a file in `schema/`.
2. From the repo root: `pnpm db:push`.
3. Drizzle compares your schema to the live DB and updates it.

## How queries work

```ts
import { db, usersTable } from "./db";
import { eq } from "drizzle-orm";

const [user] = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, "foo@example.com"));
```

Drizzle turns this into safe parameterized SQL — **no SQL injection possible**.
