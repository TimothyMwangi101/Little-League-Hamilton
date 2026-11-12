import z, { number, string } from "zod";
import { invitePolicies, regions, sports } from './types.ts';

// export const createAccountValidator = z.object({
//   id: number()
// });

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
