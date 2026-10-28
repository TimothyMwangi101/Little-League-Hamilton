import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import z, { number } from "zod";
import { TeamsTable } from "./teams.ts";

export const regions = ["Hamilton Mountain", "Lower Hamilton"] as const;
export const sports = ["Basketball", "Baseball", "Football", "Soccer", "Bocce", "Tennis"] as const;

export type Sport = (typeof sports)[number]
export type Region = (typeof regions)[number]

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
  team: integer({ mode: "number" }).references(() => TeamsTable.id).default(sql`NULL`),
  createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
});


export const createAccountValidator = z.object({
  id: number()
});

export const joinTeamValidator = z.object({
  teamId: number().int().positive(),
});

export type Account = typeof AccountsTable.$inferSelect;
export type SafeAccount = Omit<typeof AccountsTable.$inferSelect, "userId">;
