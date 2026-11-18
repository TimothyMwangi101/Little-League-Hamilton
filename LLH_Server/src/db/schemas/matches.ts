import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, check, index } from "drizzle-orm/sqlite-core";
import { type Sport, type MatchStatus } from "../../../../LLH_Shared/types.ts"
import { TeamsTable } from "./teams.ts";

export const MatchesTable = sqliteTable("matches", {
  id: integer().primaryKey({ autoIncrement: true }),
  challengerId: integer().references(() => TeamsTable.id).notNull(),
  opponentId: integer().references(() => TeamsTable.id).notNull(),
  sport: text().$type<Sport>().notNull(),
  status: text().$type<MatchStatus>().notNull(),
  matchDate: text().notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
  challengerScore: integer(),
  opponentScore: integer(),
}, (m) => [
  check("no dups", sql`${m.challengerId} <> ${m.opponentId}`),
  check("matches_scores_non_negative",
    sql`${m.challengerScore} >= 0 AND ${m.opponentScore} >= 0`),
  check("matches_completed_has_scores",
    sql`${m.status} <> 'Completed' OR (${m.challengerScore} IS NOT NULL AND ${m.opponentScore} IS NOT NULL)`),
  index("matches_challenger_idx").on(m.challengerId),
  index("matches_opponent_idx").on(m.opponentId),
]);
