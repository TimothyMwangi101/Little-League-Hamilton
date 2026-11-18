import type z from "zod"
import type { AccountsTable, MatchesTable, TeamsTable } from "../LLH_Server/src/db/schemas.ts"
import type { createTeamValidator, createUserValidator, loginValidator, resetPasswordValidator } from "./validators.ts"

export const regions = ["Hamilton Mountain", "Lower Hamilton"] as const
export const sports = ["Basketball", "Baseball", "Football", "Soccer", "Bocce", "Tennis"] as const
export const matchStatus = ["Accepted", "Rejected", "Pending", "Completed", "Cancelled"] as const
export const invitePolicies = ["Open", "InviteOnly"] as const
export const roles = ["Member", "CoCaptain", "Captain"] as const;

export type Roles = (typeof roles)[number];


export const roleRank = { Member: 0, CoCaptain: 1, Captain: 2 } as const satisfies Record<Roles, number>;
export const hasRole = (role: Roles, atLeast: Roles) => roleRank[role] >= roleRank[atLeast];

export type Region = (typeof regions)[number]
export type Sport = (typeof sports)[number]
export type InvitePolicy = (typeof invitePolicies)[number]
export type MatchStatus = (typeof matchStatus)[number]
export type Team = typeof TeamsTable.$inferSelect;
export type Match = typeof MatchesTable.$inferSelect;
export type Account = typeof AccountsTable.$inferSelect;
export type CreateTeam = z.infer<typeof createTeamValidator>;

export type CreateUser = z.infer<typeof createUserValidator>;
export type LoginCredentials = z.infer<typeof loginValidator>;
export type ResetPassword = z.infer<typeof resetPasswordValidator>;
export type User = LoginCredentials;