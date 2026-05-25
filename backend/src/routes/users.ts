import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, usersTable } from "../db";
import { DeleteUserParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users", requireAdmin, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      phone: usersTable.phone,
      accountType: usersTable.accountType,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));
  res.json(rows);
});

router.delete("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const p = DeleteUserParams.safeParse(req.params);
  if (!p.success) {
    res.status(400).json({ error: p.error.message });
    return;
  }
  if (req.user!.id === p.data.id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, p.data.id));
  res.sendStatus(204);
});

export default router;
