import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { type Sport, type MatchStatus } from "../../../../LLH_Shared/types.ts"
import { TeamsTable } from "./teams.ts";

export const MatchesTable = sqliteTable("matches", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  challengerId: integer({ mode: "number" }).references(() => TeamsTable.id).notNull(),
  opponentId: integer({ mode: "number" }).references(() => TeamsTable.id).notNull(),
  sport: text({ mode: "json" }).$type<Sport>().notNull(),
  status: text().$type<MatchStatus>().default("Pending").notNull(),
  matchDate: text().notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
});

export type Match = typeof MatchesTable.$inferSelect;
export type SafeMatch = Omit<typeof MatchesTable.$inferSelect, "id" | "createdAt">;

