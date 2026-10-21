import { sValidator } from "@hono/standard-validator";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto"
import { Hono } from 'hono'
import { UsersTable, createUserSchema, loginSchema } from "../db/schemas.ts"
import { db } from "../db/db.ts"
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { jwt, decode, sign, verify } from 'hono/jwt';
import "dotenv/config"

const keyLen = 64;
const randomBytesSize = 20;
const app = new Hono();
const jwtExpTime = 60 * 5;
const AUTH_SECRET = process.env.AUTH_SECRET;

type JWTPayload = {
    exp: number,
    id: number,
    email: string
}

if (!AUTH_SECRET)
    throw new Error("auth secret not loaded from env")


// https://hono.dev/docs/helpers/jwt#payload-validation
app.post("/register", sValidator("json", createUserSchema), async (ctx) => {
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

    return ctx.json(user, 201);
});

app.post("/login", sValidator("json", loginSchema), async (ctx) => {
    const { email, password } = ctx.req.valid("json");

    const [user] = await db
        .select()
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

    if (!user)
        return ctx.json({ error: "Invalid email or password" }, 401)

    const valid = await compare(password, user.password);
    if (!valid)
        return ctx.json({ error: "Invalid email or password" }, 401)

    const payload: JWTPayload = {
        exp: Math.floor(Date.now() / 1000) * jwtExpTime,    // exp in 5 mins
        id: user.id,
        email: user.email,
    }

    const token = await sign(payload, AUTH_SECRET)         // signing with my secret value that i can use to decode later
    return ctx.json({ token })
})


/**
 * Used to hash a password
 * @param {string} password
 * @returns {string} The salt and hash
 * @see https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k#comment-24a9e
 */
export async function hashPassword(password: string): Promise<string> {
    return new Promise((res, rej) => {
        const salt = randomBytes(randomBytesSize).toString("hex");

        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);

            res(`${salt}:${derivedKey.toString("hex")}`);
        });
    });
}

export async function compare(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((res, rej) => {
        const [salt, hashKey] = hashedPassword.split(":");
        const hashBuffer = Buffer.from(hashKey, "hex");
        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);

            res(timingSafeEqual(hashBuffer, derivedKey));
        });
    })
}


export default app;