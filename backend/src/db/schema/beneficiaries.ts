import {
  mysqlTable,
  int,
  text,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizationsTable } from "./organizations";

export const beneficiariesTable = mysqlTable("beneficiaries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  story: text("story").notNull(),
  organizationId: int("organization_id").references(() => organizationsTable.id, {
    onDelete: "set null",
  }),
  needAmount: int("need_amount").notNull().default(0),
  raisedAmount: int("raised_amount").notNull().default(0),
  urgent: boolean("urgent").notNull().default(false),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBeneficiarySchema = createInsertSchema(beneficiariesTable).omit({
  id: true,
  createdAt: true,
  raisedAmount: true,
});
export type InsertBeneficiary = z.infer<typeof insertBeneficiarySchema>;
export type Beneficiary = typeof beneficiariesTable.$inferSelect;
