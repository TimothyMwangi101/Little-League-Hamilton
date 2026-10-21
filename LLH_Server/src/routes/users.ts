import { UsersTable } from "../db/schemas.ts";
import { db } from "../db/db.ts";
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (ctx) => {
  return ctx.json({ data: await db.select().from(UsersTable) }, StatusCodes.OK);
});

app.get("/:id", async (ctx) => {
  const id = Number.parseInt(ctx.req.param("id") ?? -1);

  if (id < 0) {
    return ctx.json({ error: "Invalid user id" }, StatusCodes.BAD_REQUEST);
  }

  const [user] = await db.select()
    .from(UsersTable)
    .where(eq(UsersTable.id, id));

  if (!user) {
    return ctx.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
  }

  return ctx.json({ data: user }, StatusCodes.OK);
});


app.delete("/:id", async (ctx) => {
  const id = Number.parseInt(ctx.req.param("id") ?? -1);

  if (id < 0) {
    return ctx.json({ error: "Invalid user id" }, StatusCodes.BAD_REQUEST);
  }

  await db.delete(UsersTable)
    .where(eq(UsersTable.id, id));

  return ctx.json({ data: "User deleted" }, StatusCodes.OK);
});

export default app;
