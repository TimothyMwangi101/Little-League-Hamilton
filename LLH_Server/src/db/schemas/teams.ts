import { sql } from "drizzle-orm";
import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";
import { UsersTable } from "./users.ts";
import z, { number, string } from "zod";

export const invitePolicies = ["Open", "InviteOnly"] as const
export type InvitePolicy = (typeof invitePolicies)[number]

export const TeamsTable = sqliteTable("teams", {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    coCaptainId: integer({ mode: "number" }).references(() => UsersTable.id),
    captainId: integer({ mode: "number" }).references(() => UsersTable.id).notNull(),
    name: text().notNull().unique(),
    invitePolicy: text().$type<InvitePolicy>().default("Open").notNull(),
    createdAt: text().default(sql`(CURRENT_DATE)`).notNull(),
});


export const createTeamValidator = z.object({
  captainId: number(),
  name: string(),
  invitePolicy: z.enum(invitePolicies).default("Open"),
});


export type Team = typeof TeamsTable.$inferSelect;
export type SafeTeam = Omit<typeof TeamsTable.$inferSelect, "id" | "createdAt">;
