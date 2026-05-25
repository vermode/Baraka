import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

const SESSION_SECRET = requireEnv("SESSION_SECRET");
// Refuse to start if the secret is obviously weak — prevents the "iamabdallah..."
// class of mistakes from ever shipping to production.
if (SESSION_SECRET.length < 32) {
  throw new Error(
    "SESSION_SECRET must be at least 32 characters. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  );
}

export const SESSION_COOKIE = "baraka_session";

// scrypt cost parameters — N=2^15 is a good 2024+ baseline (~50–80ms on a laptop).
const SCRYPT_N = 1 << 15;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const SCRYPT_KEYLEN = 64;
// Node's default scrypt maxmem is 32 MB, which is exactly the working set for
// our chosen parameters — so the default trips on every call. Bump it to 128 MB
// to give the algorithm room to breathe.
const SCRYPT_MAXMEM = 128 * 1024 * 1024;

// IMPORTANT: existing password hashes were generated with the OLD parameters
// (N=2^14 implicit Node default). The stored hash doesn't record which params
// were used, so we keep N=2^15 going forward and accept that any pre-audit
// account that signed up with weaker params still verifies fine — scrypt's
// output length is what changes per-N, and we always pass keyBuf.length, so
// the comparison works either way as long as the salt+password produce the
// same bytes. (In practice all existing hashes were also N=2^14 because that
// was Node's default, and verification computes with N=2^15 — so old hashes
// WILL fail.) Easiest fix below.

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_r,
    p: SCRYPT_p,
    maxmem: SCRYPT_MAXMEM,
  }).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  let keyBuf: Buffer;
  try {
    keyBuf = Buffer.from(key, "hex");
  } catch {
    return false;
  }
  // Try the current (post-audit) params first.
  if (scryptMatches(password, salt, keyBuf, SCRYPT_N)) return true;
  // Fallback: legacy hashes were created with Node's defaults (N=2^14). Verify
  // against those too so existing users can still log in after the migration.
  if (scryptMatches(password, salt, keyBuf, 1 << 14)) return true;
  return false;
}

function scryptMatches(password: string, salt: string, keyBuf: Buffer, n: number): boolean {
  try {
    const derived = scryptSync(password, salt, keyBuf.length, {
      N: n,
      r: SCRYPT_r,
      p: SCRYPT_p,
      maxmem: SCRYPT_MAXMEM,
    });
    if (derived.length !== keyBuf.length) return false;
    return timingSafeEqual(derived, keyBuf);
  } catch {
    return false;
  }
}

function sign(value: string): string {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function signSession(userId: number): string {
  // Include issued-at (seconds since epoch) so we can later enforce expiry server-side
  // and so re-issued sessions look different from old ones.
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${userId}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

// Max session age (30 days) — must match the cookie maxAge in routes/auth.ts.
const MAX_SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

export function verifySession(token: string | undefined): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userIdStr, issuedAtStr, sig] = parts;
  if (!userIdStr || !issuedAtStr || !sig) return null;

  const expected = sign(`${userIdStr}.${issuedAtStr}`);
  // Constant-time signature comparison to defeat timing oracles.
  const sigBuf = Buffer.from(sig, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  const id = parseInt(userIdStr, 10);
  const issuedAt = parseInt(issuedAtStr, 10);
  if (!Number.isFinite(id) || !Number.isFinite(issuedAt)) return null;

  // Reject expired sessions (defense in depth — the cookie maxAge is the primary
  // enforcement, but an attacker with a stolen token can ignore it).
  const ageSeconds = Math.floor(Date.now() / 1000) - issuedAt;
  if (ageSeconds < 0 || ageSeconds > MAX_SESSION_AGE_SECONDS) return null;

  return id;
}
