import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { and, eq, notExists, or, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { AccountsTable, MatchesTable, TeamMembersTable, TeamRecordsView, TeamsTable, UsersTable } from "../db/schemas.ts";
import db from "../db/db.ts";
import { authenticate, refreshJWT, type UserPayloadEnv } from "../middleware/auth.ts";
import { createTeamValidator, promoteCoCaptainParamsValidator, respondToMatchValidator, scheduleMatchValidator, teamIdValidator, teamMatchIdValidator } from "../../../LLH_Shared/validators.ts";
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
    .get("/:teamId/members", sValidator("param", teamIdValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid team id" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const { teamId } = ctx.req.valid("param");
        const [membership] = await db
            .select({ userId: TeamMembersTable.userId })
            .from(TeamMembersTable)
            .where(and(
                eq(TeamMembersTable.teamId, teamId),
                eq(TeamMembersTable.userId, userId),
            ));

        if (!membership)
            return ctx.json({ error: "Team membership required" }, StatusCodes.FORBIDDEN);

        const members = await db
            .select({
                userId: TeamMembersTable.userId,
                firstName: AccountsTable.firstName,
                lastName: AccountsTable.lastName,
                role: TeamMembersTable.role,
                joinedAt: TeamMembersTable.joinedAt,
            })
            .from(TeamMembersTable)
            .innerJoin(UsersTable, eq(UsersTable.id, TeamMembersTable.userId))
            .leftJoin(AccountsTable, eq(AccountsTable.userId, TeamMembersTable.userId))
            .where(eq(TeamMembersTable.teamId, teamId));

        return ctx.json({ data: members }, StatusCodes.OK);
    })
    .get("/:teamId/matches", sValidator("param", teamIdValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid team id" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const { teamId } = ctx.req.valid("param");
        const [membership] = await db
            .select({ role: TeamMembersTable.role })
            .from(TeamMembersTable)
            .where(and(
                eq(TeamMembersTable.teamId, teamId),
                eq(TeamMembersTable.userId, userId),
            ));

        if (!membership)
            return ctx.json({ error: "Team membership required" }, StatusCodes.FORBIDDEN);

        const matches = await db
            .select({
                match: MatchesTable,
                otherTeamName: TeamsTable.name,
            })
            .from(MatchesTable)
            .innerJoin(
                TeamsTable,
                sql`${TeamsTable.id} = CASE WHEN ${MatchesTable.challengerId} = ${teamId} THEN ${MatchesTable.opponentId} ELSE ${MatchesTable.challengerId} END`,
            )
            .where(or(
                eq(MatchesTable.challengerId, teamId),
                eq(MatchesTable.opponentId, teamId),
            ))
            .orderBy(MatchesTable.matchDate);

        return ctx.json({
            data: matches.map(({ match, otherTeamName }) => ({
                ...match,
                otherTeamName,
                isChallenger: match.challengerId === teamId,
            })),
        }, StatusCodes.OK);
    })
    .post("/:teamId/matches", sValidator("param", teamIdValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid team id" }, StatusCodes.BAD_REQUEST);
        }
    }), sValidator("json", scheduleMatchValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid match details" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const { teamId } = ctx.req.valid("param");
        const { opponentTeamName, matchDate } = ctx.req.valid("json");
        const [challenger] = await db
            .select({ id: TeamsTable.id, name: TeamsTable.name, sport: TeamsTable.sport })
            .from(TeamsTable)
            .where(eq(TeamsTable.id, teamId));

        if (!challenger)
            return ctx.json({ error: "Team not found" }, StatusCodes.NOT_FOUND);

        const [membership] = await db
            .select({ role: TeamMembersTable.role })
            .from(TeamMembersTable)
            .where(and(
                eq(TeamMembersTable.teamId, teamId),
                eq(TeamMembersTable.userId, userId),
            ));

        if (membership?.role !== "Captain" && membership?.role !== "CoCaptain")
            return ctx.json({ error: "Only a captain or co-captain can schedule a match" }, StatusCodes.FORBIDDEN);

        const [opponent] = await db
            .select({ id: TeamsTable.id, name: TeamsTable.name, sport: TeamsTable.sport })
            .from(TeamsTable)
            .where(eq(TeamsTable.name, opponentTeamName));

        if (!opponent)
            return ctx.json({ error: "No team has that exact name" }, StatusCodes.NOT_FOUND);

        if (opponent.id === challenger.id)
            return ctx.json({ error: "You cannot schedule a match against your own team" }, StatusCodes.BAD_REQUEST);

        if (opponent.sport !== challenger.sport)
            return ctx.json({ error: "Teams must play the same sport" }, StatusCodes.CONFLICT);

        const [match] = await db
            .insert(MatchesTable)
            .values({
                challengerId: challenger.id,
                opponentId: opponent.id,
                sport: challenger.sport,
                status: "Pending",
                matchDate,
            })
            .returning();

        if (!match)
            return ctx.json({ error: "Could not schedule the match" }, StatusCodes.INTERNAL_SERVER_ERROR);

        return ctx.json({ data: match }, StatusCodes.CREATED);
    })
    .patch("/:teamId/matches/:matchId/respond", sValidator("param", teamMatchIdValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid match id" }, StatusCodes.BAD_REQUEST);
        }
    }), sValidator("json", respondToMatchValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid match response" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const { teamId, matchId } = ctx.req.valid("param");
        const { status } = ctx.req.valid("json");
        const [match] = await db
            .select()
            .from(MatchesTable)
            .where(eq(MatchesTable.id, matchId));

        if (!match)
            return ctx.json({ error: "Match not found" }, StatusCodes.NOT_FOUND);

        if (match.opponentId !== teamId)
            return ctx.json({ error: "Only the opposing team can respond to this match" }, StatusCodes.FORBIDDEN);

        const [membership] = await db
            .select({ role: TeamMembersTable.role })
            .from(TeamMembersTable)
            .where(and(
                eq(TeamMembersTable.teamId, match.opponentId),
                eq(TeamMembersTable.userId, userId),
            ));

        if (membership?.role !== "Captain" && membership?.role !== "CoCaptain")
            return ctx.json({ error: "Only the opposing team's captain or co-captain can respond" }, StatusCodes.FORBIDDEN);

        if (match.status !== "Pending")
            return ctx.json({ error: "This match is no longer awaiting a response" }, StatusCodes.CONFLICT);

        const [updatedMatch] = await db
            .update(MatchesTable)
            .set({ status })
            .where(and(
                eq(MatchesTable.id, matchId),
                eq(MatchesTable.status, "Pending"),
            ))
            .returning();

        if (!updatedMatch)
            return ctx.json({ error: "This match is no longer awaiting a response" }, StatusCodes.CONFLICT);

        return ctx.json({ data: updatedMatch }, StatusCodes.OK);
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
    .patch("/:teamId/members/:userId/cocaptain", sValidator("param", promoteCoCaptainParamsValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid team or user id" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: captainId } = ctx.get("jwtPayload");
        const { teamId, userId } = ctx.req.valid("param");

        const [team] = await db
            .select({ id: TeamsTable.id })
            .from(TeamsTable)
            .where(eq(TeamsTable.id, teamId));

        if (!team)
            return ctx.json({ error: "Team not found" }, StatusCodes.NOT_FOUND);

        const [captainMembership] = await db
            .select({ role: TeamMembersTable.role })
            .from(TeamMembersTable)
            .where(and(
                eq(TeamMembersTable.teamId, teamId),
                eq(TeamMembersTable.userId, captainId),
            ));

        if (captainMembership?.role !== "Captain")
            return ctx.json({ error: "Only the team captain can promote a co-captain" }, StatusCodes.FORBIDDEN);

        const roster = await db
            .select({ userId: TeamMembersTable.userId, role: TeamMembersTable.role })
            .from(TeamMembersTable)
            .where(eq(TeamMembersTable.teamId, teamId));
        const member = roster.find(({ userId: memberId }) => memberId === userId);

        if (!member)
            return ctx.json({ error: "Team member not found" }, StatusCodes.NOT_FOUND);

        if (member.role !== "Member")
            return ctx.json({ error: "Only a team member can be promoted" }, StatusCodes.CONFLICT);

        if (roster.length <= 3)
            return ctx.json({ error: "A team must have more than 3 members to appoint a co-captain" }, StatusCodes.CONFLICT);

        if (roster.some(({ role }) => role === "CoCaptain"))
            return ctx.json({ error: "This team already has a co-captain" }, StatusCodes.CONFLICT);

        const [promotedMember] = await db
            .update(TeamMembersTable)
            .set({ role: "CoCaptain" })
            .where(and(
                eq(TeamMembersTable.teamId, teamId),
                eq(TeamMembersTable.userId, userId),
                eq(TeamMembersTable.role, "Member"),
                sql`(SELECT COUNT(*) FROM ${TeamMembersTable} WHERE ${TeamMembersTable.teamId} = ${teamId}) > 3`,
                notExists(
                    db.select({ userId: TeamMembersTable.userId })
                        .from(TeamMembersTable)
                        .where(and(
                            eq(TeamMembersTable.teamId, teamId),
                            eq(TeamMembersTable.role, "CoCaptain"),
                        )),
                ),
            ))
            .returning({
                teamId: TeamMembersTable.teamId,
                userId: TeamMembersTable.userId,
                role: TeamMembersTable.role,
            });

        if (!promotedMember)
            return ctx.json({ error: "Team member could not be promoted" }, StatusCodes.CONFLICT);

        return ctx.json({ data: promotedMember }, StatusCodes.OK);
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
