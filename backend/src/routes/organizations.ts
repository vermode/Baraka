import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, organizationsTable } from "../db";
import {
  CreateOrganizationBody,
  UpdateOrganizationBody,
  GetOrganizationParams,
  UpdateOrganizationParams,
  DeleteOrganizationParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/organizations", async (_req, res): Promise<void> => {
  const rows = await db.select().from(organizationsTable).orderBy(organizationsTable.id);
  res.json(rows);
});

router.get("/organizations/:id", async (req, res): Promise<void> => {
  const p = GetOrganizationParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  const [org] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, p.data.id));
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.json(org);
});

router.post("/organizations", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateOrganizationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [{ id: newId }] = await db
    .insert(organizationsTable)
    .values(parsed.data)
    .$returningId();
  const [org] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, newId));
  res.status(201).json(org);
});

router.patch("/organizations/:id", requireAdmin, async (req, res): Promise<void> => {
  const p = UpdateOrganizationParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  const parsed = UpdateOrganizationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db
    .update(organizationsTable)
    .set(parsed.data)
    .where(eq(organizationsTable.id, p.data.id));
  const [org] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, p.data.id));
  if (!org) {
    res.status(404).json({ error: "Organization not found" });
    return;
  }
  res.json(org);
});

router.delete("/organizations/:id", requireAdmin, async (req, res): Promise<void> => {
  const p = DeleteOrganizationParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  await db.delete(organizationsTable).where(eq(organizationsTable.id, p.data.id));
  res.sendStatus(204);
});

export default router;
