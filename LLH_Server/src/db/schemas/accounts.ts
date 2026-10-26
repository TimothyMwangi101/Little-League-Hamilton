import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import z, { number } from "zod";

export const regions = ["Hamilton Mountain", "Downtown Hamilton"] as const;
export const sports = ["Basketball", "Baseball", "Football", "Soccer", "Bocce", "tennis"] as const;

export const AccountsTable = sqliteTable("accounts", {
  userId: integer({ mode: "number" }).notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
  firstName: text().default(sql`NULL`),
  lastName: text().default(sql`NULL`),
  region: text({ enum: regions }).default(sql`NULL`),
  prefers: text("prefers", { mode: "json" }).$type<string[]>().default(sql`(json_array())`).notNull(),
  goals: integer({ mode: "number" }).default(0).notNull(),
  assists: integer({ mode: "number" }).default(0).notNull(),
  wins: integer({ mode: "number" }).default(0).notNull(),
  losses: integer({ mode: "number" }).default(0).notNull(),
  teams: text("teams", { mode: "json" }).$type<string[]>().default(sql`(json_array())`).notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
});


export const createAccountValidator = z.object({
  id: number()
});

export type Account = typeof AccountsTable.$inferSelect;
export type SafeAccount = Omit<typeof AccountsTable.$inferSelect, "userId">;
