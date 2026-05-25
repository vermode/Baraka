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
import { organizationsTable } from "./organizations";
import { beneficiariesTable } from "./beneficiaries";

export const donationsTable = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  donorId: int("donor_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  organizationId: int("organization_id").references(() => organizationsTable.id, {
    onDelete: "set null",
  }),
  beneficiaryId: int("beneficiary_id").references(() => beneficiariesTable.id, {
    onDelete: "set null",
  }),
  amount: int("amount").notNull(),
  message: text("message"),
  // donation kind: money | food | clothes | other
  donationType: varchar("donation_type", { length: 16 }).notNull().default("money"),
  // payment method (money only): card | wallet | cash
  paymentMethod: varchar("payment_method", { length: 16 }),
  // wallet provider: zain | orange | umniah
  walletProvider: varchar("wallet_provider", { length: 16 }),
  walletPhone: varchar("wallet_phone", { length: 32 }),
  // last 4 digits of card (we never store full PAN)
  cardLast4: varchar("card_last4", { length: 4 }),
  cardName: varchar("card_name", { length: 120 }),
  // free-text description for non-monetary donations (items, qty, pickup address...)
  itemDetails: text("item_details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({
  id: true,
  createdAt: true,
  donorId: true,
});
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
