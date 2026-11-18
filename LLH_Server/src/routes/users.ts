import { UsersTable } from "../db/schemas.ts";
import db from "../db/db.ts";
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { userQuery } from "../../../LLH_Shared/validators.ts";

const app = new Hono()
  .query("/", sValidator("json", userQuery), async (ctx) => {
    const { id, email } = ctx.req.valid("json");

    if (!id && !email)
      return ctx.json({ error: "Need either email or id to query" }, StatusCodes.BAD_REQUEST);

    let user: { id: number, email: string };

    if (id) {
      [user] = await db
        .select({
          id: UsersTable.id,
          email: UsersTable.email
        })
        .from(UsersTable)
        .where(eq(UsersTable.id, id));
      if (!user)
        return ctx.json({ error: "User not found, double check the user id" }, StatusCodes.NOT_FOUND);
    } 
    else if (email) {
      [user] = await db
        .select({
          id: UsersTable.id,
          email: UsersTable.email
        })
        .from(UsersTable)
        .where(eq(UsersTable.email, email));

      if (!user)
        return ctx.json({ error: "User not found, double check the email" }, StatusCodes.NOT_FOUND);
    } 
    else {
      console.error("no email, id", id, email)
      return ctx.json({ error: "User not found" }, StatusCodes.NOT_FOUND);
    }

    return ctx.json({ data: user }, StatusCodes.OK);
  })
  .delete("/:id", async (ctx) => {
    const id = Number.parseInt(ctx.req.param("id"));

    if (Number.isNaN(id) || id < 0)
      return ctx.json({ error: "Invalid user id" }, StatusCodes.BAD_REQUEST);

    await db.delete(UsersTable)
      .where(eq(UsersTable.id, id));

    return ctx.json({ data: "User deleted" }, StatusCodes.OK);
  });

export default app;
