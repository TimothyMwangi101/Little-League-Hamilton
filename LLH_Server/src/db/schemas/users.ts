import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createUpdateSchema } from 'drizzle-orm/zod';
import z from "zod";

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

export const resetPasswordSchema = createUpdateSchema(UsersTable)
    .pick({ email: true })
    .extend({ newPassword: z.string().nonempty() })
