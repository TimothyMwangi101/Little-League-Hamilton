import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { TeamMembersTable, TeamRecordsView, TeamsTable } from "../db/schemas.ts";
import db from "../db/db.ts";
import { authenticate, refreshJWT, type UserPayloadEnv } from "../middleware/auth.ts";
import { createTeamValidator, teamIdValidator } from "../../../LLH_Shared/validators.ts";

const app = new Hono<UserPayloadEnv>()
    .use(authenticate, refreshJWT)
    .get("/", async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const teams = await db
            .select({
                team: TeamsTable,
                role: TeamMembersTable.role,
                wins: TeamRecordsView.wins,
                losses: TeamRecordsView.losses,
                draws: TeamRecordsView.draws,
            })
            .from(TeamMembersTable)
            .innerJoin(TeamsTable, eq(TeamsTable.id, TeamMembersTable.teamId))
            .innerJoin(TeamRecordsView, eq(TeamRecordsView.teamId, TeamsTable.id))
            .where(eq(TeamMembersTable.userId, userId));

        return ctx.json({ data: teams }, StatusCodes.OK);
    })
    .post("/create", sValidator("json", createTeamValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const { name, invitePolicy, sport } = ctx.req.valid("json");

        const [existingTeam] = await db
            .select({ id: TeamsTable.id })
            .from(TeamsTable)
            .where(eq(TeamsTable.name, name));

        if (existingTeam)
            return ctx.json({ error: "Team already exists, please use another name" }, StatusCodes.CONFLICT);

        const [team] = await db
            .insert(TeamsTable)
            .values({ name, invitePolicy, sport })
            .returning();

        if (!team)
            return ctx.json({ error: "Could not create team" }, StatusCodes.INTERNAL_SERVER_ERROR);

        await db
            .insert(TeamMembersTable)
            .values({ teamId: team.id, userId, role: "Captain" });

        return ctx.json({
            data: {
                team,
                role: "Captain",
                wins: 0,
                losses: 0,
                draws: 0,
            },
        }, StatusCodes.CREATED);
    })
    .delete("/:teamId", sValidator("param", teamIdValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid team id" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const { teamId } = ctx.req.valid("param");

        const [team] = await db
            .select({ id: TeamsTable.id })
            .from(TeamsTable)
            .where(eq(TeamsTable.id, teamId));

        if (!team)
            return ctx.json({ error: "Team not found" }, StatusCodes.NOT_FOUND);

        const [membership] = await db
            .select({ role: TeamMembersTable.role })
            .from(TeamMembersTable)
            .where(and(
                eq(TeamMembersTable.teamId, teamId),
                eq(TeamMembersTable.userId, userId),
            ));

        if (membership?.role !== "Captain")
            return ctx.json({ error: "Only a team captain can delete this team" }, StatusCodes.FORBIDDEN);

        await db
            .delete(TeamsTable)
            .where(eq(TeamsTable.id, teamId));

        return ctx.json({ data: "Deleted team" }, StatusCodes.OK);
    });

export default app;
