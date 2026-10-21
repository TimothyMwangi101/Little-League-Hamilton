import { sValidator } from "@hono/standard-validator";
import { hashPassword, comparePasswords } from "../lib/crypto.ts"
import { Hono } from 'hono'
import { UsersTable, createUserSchema, loginSchema, resetPasswordSchema } from "../db/schemas.ts"
import { db } from "../db/db.ts"
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { jwt, decode, sign, verify } from 'hono/jwt';
import "dotenv/config"
import type { JWTPayload } from "./apiKeys.ts";


const app = new Hono();
const jwtExpTime = 60 * 5;
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET)
    throw new Error("auth secret not loaded from env")


// https://hono.dev/docs/helpers/jwt#payload-validation
app.post("/register", sValidator("json", createUserSchema, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    let { email, password } = ctx.req.valid("json");

    const [exists] = await db
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (exists)
        return ctx.json({ error: "User already exists" }, StatusCodes.CONFLICT);

    password = await hashPassword(password);

    const user = await db
        .insert(UsersTable)
        .values({ email, password })
        .returning({ id: UsersTable.id, email: UsersTable.email })

    return ctx.json({ data: user }, StatusCodes.CREATED);
});

app.post("/login", sValidator("json", loginSchema, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const [user] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (!user)
        return ctx.json({ error: "Invalid email or password" }, StatusCodes.UNAUTHORIZED);

    const valid = await comparePasswords(password, user.password);
    if (!valid)
        return ctx.json({ error: "Invalid email or password" }, StatusCodes.UNAUTHORIZED);

    const payload: JWTPayload = {
        exp: Math.floor(Date.now() / 1000) * jwtExpTime,        // exp in 5 mins
        id: user.id,
        email: user.email,
    }

    const token = await sign(payload, AUTH_SECRET, "HS256")     // signing with my secret value that i can use to decode later
    return ctx.json({ data: token }, StatusCodes.CREATED);
})

app.post("/reset-password", sValidator("json", resetPasswordSchema, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    let { email, newPassword } = ctx.req.valid("json");

    if(!email) {
        console.error("Email was undefined")
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }

    const [user] = await db
        .select({ id: UsersTable.id, password: UsersTable.password })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (!user)
        return ctx.json({ error: "Invalid email or password" }, StatusCodes.UNAUTHORIZED);

    newPassword = await hashPassword(newPassword);

    const [updatedUser] = await db.update(UsersTable)
    .set({ password: newPassword })
    .where(eq(UsersTable.id, user.id))
    .returning({ updatedUserId : UsersTable.id })

    if(!updatedUser)
        return ctx.json({ error: "Reset password failed" }, StatusCodes.INTERNAL_SERVER_ERROR)
    
    return ctx.json({ data: {} }, StatusCodes.OK)
})


export default app;