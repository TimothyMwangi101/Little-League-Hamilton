import { sValidator } from "@hono/standard-validator";
import { hashPassword, comparePasswords } from "../lib/crypto.ts"
import { Hono } from 'hono'
import { createUserValidator, loginValidator, resetPasswordValidator, UsersTable } from "../db/schemas.ts"
import { db } from "../db/db.ts"
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { deleteJWT, issueJWT } from "../middleware/auth.ts";
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { createAccount, getAccount } from "./accounts.ts";

expand(dotenv.config());

const app = new Hono();
const AUTH_SECRET = process.env.AUTH_SECRET;
const SERVER_URL = process.env.SERVER_URL;

if (!SERVER_URL)
    throw new Error("server url not in env")

if (!AUTH_SECRET)
    throw new Error("auth secret not loaded from env");

/**
 * Responsible for creating a new user and logs them in after account creation.
 */
app.post("/register", sValidator("json", createUserValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const [exists] = await db
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (exists)
        return ctx.json({ data : null }, StatusCodes.OK);

    try {
        const { salt, hashedPassword } = await hashPassword(password);

        const [user] = await db
            .insert(UsersTable)
            .values({ email, password: hashedPassword, salt })
            .returning();

        if (!user)
            return ctx.json({ error: "Could not create user" }, 500);

        // Creates the user's account
        await createAccount(user.id);
    
        return ctx.json({ data: null }, StatusCodes.CREATED);

    } catch (err) {
        console.error(err);
        return ctx.json({ error: "Could not register user" }, StatusCodes.INTERNAL_SERVER_ERROR);
    } 
});

app.post("/login", sValidator("json", loginValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    // Confirm the user exists.
    const [user] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.email, email));
        
    try {
        if (!user)
            return ctx.json({ error: "Invalid email or password" }, StatusCodes.UNAUTHORIZED);

        const valid = await comparePasswords(password, {
            salt: user.salt, hashedPassword: user.password
        });

        if (!valid)
            return ctx.json({ error: "Invalid email or password" }, StatusCodes.UNAUTHORIZED);

        await issueJWT(ctx, user.id);

        const account = await getAccount(user.id);

        return ctx.json({ data: account }, StatusCodes.OK);

    } catch (err) {
        console.error(err);
        return ctx.json({ error: "Could not validate user" }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

app.post("/reset-password", sValidator("json", resetPasswordValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    let { email, newPassword } = ctx.req.valid("json");

    if (!email) {
        console.error("Email was undefined")
        return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
    }

    const [user] = await db
        .select({ id: UsersTable.id, password: UsersTable.password })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (!user)
        return ctx.json({ error: "Invalid email or password" }, StatusCodes.UNAUTHORIZED);

    const { salt, hashedPassword } = await hashPassword(newPassword);

    const [updatedUser] = await db.update(UsersTable)
        .set({ password: hashedPassword, salt: salt })
        .where(eq(UsersTable.id, user.id))
        .returning({
            id: UsersTable.id,
        });

    if (!updatedUser)
        return ctx.json({ error: "Reset password failed" }, StatusCodes.INTERNAL_SERVER_ERROR)

    return ctx.json({ data: null }, StatusCodes.OK)
});


app.post("/logout", async (ctx) => {
    deleteJWT(ctx);
    return ctx.json({ data: null }, StatusCodes.OK);
});

export default app;