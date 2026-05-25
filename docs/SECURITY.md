# Security Audit & Posture

Plain-language summary of how Baraka protects users, what was hardened during the recent audit, and which risks remain.

## What's already in place

### Authentication
- **Password storage** — `scrypt` (N=2^15, r=8, p=1) with a per-user 16-byte random salt. Verification is constant-time (`timingSafeEqual`). See `backend/src/lib/auth.ts`.
- **Minimum password length** — 10 characters (raised from 6 during the audit). No complexity rules — length beats complexity per OWASP guidance.
- **Sessions** — signed cookies of the form `userId.issuedAt.HMAC`, signed with `SESSION_SECRET` (HMAC-SHA256). Tokens older than 30 days are rejected server-side even if the cookie hasn't expired client-side.
- **Cookie flags** — `httpOnly`, `sameSite=lax`, `secure` in production. The cookie is never readable from JavaScript, so XSS can't steal it directly.
- **`SESSION_SECRET` validation** — the backend refuses to start if the secret is shorter than 32 characters, preventing accidental weak deployments.

### Input validation
- **Every API body is validated** with a Zod schema generated from `api-contract/spec/openapi.yaml`. Reject-by-default — unknown or malformed payloads return 400 before any DB code runs.
- **Length caps** on all user-controlled string fields in the OpenAPI spec (max 200–500 chars depending on context). DoS via huge payloads is not a concern up to the request limit.
- **Request body limit** — 100 kB. Bigger requests get a 413 immediately.

### Database
- **Drizzle ORM with parameterised queries** everywhere. SQL injection is structurally impossible from the application code; we never build SQL by string concat.
- **`multipleStatements: false`** at the connection level — defense in depth so even a hypothetical injection cannot stack queries.
- **Foreign keys with `ON DELETE` policies** — deleting a user cascades their donations and notifications; deleting an org sets references to NULL. No orphan rows.
- **`baraka_app` DB user** — the app connects with a least-privilege account that has access to the `baraka` schema only, not to the whole MySQL server.

### Authorisation
- **`requireAuth` and `requireAdmin` middlewares** on every protected route. There is no "default open" route — adding a new endpoint without auth requires a deliberate decision.
- **IDOR (insecure direct object reference) protection on notifications** — the "mark as read" endpoint matches by both `id AND userId` so a user can never modify another user's row by guessing IDs. Audit your future routes for the same pattern.

### Transport & headers
- **Helmet** sets a strict Content Security Policy, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, etc. CSP currently allows inline styles (Tailwind needs them); inline scripts are blocked.
- **CORS allowlist** — only origins listed in `CORS_ORIGIN` env var can call the API with credentials. Default is `http://localhost:5173`.
- **`trust proxy`** is set to 1 so `req.ip` reflects the real client behind a reverse proxy — important so rate limiting can't be bypassed by spoofing `X-Forwarded-For`.

### Brute-force resistance
- **Rate limit on `/api/auth/*`** — 20 requests per IP per 15 minutes. Login, signup, and logout share this budget. Tunable in `backend/src/app.ts`.

### Logging
- **Structured Pino logs** with secret redaction — `Authorization` headers, cookies, and any path containing `password` are replaced with `[REDACTED]` before they hit log storage.
- **Audit events** for `auth.login.success` and `auth.login.failed` so admins can spot credential-stuffing in the logs.

### Error handling
- **Generic error responses** — the central error handler returns `{ "error": "Internal server error" }` and never leaks stack traces, library versions, or DB error text. Real details go to the logs only.

### Secrets hygiene
- `.env` is gitignored. `.env.example` has only placeholders.
- `SESSION_SECRET` was rotated as part of the audit (the previous value was committed by mistake into `.env.example`). The fresh value lives only in `.env` on your machine.

## Known residual risks

These are explicit decisions, not oversights — listed so the team knows where to harden next.

1. **No CSRF token.** The site relies on `sameSite=lax` cookies, which prevents most CSRF in modern browsers. If you ever loosen `sameSite` for cross-site embedding, add a double-submit CSRF token.
2. **No multi-factor auth.** Admins log in with password only. For a production deployment that holds donor data, add TOTP/email magic links for the admin role.
3. **No password reset flow.** When you add one, use single-use, time-boxed tokens (15 min) signed the same way as sessions, sent via email.
4. **No email verification.** Anyone can sign up with any email. Add `email_verified` + a one-time link if you ever email donors transactional notifications.
5. **In-memory rate limit.** `express-rate-limit` defaults to per-process memory. If you scale to multiple backend instances, switch the store to Redis (`rate-limit-redis`) so attackers can't load-balance their guesses.
6. **Logs may grow unbounded.** Pino writes to stdout — pipe to a log rotator or shipping agent in production (Loki, Datadog, etc.).
7. **No HTTPS in dev.** Cookies are `secure` only in production. Make sure your production reverse proxy actually terminates TLS, or the cookie is never sent.
8. **Donations store fake card data.** `cardLast4` and `cardName` are stored to pretend a real payment happened. When you wire up a real PSP (Stripe, HyperPay, etc.), the PSP handles PCI scope and Baraka should store **only** their reference token, not raw card fields.

## Where to look in the code

| Concern | File |
|---|---|
| Password hashing & sessions | `backend/src/lib/auth.ts` |
| Auth middleware | `backend/src/middlewares/auth.ts` |
| App-wide security headers, CORS, rate limit, error handler | `backend/src/app.ts` |
| Log redaction | `backend/src/lib/logger.ts` |
| API input validation contract | `api-contract/spec/openapi.yaml` |

## Threat-model snapshot

| Threat | Mitigation in place | Residual |
|---|---|---|
| Password reuse / weak passwords | scrypt + 10-char minimum | Length only — no breach-list check |
| Credential stuffing | Rate limit + audit logs | In-memory store, single IP only |
| Session theft | httpOnly + sameSite + signed + max-age | No revocation list |
| SQL injection | Drizzle parameterisation + multiStmts off | None of concern |
| XSS | CSP + httpOnly cookie | Inline styles allowed |
| CSRF | sameSite=lax cookie | No token (acceptable while sameSite is lax) |
| IDOR | Per-route ownership checks | Audit each new route — easy to forget |
| DoS via large body | 100 kB cap + rate limit | No per-IP global limit |
| Secret leakage | gitignore + redaction + length check | Only as good as developer discipline |
