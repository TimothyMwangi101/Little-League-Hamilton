import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { and, eq, notExists, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { TeamMembersTable, TeamRecordsView, TeamsTable, UsersTable } from "../db/schemas.ts";
import db from "../db/db.ts";
import { authenticate, refreshJWT, type UserPayloadEnv } from "../middleware/auth.ts";
import { createTeamValidator, promoteCoCaptainParamsValidator, teamIdValidator } from "../../../LLH_Shared/validators.ts";
import { sendEmail } from "../lib/email.ts";

const EMAIL_SENDER = "Little League Hamilton <onboarding@resend.dev>";

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
        const { id: userId, email } = ctx.get("jwtPayload");
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

        let notificationError: string | undefined;
        try {
            await sendEmail(
                EMAIL_SENDER,
                email,
                `You're the captain of ${team.name}`,
                `Congratulations! You have been named captain of ${team.name}.`,
            );
        } catch (error) {
            console.error("Team captain notification failed", error);
            notificationError = "Team was created, but the captain notification email could not be sent";
        }

        return ctx.json({
            data: {
                team,
                role: "Captain",
                wins: 0,
                losses: 0,
                draws: 0,
            },
            ...(notificationError ? { warning: notificationError } : {}),
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
            .select({ id: TeamsTable.id, name: TeamsTable.name })
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

        const [promotedUser] = await db
            .select({ email: UsersTable.email })
            .from(UsersTable)
            .where(eq(UsersTable.id, userId));

        let notificationError: string | undefined;
        if (promotedUser) {
            try {
                await sendEmail(
                    EMAIL_SENDER,
                    promotedUser.email,
                    `You're a co-captain of ${team.name}`,
                    `Congratulations! You have been named co-captain of ${team.name}.`,
                );
            } catch (error) {
                console.error("Team co-captain notification failed", error);
                notificationError = "Promotion succeeded, but the co-captain notification email could not be sent";
            }
        } else
            notificationError = "Promotion succeeded, but the co-captain's email address could not be found";

        return ctx.json({
            data: promotedMember,
            ...(notificationError ? { warning: notificationError } : {}),
        }, StatusCodes.OK);
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
