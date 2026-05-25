/**
 * One-time data migration: PostgreSQL pg_dump file -> MySQL.
 *
 * USAGE
 *   1. On the old Postgres server, produce a dump:
 *        pg_dump --no-owner --no-privileges "$DATABASE_URL" > baraka-data.sql
 *   2. Drop the file at the repo root: D:\University\baraka\baraka-data.sql
 *   3. Make sure MySQL is up and `pnpm db:push` has created the (empty) tables.
 *   4. From the repo root: `pnpm --filter @workspace/backend run db:migrate-from-postgres`
 *
 * WHAT IT DOES
 *   Parses every `COPY public.<table> (cols) FROM stdin;` block in the dump and
 *   inserts each row into the matching MySQL table. Handles Postgres TSV escapes
 *   (\N, \t, \n, \r, \\) and converts boolean t/f to 1/0.
 *
 *   Refuses to run if the destination MySQL table is non-empty (so you can't
 *   accidentally double-import).
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { logger } from "../lib/logger";

const NEW_URL = process.env.DATABASE_URL;
if (!NEW_URL) {
  console.error("DATABASE_URL (the MySQL target) is not set in .env.");
  process.exit(1);
}

// Path to the pg_dump file (from the repo root).
const DUMP_FILE = path.resolve(process.cwd(), "..", "baraka-data.sql");
if (!existsSync(DUMP_FILE)) {
  console.error(`Dump file not found at ${DUMP_FILE}`);
  console.error(
    "Place your pg_dump output at <repo>/baraka-data.sql, then re-run this script.",
  );
  process.exit(1);
}

// Order matters: parents before children (FK constraints).
const TABLES = [
  "users",
  "organizations",
  "beneficiaries",
  "donations",
  "announcements",
  "notifications",
  "help_requests",
  "registration_requests",
] as const;

// Columns where Postgres stores `t`/`f` and MySQL expects 1/0.
const BOOLEAN_COLUMNS = new Set([
  "verified", // organizations
  "urgent", // beneficiaries
  "read", // notifications
]);

/** Decode a single TSV field per Postgres COPY rules. */
function decodeField(raw: string): string | null {
  if (raw === "\\N") return null;
  // Replace the documented backslash escapes. Order matters: handle \\ last so
  // an earlier-decoded literal backslash isn't re-interpreted.
  return raw
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\\\/g, "\\");
}

interface CopyBlock {
  table: string;
  columns: string[];
  rows: (string | null)[][];
}

/** Walk the dump file and pull out every COPY block + its TSV rows. */
function parseDump(sql: string): CopyBlock[] {
  const blocks: CopyBlock[] = [];
  const lines = sql.split(/\r?\n/);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = /^COPY\s+(?:public\.)?(\w+)\s*\(([^)]+)\)\s+FROM\s+stdin;\s*$/.exec(line);
    if (!m) {
      i++;
      continue;
    }
    const table = m[1];
    const columns = m[2].split(",").map((c) => c.trim());
    const rows: (string | null)[][] = [];
    i++;
    // Each row is one tab-separated line. The block terminates with `\.` on its own line.
    while (i < lines.length && lines[i] !== "\\.") {
      // Skip empty separator lines that pg_dump never produces, but be defensive.
      if (lines[i].length === 0) {
        i++;
        continue;
      }
      const fields = lines[i].split("\t").map(decodeField);
      rows.push(fields);
      i++;
    }
    // Skip past the `\.` terminator.
    i++;
    blocks.push({ table, columns, rows });
  }

  return blocks;
}

/** Convert a decoded field to whatever mysql2 wants for the typed column. */
function coerceValue(column: string, value: string | null): unknown {
  if (value === null) return null;
  if (BOOLEAN_COLUMNS.has(column)) return value === "t" ? 1 : 0;
  // Timestamps come as `2026-05-22 12:55:42.392966+00`. JS Date handles that.
  // We pass them as strings — MySQL TIMESTAMP/DATETIME parses ISO-ish input fine,
  // but the safest bet is to normalise to a JS Date so mysql2 quotes correctly.
  if (column === "created_at" || column === "reviewed_at") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return value;
}

async function main(): Promise<void> {
  logger.info({ file: DUMP_FILE }, "reading dump");
  const sql = readFileSync(DUMP_FILE, "utf8");
  const blocks = parseDump(sql);

  if (blocks.length === 0) {
    throw new Error(
      "No COPY blocks found in the dump file. Did pg_dump produce data? " +
        "Try: pg_dump --no-owner --no-privileges <url> > baraka-data.sql",
    );
  }

  // Index blocks by table for ordered processing.
  const byTable = new Map<string, CopyBlock>();
  for (const b of blocks) byTable.set(b.table, b);

  const conn = await mysql.createConnection(NEW_URL!);
  try {
    // Sanity check: refuse if any destination table already has data.
    for (const t of TABLES) {
      const [rows] = await conn.query<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) AS c FROM \`${t}\``,
      );
      if (rows[0].c > 0) {
        throw new Error(
          `MySQL table \`${t}\` already has ${rows[0].c} rows. ` +
            "Refusing to import to avoid duplicates. Truncate it first if you really want to re-run.",
        );
      }
    }

    // FK checks off so we don't have to worry about edge ordering inside any one table.
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");

    for (const table of TABLES) {
      const block = byTable.get(table);
      if (!block || block.rows.length === 0) {
        logger.info({ table, count: 0 }, "skip empty");
        continue;
      }

      const colList = block.columns.map((c) => `\`${c}\``).join(", ");
      const placeholders = `(${block.columns.map(() => "?").join(", ")})`;

      const BATCH = 500;
      for (let i = 0; i < block.rows.length; i += BATCH) {
        const slice = block.rows.slice(i, i + BATCH);
        const values: unknown[] = [];
        for (const row of slice) {
          row.forEach((field, idx) => {
            values.push(coerceValue(block.columns[idx], field));
          });
        }
        const insertSql =
          `INSERT INTO \`${table}\` (${colList}) VALUES ` +
          slice.map(() => placeholders).join(", ");
        await conn.query(insertSql, values);
      }
      logger.info({ table, count: block.rows.length }, "migrated");
    }

    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    logger.info("migration complete");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  logger.error({ err }, "migration failed");
  process.exit(1);
});
