import { sValidator } from "@hono/standard-validator";
import { ApiKeysTable, createKeySchema } from "../db/schemas.ts";
import { db } from "../db/db.ts";
import { eq } from 'drizzle-orm';
import { basicAuth } from "hono/basic-auth";
import { compare, hashPassword } from "./auth.ts";
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import "dotenv/config"


export type JWTPayload = {
    exp: number,
    id: number,
    email: string
}

type JWTEnv = {
    Variables: {
        jwtPayload: JWTPayload
    }
}

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET)
    throw new Error("auth secret not loaded from env")

const app = new Hono<JWTEnv>();

app.use(jwt({ secret: AUTH_SECRET, alg: "HS256" }))

app.get("/", async (ctx) => {
    const { id } = ctx.var.jwtPayload;

    const keys = await db.select({
        id: ApiKeysTable.id,
        name: ApiKeysTable.name,
        keyPrefix: ApiKeysTable.keyPrefix,
        createdAt: ApiKeysTable.createdAt
    })
    .from(ApiKeysTable)
    .where(eq(ApiKeysTable.id, id)) ?? []
    
    return ctx.json(keys)
});

app.post("/", sValidator("json", createKeySchema))


export default app;