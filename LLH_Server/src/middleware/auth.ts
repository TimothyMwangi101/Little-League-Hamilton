import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import "dotenv/config"
import { createMiddleware } from 'hono/factory';
import { jwt } from 'hono/jwt';

const JWT_EXP_TIME = 60 * 10;
const REFRESH_WHEN_LEFT  = JWT_EXP_TIME * 0.50;      // 50% time left
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET)
    throw new Error("auth secret not found");

export type UserPayload = {
    exp: number,
    id: number,
    email: string,
};

export type UserPayloadEnv = { 
    Variables: { jwtPayload: UserPayload }
}

/** looks for the cookie named token */
export const authenticate = jwt({ secret: AUTH_SECRET, alg: 'HS256', cookie: 'token' })

export async function issueJWT(ctx: Context, user: { id: number, email: string }) {
    const payload: UserPayload = {
        exp: Math.floor(Date.now() / 1000) + JWT_EXP_TIME,   // exp in 10 mins 
        id: user.id,
        email: user.email
    }
    const token = sign(payload, AUTH_SECRET!, "HS256")

    setCookie(ctx, "token", await token, {
        httpOnly: true,
        sameSite: "Strict",
        maxAge: JWT_EXP_TIME,      // 10 mins
        path: "/",
        secure: true
    });
}

export const refreshJWT = createMiddleware<UserPayloadEnv>(async (ctx, next) => {
    const { exp, ...user } = ctx.get("jwtPayload")
    const secondsLeft = exp - Math.floor(Date.now() / 1000)

    if (secondsLeft < REFRESH_WHEN_LEFT)  // When its 75% expired
        await issueJWT(ctx, user)

    await next()
})

export function deleteJWT(ctx: Context) {
    deleteCookie(ctx, "token", { path: "/" });
}
