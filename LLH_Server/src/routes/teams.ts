import { createTeamValidator, TeamsTable } from "../db/schemas.ts";
import { db } from "../db/db.ts";
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { authenticate, refreshJWT, type UserPayloadEnv } from "../middleware/auth.ts";

const app = new Hono<UserPayloadEnv>()
    .use(authenticate, refreshJWT)
    .get("/", async (ctx) => {
        const teams = await db.select().from(TeamsTable);
        return ctx.json({ data: teams }, StatusCodes.OK);
    })
    .get("/:id", async (ctx) => {
        const { id } = ctx.get('jwtPayload') ?? undefined;

        if (!id)
            return ctx.json({ error: "Not authenticated" }, StatusCodes.UNAUTHORIZED);

        const [team] = await db.select()
            .from(TeamsTable)
            .where(eq(TeamsTable.id, id));

        if (!team) {
            return ctx.json({ error: "Teamt not found" }, StatusCodes.NOT_FOUND);
        }

        return ctx.json({ data: team }, StatusCodes.OK);
    })
    .post("/create", sValidator("json", createTeamValidator, (result, ctx) => {
        if (!result.success) {
            console.error(result.error)
            return ctx.json({ error: "Invalid request body" }, StatusCodes.BAD_REQUEST);
        }
    }), async (ctx) => {
        const { name, captainId, invitePolicy } = ctx.req.valid("json");

        const [exist] = await db
            .select()
            .from(TeamsTable)
            .where(eq(TeamsTable.name, name));

        if (exist)
            return ctx.json({ error: "Teamt exists" }, StatusCodes.CONFLICT);

        const [team] = await db
            .insert(TeamsTable)
            .values({ name, captainId, invitePolicy })
            .returning();

        return ctx.json({ data: team }, StatusCodes.CREATED);
    }).delete("/", async (ctx) => {
        const { id } = ctx.get('jwtPayload') ?? undefined;

        if (!id)
            return ctx.json({ error: "Not authenticated" }, StatusCodes.UNAUTHORIZED);

        const [team] = await db
            .select()
            .from(TeamsTable)
            .where(eq(TeamsTable.captainId, id))

        if (!team)
            return ctx.json({ error: "Only captain can delete teams" }, StatusCodes.UNAUTHORIZED);

        await db
            .delete(TeamsTable)
            .where(eq(TeamsTable.id, team.id));

        return ctx.json({ data: "Deleted team" }, StatusCodes.OK);
    });

export default app;
