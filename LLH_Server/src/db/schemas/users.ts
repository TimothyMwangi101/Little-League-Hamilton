import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from 'drizzle-orm/zod';

export const UsersTable = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`),
});

export const createUserSchema = createInsertSchema(UsersTable)
  .pick({ email: true, password: true });

export const loginSchema = createInsertSchema(UsersTable)
  .pick({ email: true, password: true });
