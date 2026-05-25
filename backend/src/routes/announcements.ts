import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, announcementsTable, organizationsTable } from "../db";
import { CreateAnnouncementBody, DeleteAnnouncementParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/announcements", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: announcementsTable.id,
      title: announcementsTable.title,
      body: announcementsTable.body,
      kind: announcementsTable.kind,
      organizationId: announcementsTable.organizationId,
      organizationName: organizationsTable.name,
      createdAt: announcementsTable.createdAt,
    })
    .from(announcementsTable)
    .leftJoin(organizationsTable, eq(announcementsTable.organizationId, organizationsTable.id))
    .orderBy(desc(announcementsTable.createdAt));
  res.json(rows);
});

router.post("/announcements", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [{ id: newId }] = await db
    .insert(announcementsTable)
    .values({
      title: parsed.data.title,
      body: parsed.data.body,
      kind: parsed.data.kind ?? "news",
      organizationId: parsed.data.organizationId ?? null,
    })
    .$returningId();
  const [a] = await db
    .select()
    .from(announcementsTable)
    .where(eq(announcementsTable.id, newId));

  let orgName: string | null = null;
  if (a.organizationId != null) {
    const [org] = await db
      .select({ name: organizationsTable.name })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, a.organizationId));
    orgName = org?.name ?? null;
  }

  res.status(201).json({ ...a, organizationName: orgName });
});

router.delete("/announcements/:id", requireAdmin, async (req, res): Promise<void> => {
  const p = DeleteAnnouncementParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  await db.delete(announcementsTable).where(eq(announcementsTable.id, p.data.id));
  res.sendStatus(204);
});

export default router;
