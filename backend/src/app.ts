import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { captureException } from "./lib/observability";
import { loadUser } from "./middlewares/auth";

const app: Express = express();

// Behind a reverse proxy (nginx/Caddy/etc.) in production, trust the first hop
// so req.ip reflects the real client IP for rate limiting and logging.
app.set("trust proxy", 1);

// Strict security headers. CSP is permissive enough for the current SPA but tight
// enough to block most XSS payloads. Tighten further when you remove inline styles.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // Tailwind injects style tags at runtime — allow inline styles only.
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Allowlist CORS — never use `cors()` with no args in production (that allows ANY origin).
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (curl, same-origin, server-to-server).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cookieParser());

// Cap request bodies to defeat memory-exhaustion DoS. 100 kB is plenty for JSON forms;
// raise it (or split into a separate route) if you add file uploads later.
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(loadUser);

// Baseline rate limit for the whole API — a backstop against scraping and
// blunt-force abuse on every endpoint, not just auth.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

// Rate-limit auth endpoints much harder — they're the high-value brute-force
// targets. This stacks on top of the baseline limiter above.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // 20 attempts per IP per 15 minutes — generous enough for typos, tight enough
  // to make credential-stuffing impractical.
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/auth", authLimiter);

// Public OTP-gated tracking routes carry a guessable-ish token in the URL, so
// throttle them hard to make brute-forcing tracking codes impractical.
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/track", trackLimiter);

// Short-lived caching for public, non-personalized read endpoints. Express
// already emits a (weak) ETag per response, so conditional GETs get a cheap 304;
// this just lets browsers reuse a fresh copy for a few seconds. Never applied to
// per-user data (notifications, /auth/me, etc.).
const PUBLIC_CACHEABLE = [
  "/api/stats",
  "/api/organizations",
  "/api/beneficiaries",
  "/api/announcements",
];
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (
    req.method === "GET" &&
    PUBLIC_CACHEABLE.some((p) => req.path === p || req.path.startsWith(`${p}/`))
  ) {
    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
  }
  next();
});

app.use("/api", router);

// Centralised error handler. NEVER leak stack traces or error messages to clients —
// they're a great source of intel for attackers (DB type, file paths, library versions).
// Real details go to the log, the client gets a generic message.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  // CORS rejection from the origin function above.
  if (err instanceof Error && err.message.includes("not allowed by CORS")) {
    res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  // Body too large.
  if (
    err &&
    typeof err === "object" &&
    "type" in err &&
    (err as { type?: string }).type === "entity.too.large"
  ) {
    res.status(413).json({ error: "Request body too large" });
    return;
  }
  // Anything else is unexpected — report it (full detail to the log / error
  // tracker) and return a generic message to the client.
  captureException(err, { reqId: (req as { id?: string }).id });
  res.status(500).json({ error: "Internal server error" });
});

export default app;
