import z, { number } from "zod";
import { regions, sports } from './types.ts';

export const createAccountValidator = z.object({
  id: number()
});

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
