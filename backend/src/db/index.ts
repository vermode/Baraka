import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  // sensible defaults; tweak if you load-test
  connectionLimit: 10,
  // dates as JS Date objects (not strings)
  dateStrings: false,
  // multi-statement disabled to reduce SQL injection blast radius (defense in depth;
  // Drizzle uses parameterised queries anyway)
  multipleStatements: false,
});

export const db = drizzle(pool, { schema, mode: "default" });

export * from "./schema";
