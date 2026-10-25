import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-orm/zod';
import z from "zod";

export const UsersTable = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  salt: text().notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`),
});

export const createUserValidator = z.object({
    email: z.string(),
    password: z.string()
});

export const loginValidator = z.object({
    email: z.string(),
    password: z.string()
});

export const resetPasswordValidator = z.object({
    email: z.string(),
    newPassword: z.string()
});

export type User = Omit<typeof UsersTable.$inferSelect, "salt">;
export type NewUser = Omit<typeof UsersTable.$inferInsert, "id" | "createdAt" | "salt">
