import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "../db";
import { SignupBody, LoginBody, GetMeResponse } from "@workspace/api-zod";
import { hashPassword, verifyPassword, signSession, SESSION_COOKIE } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function setSessionCookie(res: import("express").Response, userId: number): void {
  // No maxAge/expires => a session cookie that the browser clears when it closes.
  res.cookie(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

// Email providers allowed for regular (donor) accounts. Charities may use any
// valid domain (e.g. their own organisation domain).
const KNOWN_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
]);

function authUserPayload(user: typeof usersTable.$inferSelect) {
  return GetMeResponse.parse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountType: user.accountType,
    phone: user.phone,
    createdAt: user.createdAt,
  });
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  const parsed = SignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, phone, accountType } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  // Donors must use a known email provider; charities may use custom domains.
  if (accountType !== "charity") {
    const domain = normalizedEmail.split("@")[1] ?? "";
    if (!KNOWN_EMAIL_DOMAINS.has(domain)) {
      res.status(400).json({ error: "Please use a known email provider" });
      return;
    }
  }
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const [{ id: newId }] = await db
    .insert(usersTable)
    .values({
      name,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: "donor",
      accountType: accountType ?? "donor",
      phone: phone ?? null,
    })
    .$returningId();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, newId));
  setSessionCookie(res, user.id);
  res.status(201).json(authUserPayload(user));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.toLowerCase();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    // Audit log — useful for spotting credential-stuffing patterns later. We log
    // the attempted email (not the password) so admins can correlate failed attempts.
    logger.warn({ event: "auth.login.failed", email, ip: req.ip }, "login failed");
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  logger.info({ event: "auth.login.success", userId: user.id, ip: req.ip }, "login ok");
  setSessionCookie(res, user.id);
  res.json(authUserPayload(user));
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.sendStatus(204);
});

router.get("/auth/me", (req, res): void => {
  // Never let the browser (or an intermediary) cache the authenticated user —
  // it must always reflect the live session state.
  res.setHeader("Cache-Control", "no-store");
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(authUserPayload(req.user));
});

export default router;
