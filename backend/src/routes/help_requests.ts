import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, helpRequestsTable } from "../db";
import {
  CreateHelpRequestBody,
  UpdateHelpRequestBody,
  UpdateHelpRequestParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// Public endpoint — anyone in need can submit a request
router.post("/help-requests", async (req, res): Promise<void> => {
  const parsed = CreateHelpRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [{ id: newId }] = await db
    .insert(helpRequestsTable)
    .values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      governorate: parsed.data.governorate,
      aidType: parsed.data.aidType,
      description: parsed.data.description,
    })
    .$returningId();
  const [row] = await db
    .select()
    .from(helpRequestsTable)
    .where(eq(helpRequestsTable.id, newId));
  res.status(201).json(row);
});

router.get("/help-requests", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(helpRequestsTable)
    .orderBy(desc(helpRequestsTable.createdAt));
  res.json(rows);
});

router.patch("/help-requests/:id", requireAdmin, async (req, res): Promise<void> => {
  const p = UpdateHelpRequestParams.safeParse(req.params);
  const b = UpdateHelpRequestBody.safeParse(req.body);
  if (!p.success || !b.success) {
    res.status(400).json({ error: (p.success ? b : p).error!.message });
    return;
  }
  await db
    .update(helpRequestsTable)
    .set({
      status: b.data.status,
      adminNote: b.data.adminNote ?? null,
      reviewedBy: req.user!.id,
      reviewedAt: new Date(),
    })
    .where(eq(helpRequestsTable.id, p.data.id));
  const [row] = await db
    .select()
    .from(helpRequestsTable)
    .where(eq(helpRequestsTable.id, p.data.id));
  if (!row) {
    res.status(404).json({ error: "Help request not found" });
    return;
  }
  res.json(row);
});

export default router;
