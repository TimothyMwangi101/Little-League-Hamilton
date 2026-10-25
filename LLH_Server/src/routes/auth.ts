import { sValidator } from "@hono/standard-validator";
import { hashPassword, comparePasswords } from "../lib/crypto.ts"
import { Hono } from 'hono'
import { createUserValidator, loginValidator, resetPasswordValidator, UsersTable } from "../db/schemas.ts"
import type { ApiFail, ApiSuccess, User, UserPayload } from "../db/schemas.ts";
import { db } from "../db/db.ts"
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { jwt, decode, sign, verify } from 'hono/jwt';
import "dotenv/config";


const app = new Hono();
const jwtExpTime = 60 * 5;
const AUTH_SECRET = process.env.AUTH_SECRET;


if (!AUTH_SECRET)
    throw new Error("auth secret not loaded from env")


// https://hono.dev/docs/helpers/jwt#payload-validation
app.post("/register", sValidator("json", createUserValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" } satisfies ApiFail, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const [exists] = await db
        .select({ id: UsersTable.id })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (exists)
        return ctx.json({ error: "User already exists" } satisfies ApiFail, StatusCodes.CONFLICT);

    try {
        const { salt, hashedPassword } = await hashPassword(password);

        const [user] = await db
            .insert(UsersTable)
            .values({ email, password: hashedPassword, salt })
            .returning();

        if (!user)
            throw new Error("Could not create user");

        return ctx.json({ data: user } satisfies ApiSuccess<User>, StatusCodes.CREATED);
    } catch (err) {
        console.error(err);
        return ctx.json({ error: "Could not register user" } satisfies ApiFail, StatusCodes.INTERNAL_SERVER_ERROR);
    }
});

app.post("/login", sValidator("json", loginValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" } satisfies ApiFail, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const [{ salt, ...user }] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (!user)
        return ctx.json({ error: "Invalid email or password" } satisfies ApiFail, StatusCodes.UNAUTHORIZED);

    try {
        const valid = await comparePasswords(password, {
            salt: salt, hashedPassword: user.password
        });

        if (!valid)
            return ctx.json({ error: "Invalid email or password" } satisfies ApiFail, StatusCodes.UNAUTHORIZED);
        
    } catch (err) {
        console.error(err);
        return ctx.json({ error: "Could not validate user" } satisfies ApiFail, StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const payload: UserPayload = {
        exp: Math.floor(Date.now() / 1000) * jwtExpTime,        // exp in 5 mins
        id: user.id,
        email: user.email,
    }
    
    // Todo: Use for login 
    const token = await sign(payload, AUTH_SECRET, "HS256")     // signing with my secret value that i can use to decode later

    return ctx.json({ data: user } satisfies ApiSuccess<User>, StatusCodes.OK);
})

app.post("/reset-password", sValidator("json", resetPasswordValidator, (result, ctx) => {
    if (!result.success) {
        console.error(result.error)
        return ctx.json({ error: "Invalid request body" } satisfies ApiFail, StatusCodes.BAD_REQUEST);
    }
}), async (ctx) => {
    let { email, newPassword } = ctx.req.valid("json");

    if (!email) {
        console.error("Email was undefined")
        return ctx.json({ error: "Invalid request body" } satisfies ApiFail, StatusCodes.BAD_REQUEST);
    }

    const [user] = await db
        .select({ id: UsersTable.id, password: UsersTable.password })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (!user)
        return ctx.json({ error: "Invalid email or password" } satisfies ApiFail, StatusCodes.UNAUTHORIZED);

    const { salt, hashedPassword } = await hashPassword(newPassword);

    const [updatedUser] = await db.update(UsersTable)
        .set({ password: hashedPassword, salt: salt })
        .where(eq(UsersTable.id, user.id))
        .returning({
            id: UsersTable.id,
            email: UsersTable.email,
            password: UsersTable.password,
            createdAt: UsersTable.createdAt,
        })

    if (!updatedUser)
        return ctx.json({ error: "Reset password failed" } satisfies ApiFail, StatusCodes.INTERNAL_SERVER_ERROR)

    return ctx.json({ data: updatedUser} satisfies ApiSuccess<User>, StatusCodes.OK)
})


export default app;