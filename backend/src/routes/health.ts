import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "../db";

const router: IRouter = Router();

// Liveness: is the process up? (Used by orchestrators to decide on a restart.)
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Readiness: can we actually serve traffic? Pings the database so load balancers
// stop routing requests here while the DB is unreachable. Never cached.
router.get("/readyz", async (_req, res): Promise<void> => {
  res.set("Cache-Control", "no-store");
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: true });
  } catch {
    res.status(503).json({ status: "degraded", db: false });
  }
});

export default router;
