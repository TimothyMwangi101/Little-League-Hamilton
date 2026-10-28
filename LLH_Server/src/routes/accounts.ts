import { sValidator } from "@hono/standard-validator";
import { Hono } from 'hono'
import { AccountsTable, createAccountValidator, joinTeamValidator, TeamsTable, UsersTable } from "../db/schemas.ts"
import type { Account, ApiFail, ApiSuccess, SafeAccount, UserPayload } from "../db/schemas.ts";
import { db } from "../db/db.ts"
import { and, eq, isNull } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { jwt } from 'hono/jwt';
import "dotenv/config";
import { refreshJWT, authenticate, type UserPayloadEnv } from "../middleware/auth.ts";


const app = new Hono<UserPayloadEnv>()
    .use(authenticate, refreshJWT);

export async function getAccount(id: number) {
  const [account] = await db
    .select()
    .from(AccountsTable)
    .where(eq(AccountsTable.userId, id));

  return account ?? null;
}

export async function createAccount(id: number) {
    const [exist] = await db
        .select()
        .from(AccountsTable)
        .where(eq(AccountsTable.userId, id));

    if (exist)
        return;

    await db
        .insert(AccountsTable)
        .values({ userId: id });
}

app.get('/', async (ctx) => {
    const { id } = ctx.get('jwtPayload');
    const [account] = await db
        .select()
        .from(AccountsTable)
        .where(eq(AccountsTable.userId, id));

    if (!account)
        return ctx.json({ error: "Error getting account" } satisfies ApiFail, StatusCodes.INTERNAL_SERVER_ERROR);

    return ctx.json({ data: account }, StatusCodes.OK)
})

app.post("/create", authenticate, sValidator("json", createAccountValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" } satisfies ApiFail, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    const { id } = ctx.req.valid("json");

    await createAccount(id);
    return ctx.json({ data: null }, StatusCodes.CREATED);
});

app.post("/join", sValidator("json", joinTeamValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    const { id: userId } = ctx.get("jwtPayload");
    const { teamId } = ctx.req.valid("json");
    const [team] = await db
        .select()
        .from(TeamsTable)
        .where(eq(TeamsTable.id, teamId));

    if (!team)
        return ctx.json({ error: "Team not found" }, StatusCodes.NOT_FOUND);

    if (team.invitePolicy !== "Open")
        return ctx.json({ error: "This team requires an invitation" }, StatusCodes.FORBIDDEN);

    const [account] = await db
        .select({ team: AccountsTable.team })
        .from(AccountsTable)
        .where(eq(AccountsTable.userId, userId));

    if (!account)
        return ctx.json({ error: "Account not found" }, StatusCodes.NOT_FOUND);

    if (account.team !== null && account.team !== teamId)
        return ctx.json({ error: "User already belongs to a team" }, StatusCodes.CONFLICT);

    if (account.team === null) {
        const [updated] = await db
            .update(AccountsTable)
            .set({ team: teamId })
            .where(and(eq(AccountsTable.userId, userId), isNull(AccountsTable.team)))
            .returning({ userId: AccountsTable.userId });

        if (!updated) {
            const [latestAccount] = await db
                .select({ team: AccountsTable.team })
                .from(AccountsTable)
                .where(eq(AccountsTable.userId, userId));

            if (!latestAccount)
                return ctx.json({ error: "Account not found" }, StatusCodes.NOT_FOUND);

            if (latestAccount.team !== teamId)
                return ctx.json({ error: "User already belongs to a team" }, StatusCodes.CONFLICT);
        }
    }

    const [user] = await db
        .select({ AccountsTable, email: UsersTable.email })
        .from(AccountsTable)
        .innerJoin(UsersTable, eq(UsersTable.id, AccountsTable.userId))
        .where(eq(AccountsTable.userId, userId));

    if (!user)
        return ctx.json({ error: "Error getting account" }, StatusCodes.INTERNAL_SERVER_ERROR);

    return ctx.json({ data: user }, StatusCodes.OK);
});

export default app;