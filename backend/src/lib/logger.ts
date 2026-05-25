import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  // Never let secrets land in log storage. If you add more fields with sensitive
  // data (tokens, API keys, etc.), list them here.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      // Common locations where passwords show up if a route logs req.body.
      "*.password",
      "*.passwordHash",
      "*.password_hash",
      "*.body.password",
      "*.body.currentPassword",
      "*.body.newPassword",
    ],
    censor: "[REDACTED]",
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
