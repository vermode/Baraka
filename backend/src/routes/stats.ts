import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  donationsTable,
  organizationsTable,
  beneficiariesTable,
  usersTable,
} from "../db";

const router: IRouter = Router();

// Coerce MySQL's BigInt count() result to a JS number — safe up to 2^53 rows,
// which is fine for charity stats.
function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") return Number(v) || 0;
  return 0;
}

router.get("/stats", async (_req, res): Promise<void> => {
  // MySQL doesn't support Postgres-style `::int` casts. mysql2 returns SUM() as
  // string and COUNT() as BigInt by default — we coerce in JS instead.
  const [agg] = await db
    .select({
      totalRaised: sql<number | string>`coalesce(sum(${donationsTable.amount}), 0)`,
      donationCount: sql<number | bigint>`count(*)`,
    })
    .from(donationsTable);

  const [donorAgg] = await db
    .select({ donorCount: sql<number | bigint>`count(*)` })
    .from(usersTable)
    .where(eq(usersTable.role, "donor"));

  const [orgAgg] = await db
    .select({ organizationCount: sql<number | bigint>`count(*)` })
    .from(organizationsTable);

  const [benAgg] = await db
    .select({ beneficiaryCount: sql<number | bigint>`count(*)` })
    .from(beneficiariesTable);

  res.json({
    totalRaised: toNum(agg?.totalRaised),
    donationCount: toNum(agg?.donationCount),
    donorCount: toNum(donorAgg?.donorCount),
    organizationCount: toNum(orgAgg?.organizationCount),
    beneficiaryCount: toNum(benAgg?.beneficiaryCount),
  });
});

export default router;
