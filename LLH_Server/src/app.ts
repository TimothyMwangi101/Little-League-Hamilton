import userRoutes from './routes/users.ts'
import authRoutes from './routes/auth.ts'
import accountRoutes from './routes/accounts.ts'
import teamRoutes from './routes/teams.ts'
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { ApplyGlobalResponse } from 'hono/client'
import { HTTPException } from 'hono/http-exception';
import db from './db/db.ts';
import { MatchesTable, TeamRecordsView, TeamsTable } from './db/schemas.ts';

const app = new Hono()
  .route('/user', userRoutes)
  .route('/auth', authRoutes)
  .route('/account', accountRoutes)
  .route('/team', teamRoutes)
  .onError((error, ctx) => {
    if (error instanceof HTTPException)
      {if (error.status == 401)
        return ctx.json({ error: error.message }, error.status);}

    console.error(error);
    throw error;
  }).notFound((ctx) => {
    return ctx.json({ error: "Not found" }, StatusCodes.NOT_FOUND);
  }).get('/', (ctx) => {
    return ctx.json({ data: "Hello Hono!" }, StatusCodes.OK);
  }).get("/teams", async (ctx) => {
    const teams = await db
      .select({
        team: TeamsTable,
        wins: TeamRecordsView.wins,
        losses: TeamRecordsView.losses,
        draws: TeamRecordsView.draws,
      })
      .from(TeamsTable)
      .innerJoin(TeamRecordsView, eq(TeamRecordsView.teamId, TeamsTable.id));
    return ctx.json({ data: teams }, StatusCodes.OK);
  }).get("/matches", async (ctx) => {
    const matches = await db.select().from(MatchesTable);
    return ctx.json({ data: matches }, StatusCodes.OK);
  });


export type AppType = ApplyGlobalResponse<typeof app, {
  500: { json: { error: string } }
}>;
export default app;