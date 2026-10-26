import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import z from "zod";

export const UsersTable = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  salt: text().notNull(),
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

export type User = typeof UsersTable.$inferSelect;
export type NewUser = Omit<typeof UsersTable.$inferInsert, "id" | "salt">
export type SafeUser = Omit<typeof UsersTable.$inferSelect, "salt" | "password">;
