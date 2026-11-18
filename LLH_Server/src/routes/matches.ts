import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";
import { MatchesTable } from "../db/schemas.ts";
import db from "../db/db.ts";
import { authenticate, refreshJWT, type UserPayloadEnv } from "../middleware/auth.ts";

const app = new Hono<UserPayloadEnv>()
    .use(authenticate, refreshJWT)
    .get("/", async (ctx) => {
        const matches = await db.select().from(MatchesTable);
        return ctx.json({ data: matches }, StatusCodes.OK);
    });

export default app;
