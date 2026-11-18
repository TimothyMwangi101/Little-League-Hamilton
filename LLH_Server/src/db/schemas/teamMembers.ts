import { integer, primaryKey, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import { TeamsTable } from "./teams.ts";
import { type Roles, roles } from "../../../../LLH_Shared/types.ts";
import { sql } from "drizzle-orm";

export const TeamMembersTable = sqliteTable("team_members", {
  teamId: integer().notNull()
    .references(() => TeamsTable.id, { onDelete: "cascade" }),
  userId: integer().notNull()
    .references(() => UsersTable.id, { onDelete: "cascade" }),
  joinedAt: text().default(sql`(CURRENT_DATE)`).notNull(),
  role: text({ enum : roles }).$type<Roles>().notNull()
}, (t) => [
  primaryKey({ columns: [t.teamId, t.userId] }),
  index("team_members_user_idx").on(t.userId),
  index("team_members_team_idx").on(t.teamId),
]);