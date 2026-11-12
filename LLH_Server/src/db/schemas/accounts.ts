import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import { TeamsTable } from "./teams.ts";
import { regions } from '../../../../shared/types.ts';


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

export type Account = typeof AccountsTable.$inferSelect;
export type SafeAccount = Omit<typeof AccountsTable.$inferSelect, "userId">;
