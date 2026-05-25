# Routes

One file per resource. Each file exports an Express router that gets mounted under `/api` in `index.ts`.

| File | Endpoints | Auth |
|---|---|---|
| `health.ts` | `GET /healthz` | public |
| `auth.ts` | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | mixed |
| `users.ts` | `GET /users`, `DELETE /users/:id` | admin only |
| `organizations.ts` | List / create / update / delete charities | mixed (list public, write admin) |
| `beneficiaries.ts` | List / create / update / delete people in need | mixed |
| `donations.ts` | `GET /donations`, `GET /donations/me`, `POST /donations` | auth required |
| `announcements.ts` | List / create / delete news | mixed |
| `notifications.ts` | `GET /notifications`, `PATCH /notifications/:id/read` | auth required |
| `help_requests.ts` | Create (public), list/update (admin) | mixed |
| `registration_requests.ts` | Create (public), list/update (admin) | mixed |
| `stats.ts` | `GET /stats` | public |
| `index.ts` | Mounts everything | — |

## Anatomy of a route file

```ts
import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "../db";
import { SomeBodySchema } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/example", requireAdmin, async (req, res) => {
  const parsed = SomeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [{ id: newId }] = await db.insert(usersTable).values(parsed.data).$returningId();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, newId));
  res.status(201).json(user);
});

export default router;
```

Three things to always do:
1. **Validate** input with a Zod schema from `@workspace/api-zod`.
2. **Add auth** (`requireAuth` or `requireAdmin`) if the endpoint isn't public.
3. **Use Drizzle** for DB queries — never write raw SQL strings.
