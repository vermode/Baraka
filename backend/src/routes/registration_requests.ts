import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, registrationRequestsTable } from "../db";
import {
  CreateRegistrationRequestBody,
  UpdateRegistrationRequestBody,
  UpdateRegistrationRequestParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/registration-requests", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const [{ id: newId }] = await db
    .insert(registrationRequestsTable)
    .values({
      orgName: d.orgName,
      governorate: d.governorate,
      category: d.category,
      regNumber: d.regNumber ?? null,
      about: d.about,
      contactName: d.contactName,
      contactPhone: d.contactPhone,
      email: d.email ?? null,
    })
    .$returningId();
  const [row] = await db
    .select()
    .from(registrationRequestsTable)
    .where(eq(registrationRequestsTable.id, newId));
  res.status(201).json(row);
});

router.get("/registration-requests", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(registrationRequestsTable)
    .orderBy(desc(registrationRequestsTable.createdAt));
  res.json(rows);
});

router.patch(
  "/registration-requests/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const p = UpdateRegistrationRequestParams.safeParse(req.params);
    const b = UpdateRegistrationRequestBody.safeParse(req.body);
    if (!p.success || !b.success) {
      res.status(400).json({ error: (p.success ? b : p).error!.message });
      return;
    }
    await db
      .update(registrationRequestsTable)
      .set({
        status: b.data.status,
        adminNote: b.data.adminNote ?? null,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
      })
      .where(eq(registrationRequestsTable.id, p.data.id));
    const [row] = await db
      .select()
      .from(registrationRequestsTable)
      .where(eq(registrationRequestsTable.id, p.data.id));
    if (!row) {
      res.status(404).json({ error: "Registration request not found" });
      return;
    }
    res.json(row);
  },
);

export default router;
