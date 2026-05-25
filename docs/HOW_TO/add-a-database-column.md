# How to add a new database column

Example: adding a `bio` text column to the `users` table.

1. **Edit the schema** at `backend/src/db/schema/users.ts`:
   ```ts
   export const usersTable = mysqlTable("users", {
     id: int("id").autoincrement().primaryKey(),
     name: varchar("name", { length: 120 }).notNull(),
     email: varchar("email", { length: 255 }).notNull().unique(),
     passwordHash: varchar("password_hash", { length: 255 }).notNull(),
     bio: text("bio"),                                 // <-- NEW
     // ...rest unchanged
   });
   ```

2. **Push the change to the database**:
   ```
   pnpm db:push
   ```
   Drizzle will show what it's about to do and ask for confirmation.

3. **Use the column** in any route, e.g.:
   ```ts
   await db.update(usersTable).set({ bio: "Hello!" }).where(eq(usersTable.id, 1));
   ```

4. **(If exposed via API)** update `api-contract/spec/openapi.yaml` to include the new field, then run `pnpm codegen`.

---

## Common column types (MySQL via Drizzle)

Import these from `drizzle-orm/mysql-core`.

| Type | Use for |
|---|---|
| `int("id").autoincrement().primaryKey()` | Auto-incrementing primary key |
| `varchar("col", { length: 255 })` | Short/medium text with a max length (use this for any field you'll `unique()` or filter on) |
| `text("col")` | Long text (up to 64 kB) |
| `int("col")` | Whole numbers |
| `boolean("col")` | True/false |
| `timestamp("col")` | Date + time (stored as UTC, returned as JS `Date`) |
| `double("col")` | Decimal numbers (e.g. lat/lng) |

Modifiers:
- `.notNull()` — make the column required.
- `.default(...)` / `.defaultNow()` — default value.
- `.unique()` — must be unique. **MySQL note:** only works on `varchar` (not `text`); pick a sensible max length like 255.
- `.references(() => otherTable.id, { onDelete: "cascade" })` — foreign key.

After editing, run `pnpm db:push` to apply the change to your local MySQL database.
