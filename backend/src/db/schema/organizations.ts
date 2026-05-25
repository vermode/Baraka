import {
  mysqlTable,
  int,
  text,
  timestamp,
  boolean,
  double,
  varchar,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const organizationsTable = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  nameEn: varchar("name_en", { length: 200 }),
  category: varchar("category", { length: 32 }).notNull(),
  governorate: varchar("governorate", { length: 32 }).notNull(),
  description: text("description").notNull(),
  descriptionEn: text("description_en"),
  imageUrl: varchar("image_url", { length: 500 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 255 }),
  address: varchar("address", { length: 500 }),
  lat: double("lat"),
  lng: double("lng"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizationsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizationsTable.$inferSelect;
