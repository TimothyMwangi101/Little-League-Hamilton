import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import z, { number } from "zod";

export const regions = ["Hamilton Mountain", "Downtown Hamilton"] as const;
export const sports = ["Basketball", "Baseball", "Football", "Soccer", "Bocce", "tennis"] as const;

export const AccountsTable = sqliteTable("accounts", {
  userId: integer({ mode: "number" }).notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
  region: text({ enum: regions }).default(sql`NULL`),
  prefers: text().default(sql`NULL`),
  goals: integer({ mode: "number" }).default(0),
  assists: integer({ mode: "number" }).default(0),
  wins: integer({ mode: "number" }).default(0),
  losses: integer({ mode: "number" }).default(0),
  teams: text().default(sql`NULL`),
  createdAt: text().default(sql`(CURRENT_DATE)`),
});


export const createAccountValidator = z.object({
  id: number()
});

export type Account = typeof AccountsTable.$inferSelect;
export type SafeAccount = Omit<typeof AccountsTable.$inferSelect, "userId">;
