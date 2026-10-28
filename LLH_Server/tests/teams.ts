import { createTeamValidator, TeamsTable, UsersTable } from "../db/schemas.ts";
import { db } from "../db/db.ts";
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";

const app = new Hono();

app.get("/", async (ctx) => {
    const teams = await db.select().from(TeamsTable);
    return ctx.json({ data: teams }, StatusCodes.OK);
});

app.get("/:id", async (ctx) => {
    const id = Number.parseInt(ctx.req.param("id") ?? -1);

    if (id < 0) {
        return ctx.json({ error: "Invalid user id" }, StatusCodes.BAD_REQUEST);
    }

    const [team] = await db.select()
        .from(TeamsTable)
        .where(eq(TeamsTable.id, id));

    if (!team) {
        return ctx.json({ error: "Teamt not found" }, StatusCodes.NOT_FOUND);
    }

    return ctx.json({ data: team }, StatusCodes.OK);
});


app.post("/create", sValidator("json", createTeamValidator, (result, ctx) => {
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
})


app.delete("/:id", async (ctx) => {
    const id = Number.parseInt(ctx.req.param("id") ?? -1);

    if (id < 0) {
        return ctx.json({ error: "Invalid user id" }, StatusCodes.BAD_REQUEST);
    }

    await db.delete(UsersTable)
        .where(eq(UsersTable.id, id));

    return ctx.json({ data: "User deleted" }, StatusCodes.OK);
});

app.delete("/", async (ctx) => {
    await db.delete(UsersTable);

    return ctx.json({ data: "Deleted all users" }, StatusCodes.OK);
});

export default app;
