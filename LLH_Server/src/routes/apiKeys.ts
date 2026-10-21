import { sValidator } from "@hono/standard-validator";
import { UsersTable, createUserSchema } from "../db/schemas.ts";
import { db } from "../db/db.ts";
import { eq } from 'drizzle-orm';
import { basicAuth } from "hono/basic-auth";
import { compare, hashPassword } from "../lib/auth.ts";
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (ctx) => {
  return ctx.json({ users: await db.select().from(UsersTable) }, StatusCodes.OK);
});

app.get("/:userId", async (ctx) => {
  const userId = parseInt(ctx.req.param("userId"));

  const user = await db.select()
    .from(UsersTable)
    .where(eq(UsersTable.id, userId))
    .get();

  if (!user) {
    return ctx.json({ error: "User not found" }, 404);
  }

  return ctx.json(user);
});



app.delete("/:userId", async (ctx) => {
  try {
    const userId = ctx.req.param("id");

    if (!userId)
      return ctx.json({error: "undefined user id"}, StatusCodes.BAD_REQUEST)
    
    await db.delete(UsersTable)
    .where(eq(UsersTable.id, (userId as unknown) as number));

    return ctx.json(StatusCodes.OK);
  } catch(err) {
    return ctx.json(StatusCodes.BAD_REQUEST)
  }
});

export default app;
