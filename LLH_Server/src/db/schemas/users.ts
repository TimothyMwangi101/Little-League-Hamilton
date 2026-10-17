import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from 'drizzle-orm/zod';

export const users = sqliteTable("users", {
  userId: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text({ length: 70 }).notNull().unique(),
  password: text({ length: 30 }).notNull(),
  createdAt: text().notNull().default(sql`(CURRENT_DATE)`),
});

export const createUserSchema = createInsertSchema(users)
  .pick({ email: true, password: true });

export const loginSchema = createUserSchema.pick({ email: true, password: true });