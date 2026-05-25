import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, notificationsTable } from "../db";
import { MarkNotificationReadParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.id))
    .orderBy(desc(notificationsTable.createdAt));
  res.json(rows);
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const p = MarkNotificationReadParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  // The WHERE on userId enforces ownership: a user can never mark someone else's
  // notification as read (IDOR protection).
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(
      and(
        eq(notificationsTable.id, p.data.id),
        eq(notificationsTable.userId, req.user!.id),
      ),
    );
  const [n] = await db
    .select()
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.id, p.data.id),
        eq(notificationsTable.userId, req.user!.id),
      ),
    );
  if (!n) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(n);
});

export default router;
