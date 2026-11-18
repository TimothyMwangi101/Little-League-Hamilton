import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import { TeamsTable } from "./teams.ts";

export const TeamMembersTable = sqliteTable("team_members", {
  teamId: integer({ mode: "number" }).notNull()
    .references(() => TeamsTable.id, { onDelete: "cascade" }),
  userId: integer({ mode: "number" }).notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
  joinedAt: integer({ mode: "timestamp" }).notNull(),
}, (t) => [
  primaryKey({ columns: [t.teamId, t.userId] }),
]);