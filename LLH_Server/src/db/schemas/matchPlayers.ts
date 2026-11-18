import { sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { MatchesTable } from "./matches.ts";
import { TeamsTable } from "./teams.ts";
import { UsersTable } from "./users.ts";

export const MatchPlayersTable = sqliteTable("match_players", {
  matchId: integer({ mode: "number" }).notNull()
    .references(() => MatchesTable.id, { onDelete: "cascade" }),
  userId: integer({ mode: "number" }).notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
  teamId: integer({ mode: "number" }).notNull()
    .references(() => TeamsTable.id), // which side they played for
  goals: integer({ mode: "number" }).default(0).notNull(),
  assists: integer({ mode: "number" }).default(0).notNull(),
}, (t) => [
  primaryKey({ columns: [t.matchId, t.userId] }), // one side per player per match
  index("match_players_user_idx").on(t.userId),
  check("match_players_non_negative", sql`${t.goals} >= 0 AND ${t.assists} >= 0`),
]);