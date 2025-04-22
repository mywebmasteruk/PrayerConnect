import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const prayers = pgTable("prayers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  author: text("author").default("Anonymous"),
  category: text("category"),
  created_at: timestamp("created_at").defaultNow(),
  is_published: boolean("is_published").default(true),
  view_count: integer("view_count").default(0),
  ameen_count: integer("ameen_count").default(0)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPrayerSchema = createInsertSchema(prayers).pick({
  content: true,
  author: true,
  category: true,
});

export const prayerCategories = [
  { label: "Health & Healing", value: "health" },
  { label: "Family", value: "family" },
  { label: "Guidance", value: "guidance" },
  { label: "Success", value: "success" },
  { label: "Relief from Hardship", value: "relief" },
  { label: "Forgiveness", value: "forgiveness" },
  { label: "Other", value: "other" }
];

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;
export type Prayer = typeof prayers.$inferSelect;
