import userRoutes from "./routes/users.ts";
import authRoutes from "./routes/auth.ts";
import accountRoutes from "./routes/accounts.ts";
import teamRoutes from "./routes/teams.ts";
import { StatusCodes } from "http-status-codes";
import { Hono } from "hono";
import { and, count, eq, inArray, like, or, sql } from "drizzle-orm";
import { sValidator } from "@hono/standard-validator";
import type { ApplyGlobalResponse } from "hono/client";
import { HTTPException } from "hono/http-exception";
import db from "./db/db.ts";
import {
  AccountsTable,
  MatchesTable,
  TeamMembersTable,
  TeamRecordsView,
  TeamsTable,
} from "./db/schemas.ts";
import { teamSearchValidator } from "../../LLH_Shared/validators.ts";
import type { z } from "zod";

const teamsPageSize = 6;
type TeamSearchParams = z.infer<typeof teamSearchValidator>;

async function searchTeams({
  page,
  search,
  sports,
  invitePolicies,
}: TeamSearchParams) {
  const conditions = [];
  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        like(TeamsTable.name, searchPattern),
        like(TeamsTable.sport, searchPattern),
        sql`${TeamsTable.id} LIKE ${searchPattern}`,
      ),
    );
  }
  if (invitePolicies.length > 0)
    conditions.push(inArray(TeamsTable.invitePolicy, invitePolicies));
  if (sports.length > 0) conditions.push(inArray(TeamsTable.sport, sports));
  const where = and(...conditions);
  const offset = (page - 1) * teamsPageSize;
  const pageOfTeamIds = db
    .select({ id: TeamsTable.id })
    .from(TeamsTable)
    .where(where)
    .orderBy(TeamsTable.id)
    .limit(teamsPageSize)
    .offset(offset)
    .as("team_page");

  const data = await db
    .select({
      team: {
        id: TeamsTable.id,
        name: TeamsTable.name,
        sport: TeamsTable.sport,
        invitePolicy: TeamsTable.invitePolicy,
      },
      wins: TeamRecordsView.wins,
      losses: TeamRecordsView.losses,
      draws: TeamRecordsView.draws,
      captain: {
        firstName: AccountsTable.firstName,
        lastName: AccountsTable.lastName,
      },
    })
    .from(TeamsTable)
    .innerJoin(pageOfTeamIds, eq(TeamsTable.id, pageOfTeamIds.id))
    .innerJoin(TeamRecordsView, eq(TeamRecordsView.teamId, TeamsTable.id))
    .leftJoin(
      TeamMembersTable,
      and(
        eq(TeamMembersTable.teamId, TeamsTable.id),
        eq(TeamMembersTable.role, "Captain"),
      ),
    )
    .leftJoin(AccountsTable, eq(AccountsTable.userId, TeamMembersTable.userId))
    .orderBy(TeamsTable.id);
  const [result] = await db
    .select({ total: count() })
    .from(TeamsTable)
    .where(where);

  return {
    data,
    pagination: {
      page,
      pageSize: teamsPageSize,
      total: result?.total ?? 0,
    },
  };
}

const app = new Hono()
  .route("/user", userRoutes)
  .route("/auth", authRoutes)
  .route("/account", accountRoutes)
  .route("/team", teamRoutes)
  .onError((error, ctx) => {
    if (error instanceof HTTPException) {
      if (error.status == 401)
        return ctx.json({ error: error.message }, error.status);
    }

    console.error(error);
    throw error;
  })
  .notFound((ctx) => {
    return ctx.json({ error: "Not found" }, StatusCodes.NOT_FOUND);
  })
  .get("/", (ctx) => {
    return ctx.json({ data: "Hello Hono!" }, StatusCodes.OK);
  })
  .get(
    "/teams",
    sValidator("query", teamSearchValidator, (result, ctx) => {
      if (!result.success) {
        console.error(result.error);
        return ctx.json(
          { error: "Invalid search parameters" },
          StatusCodes.BAD_REQUEST,
        );
      }
    }),
    async (ctx) => {
      const params = ctx.req.valid("query");
      const result = await searchTeams(params);
      return ctx.json(result, StatusCodes.OK);
    },
  )
  .get("/matches", async (ctx) => {
    const matches = await db.select().from(MatchesTable);
    return ctx.json({ data: matches }, StatusCodes.OK);
  });

export type AppType = ApplyGlobalResponse<
  typeof app,
  {
    500: { json: { error: string } };
  }
>;
export default app;
