import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";

export const regions = ["Hamilton Mountain", "Downtown Hamilton"] as const;
export const sports = ["Basketball", "Baseball", "Football", "Soccer", "Bocce", "tennis"] as const;

export const AccountsTable = sqliteTable("accounts", {
  userId: integer({ mode: "number" }).notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
    region: text({ enum: regions }).default("Downtown Hamilton"),
    prefers: text().default(sql`NULL`),
    goals: integer({ mode: "number" }).default(0),
    assists: integer({ mode: "number" }).default(0),
    wins: integer({ mode: "number" }).default(0),
    losses: integer({ mode: "number" }).default(0),
    teams: text().default(sql`NULL`),
});

