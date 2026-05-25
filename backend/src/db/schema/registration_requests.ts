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

export const registrationRequestsTable = mysqlTable("registration_requests", {
  id: int("id").autoincrement().primaryKey(),
  orgName: varchar("org_name", { length: 200 }).notNull(),
  governorate: varchar("governorate", { length: 32 }).notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  regNumber: varchar("reg_number", { length: 64 }),
  about: text("about").notNull(),
  contactName: varchar("contact_name", { length: 120 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 255 }),
  status: varchar("status", { length: 16 }).notNull().default("pending"),
  adminNote: text("admin_note"),
  reviewedBy: int("reviewed_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRegistrationRequestSchema = createInsertSchema(
  registrationRequestsTable,
).omit({
  id: true,
  createdAt: true,
  status: true,
  adminNote: true,
  reviewedBy: true,
  reviewedAt: true,
});
export type InsertRegistrationRequest = z.infer<typeof insertRegistrationRequestSchema>;
export type RegistrationRequest = typeof registrationRequestsTable.$inferSelect;
