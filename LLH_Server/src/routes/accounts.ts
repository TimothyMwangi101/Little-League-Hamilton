import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { AccountsTable, TeamMembersTable, TeamRecordsView, TeamsTable, UsersTable } from "../db/schemas.ts";
import db from "../db/db.ts";
import { refreshJWT, authenticate, type UserPayloadEnv } from "../middleware/auth.ts";
import { joinTeamValidator, updateAccountValidator } from "../../../LLH_Shared/validators.ts";

const app = new Hono<UserPayloadEnv>()
    .use(authenticate, refreshJWT)
    .get("/", async (ctx) => {
        const { id } = ctx.get("jwtPayload");
        const account = await getAccountData(id);

        if (!account)
            return ctx.json({ error: "Account not found" }, StatusCodes.NOT_FOUND);

        return ctx.json({ data: account }, StatusCodes.OK);
    })
    .patch("/", sValidator("json", updateAccountValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id } = ctx.get("jwtPayload");
        const updates = ctx.req.valid("json");
        const [updatedAccount] = await db
            .update(AccountsTable)
            .set(updates)
            .where(eq(AccountsTable.userId, id))
            .returning({ userId: AccountsTable.userId });

        if (!updatedAccount)
            return ctx.json({ error: "Account not found" }, StatusCodes.NOT_FOUND);

        const account = await getAccountData(id);
        if (!account)
            return ctx.json({ error: "Account not found" }, StatusCodes.INTERNAL_SERVER_ERROR);

        return ctx.json({ data: account }, StatusCodes.OK);
    })
    .post("/create", async (ctx) => {
        const { id } = ctx.get("jwtPayload");
        await createAccount(id);
        return ctx.json({ data: null }, StatusCodes.CREATED);
    })
    .post("/join", sValidator("json", joinTeamValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error);
            return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { id: userId } = ctx.get("jwtPayload");
        const { id: teamId } = ctx.req.valid("json");
        const [team] = await db
            .select({ id: TeamsTable.id, invitePolicy: TeamsTable.invitePolicy })
            .from(TeamsTable)
            .where(eq(TeamsTable.id, teamId));

        if (!team)
            return ctx.json({ error: "Team not found" }, StatusCodes.NOT_FOUND);

        if (team.invitePolicy !== "Open")
            return ctx.json({ error: "This team requires an invitation" }, StatusCodes.FORBIDDEN);

        const [account] = await db
            .select({ userId: AccountsTable.userId })
            .from(AccountsTable)
            .where(eq(AccountsTable.userId, userId));

        if (!account)
            return ctx.json({ error: "Account not found" }, StatusCodes.NOT_FOUND);

        await db
            .insert(TeamMembersTable)
            .values({ teamId, userId, role: "Member" })
            .onConflictDoNothing();

        const accountData = await getAccountData(userId);
        if (!accountData)
            return ctx.json({ error: "Account not found" }, StatusCodes.INTERNAL_SERVER_ERROR);

        return ctx.json({ data: accountData }, StatusCodes.OK);
    });

async function getAccountData(userId: number) {
    const [account] = await db
        .select({ AccountsTable, email: UsersTable.email })
        .from(AccountsTable)
        .innerJoin(UsersTable, eq(UsersTable.id, AccountsTable.userId))
        .where(eq(AccountsTable.userId, userId));

    if (!account)
        return undefined;

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

    return { ...account, teams };
}

export async function getAccount(id: number) {
    const account = await getAccountData(id);
    return account
        ? { ...account.AccountsTable, teams: account.teams }
        : undefined;
}

export async function createAccount(id: number) {
    await db
        .insert(AccountsTable)
        .values({ userId: id })
        .onConflictDoNothing();
}

export default app;
