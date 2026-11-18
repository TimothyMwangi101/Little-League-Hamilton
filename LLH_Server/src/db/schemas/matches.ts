import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, check, } from "drizzle-orm/sqlite-core";
import { type Sport, type MatchStatus } from "../../../../LLH_Shared/types.ts"
import { TeamsTable } from "./teams.ts";

export const MatchesTable = sqliteTable("matches", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  challengerId: integer({ mode: "number" }).references(() => TeamsTable.id).notNull(),
  opponentId: integer({ mode: "number" }).references(() => TeamsTable.id).notNull(),
  sport: text().$type<Sport>().notNull(),
  status: text().$type<MatchStatus>().default("Pending").notNull(),
  matchDate: text().notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
  challengerScore: integer({ mode: "number" }),
opponentScore: integer({ mode: "number" }),
}, (m) => [
  check("no dups", sql`check(${m.challengerId} <> ${m.opponentId})`)
]);


