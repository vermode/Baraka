import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, beneficiariesTable } from "../db";
import {
  CreateBeneficiaryBody,
  UpdateBeneficiaryBody,
  UpdateBeneficiaryParams,
  DeleteBeneficiaryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/beneficiaries", async (_req, res): Promise<void> => {
  const rows = await db.select().from(beneficiariesTable).orderBy(beneficiariesTable.id);
  res.json(rows);
});

router.post("/beneficiaries", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBeneficiaryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [{ id: newId }] = await db
    .insert(beneficiariesTable)
    .values(parsed.data)
    .$returningId();
  const [b] = await db
    .select()
    .from(beneficiariesTable)
    .where(eq(beneficiariesTable.id, newId));
  res.status(201).json(b);
});

router.patch("/beneficiaries/:id", requireAdmin, async (req, res): Promise<void> => {
  const p = UpdateBeneficiaryParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  const parsed = UpdateBeneficiaryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db
    .update(beneficiariesTable)
    .set(parsed.data)
    .where(eq(beneficiariesTable.id, p.data.id));
  const [b] = await db
    .select()
    .from(beneficiariesTable)
    .where(eq(beneficiariesTable.id, p.data.id));
  if (!b) {
    res.status(404).json({ error: "Beneficiary not found" });
    return;
  }
  res.json(b);
});

router.delete("/beneficiaries/:id", requireAdmin, async (req, res): Promise<void> => {
  const p = DeleteBeneficiaryParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  await db.delete(beneficiariesTable).where(eq(beneficiariesTable.id, p.data.id));
  res.sendStatus(204);
});

export default router;
