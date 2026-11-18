import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, sqliteView, } from "drizzle-orm/sqlite-core";
import { type Sport, type InvitePolicy } from "../../../../LLH_Shared/types.ts"

export const TeamsTable = sqliteTable("teams", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull().unique(),
  invitePolicy: text().$type<InvitePolicy>().notNull(),
  sport: text().$type<Sport>().notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
});

export const TeamRecordsView = sqliteView('team_records', {
  teamId: integer().notNull(),
  wins: integer().notNull(),
  losses: integer().notNull(),
  draws: integer().notNull(),
}).as(sql`
  SELECT
    t.id AS teamId,
    COALESCE(SUM(r.win), 0)  AS wins,
    COALESCE(SUM(r.loss), 0) AS losses,
    COALESCE(SUM(r.draw), 0) AS draws
  FROM teams t
  LEFT JOIN (
    SELECT 
      challengerId AS teamId,
      challengerScore > opponentScore AS win,
      challengerScore < opponentScore AS loss,
      challengerScore = opponentScore AS draw
    FROM matches WHERE status = 'Completed'
    UNION ALL
    SELECT 
      opponentId,
      opponentScore > challengerScore,
      opponentScore < challengerScore,
      opponentScore = challengerScore
    FROM matches WHERE status = 'Completed'
  ) r ON r.teamId = t.id
  GROUP BY t.id;`
);