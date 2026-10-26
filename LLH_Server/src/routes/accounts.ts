import { sValidator } from "@hono/standard-validator";
import { Hono } from 'hono'
import { AccountsTable, createAccountValidator } from "../db/schemas.ts"
import type { Account, ApiFail, ApiSuccess, SafeAccount, UserPayload } from "../db/schemas.ts";
import { db } from "../db/db.ts"
import { eq } from "drizzle-orm";
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
    const account = await getAccount(id);

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

export default app;