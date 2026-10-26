import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import { type UserPayload } from '../db/schemas.ts';
import "dotenv/config"
import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';

const JWT_EXP_TIME = 60 * 5;
const REFRESH_WHEN_LEFT  = JWT_EXP_TIME / 0.25;      // 25% time left
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET)
    throw new Error("auth secret not loaded from env");

export type UserPayloadEnv = { Variables: { jwtPayload: UserPayload } }

/** looks for the cookie named token */
export const authenticate = jwt({ secret: AUTH_SECRET, alg: 'HS256', cookie: 'token' })

export async function issueJWT(ctx: Context, userId: number) {
    const payload: UserPayload = {
        exp: Math.floor(Date.now() / 1000) + JWT_EXP_TIME,   // exp in 5 mins 
        id: userId,
    }
    const token = await sign(payload, AUTH_SECRET!, "HS256")

    setCookie(ctx, "token", token, {
        httpOnly: true,
        sameSite: "Lax",
        maxAge: JWT_EXP_TIME,      // 5 mins
        path: "/",
        secure: false
    });
}

export const refreshJWT = createMiddleware<UserPayloadEnv>(async (ctx, next) => {
    const { exp, id } = ctx.get("jwtPayload")
    const secondsLeft = exp - Math.floor(Date.now() / 1000)

    if (secondsLeft < REFRESH_WHEN_LEFT )  // When its 75% expired
        await issueJWT(ctx, id)

    await next()
})

export function deleteJWT(ctx: Context) {
    deleteCookie(ctx, "token", { path: "/" });
}
