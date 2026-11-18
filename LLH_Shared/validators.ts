import z from "zod";
import { invitePolicies, regions, sports, type Sport } from "./types.ts";

export const joinTeamValidator = z.object({
  id: z.coerce.number().int().positive(),
});

export const teamIdValidator = z.object({
  teamId: z.coerce.number().int().positive(),
});

export const updateAccountValidator = z
  .strictObject({
    firstName: z.string().trim().max(50).nullable().optional(),
    lastName: z.string().trim().max(50).nullable().optional(),
    region: z.enum(regions).nullable().optional(),
    prefers: z.array(z.enum(sports)).max(sports.length).optional(),
  })
  .refine(
    (account) => Object.values(account).some((value) => value !== undefined),
    { message: "At least one account field must be provided" },
  );

export const createTeamValidator = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Team name is required with a name of atleast 3 characters long")
    .max(50),
  invitePolicy: z.enum(invitePolicies).default("Open"),
  sport: z
    .enum(sports, { error: "You must select a sport" })
    .check() satisfies z.ZodType<Sport>,
});

export const teamSearchValidator = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().trim().max(50).optional(),
  sports: z.string().optional()
    .transform((value) => value ? value.split(",") : [])
    .pipe(z.array(z.enum(sports))),
  invitePolicies: z.string().optional()
    .transform((value) => value ? value.split(",") : [])
    .pipe(z.array(z.enum(invitePolicies))),
});

export const createMatchValidator = z.object({
  sport: z.enum(sports, {
    error: "You must select a sport",
  }) satisfies z.ZodType<Sport>,
  matchDate: z
    .union([z.date(), z.iso.datetime().pipe(z.coerce.date())])
    .refine((date) => date > new Date(), {
      message: "Match date must be in the future",
    })
    .transform((date) => date.toISOString()),
});

export const userQuery = z.object({
  id: z.coerce.number().optional(),
  email: z.email().optional(),
});

const authCredentialsValidator = z.strictObject({
  email: z.email("Please enter a valid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password cannot exceed 30 characters"),
});

export const createUserValidator = authCredentialsValidator;
export const resetPasswordValidator = authCredentialsValidator;
export const loginValidator = authCredentialsValidator;
