import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from 'drizzle-orm/zod';

export const users = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  createdAt: text().notNull().default(sql`(CURRENT_DATE)`),
});

export const createUserSchema = createInsertSchema(users)
  .pick({ email: true, password: true });

export const loginSchema = createInsertSchema(users)
  .pick({ email: true, password: true });
