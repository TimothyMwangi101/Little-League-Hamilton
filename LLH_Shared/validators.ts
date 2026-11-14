import z, { number, string } from "zod";
import { invitePolicies, regions, sports } from './types.ts';
import { createInsertSchema } from 'drizzle-orm/zod';
import { MatchesTable } from '../LLH_Server/src/db/schemas.ts';

export const joinTeamValidator = z.object({
  teamId: number().int().positive(),
});

export const updateAccountValidator = z.object({
  firstName: z.string().trim().max(50).nullable().optional(),
  lastName: z.string().trim().max(50).nullable().optional(),
  region: z.enum(regions).nullable().optional(),
  prefers: z.array(z.enum(sports)).max(sports.length).optional(),
}).strict().refine(
  (account) => Object.values(account).some((value) => value !== undefined),
  { message: "At least one account field must be provided" },
);

export const createTeamValidator = z.object({
  name: string().trim().min(1, "Team name is required").max(50),
  invitePolicy: z.enum(invitePolicies).default("Open"),
  sport: z.enum(sports)
});

export const createMatchValidator = createInsertSchema(MatchesTable).omit({
  id: true,
  createdAt: true,
  status: true,
  challengerId: true,
}).extend({
  sport: z.enum(sports),
  matchDate: z.union([
    z.date(),
    z.iso.datetime().pipe(z.coerce.date()),
  ])
    .refine((date) => date > new Date(), {
      message: "Match date must be in the future",
    })
    .transform((date) => date.toISOString()),
});