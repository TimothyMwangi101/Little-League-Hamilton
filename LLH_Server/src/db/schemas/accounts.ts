import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import { regions, type Sport } from '../../../../LLH_Shared/types.ts';

export const AccountsTable = sqliteTable("accounts", {
  userId: integer().primaryKey()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
  firstName: text().default(sql`NULL`),
  lastName: text().default(sql`NULL`),
  region: text({ enum: regions }).default(sql`NULL`),
  prefers: text({ mode: "json" }).$type<Sport[]>().default([]).notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
});
