import {
  mysqlTable,
  int,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const helpRequestsTable = mysqlTable("help_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  governorate: varchar("governorate", { length: 32 }).notNull(),
  aidType: varchar("aid_type", { length: 32 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("pending"),
  // Tracking OTP, issued when the request is submitted.
  otp: varchar("otp", { length: 8 }),
  adminNote: text("admin_note"),
  reviewedBy: int("reviewed_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHelpRequestSchema = createInsertSchema(helpRequestsTable).omit({
  id: true,
  createdAt: true,
  status: true,
  adminNote: true,
  reviewedBy: true,
  reviewedAt: true,
});
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type HelpRequest = typeof helpRequestsTable.$inferSelect;
