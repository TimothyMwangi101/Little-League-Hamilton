import { UsersTable } from "../db/schemas.ts";
import type { ApiFail, ApiSuccess} from "../db/schemas.ts";
import { db } from "../db/db.ts";
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { de } from "zod/v4/locales";

const app = new Hono();

app.get("/", async (ctx) => {
  const users = await db.select().from(UsersTable);
  return ctx.json({ data: users } satisfies ApiSuccess<typeof users>, StatusCodes.OK);
});

app.get("/:id", async (ctx) => {
  const id = Number.parseInt(ctx.req.param("id") ?? -1);

  if (id < 0) {
    return ctx.json({ error: "Invalid user id" } satisfies ApiFail, StatusCodes.BAD_REQUEST);
  }

  const [user] = await db.select()
    .from(UsersTable)
    .where(eq(UsersTable.id, id));

  if (!user) {
    return ctx.json({ error: "User not found" } satisfies ApiFail, StatusCodes.NOT_FOUND);
  }

  return ctx.json({ data: user } satisfies ApiSuccess<typeof user>, StatusCodes.OK);
});

app.delete("/:id", async (ctx) => {
  const id = Number.parseInt(ctx.req.param("id") ?? -1);

  if (id < 0) {
    return ctx.json({ error: "Invalid user id" } satisfies ApiFail, StatusCodes.BAD_REQUEST);
  }

  await db.delete(UsersTable)
    .where(eq(UsersTable.id, id));

  return ctx.json({ data: "User deleted" } satisfies ApiSuccess<string>, StatusCodes.OK);
});

app.delete("/", async (ctx) => {
  await db.delete(UsersTable);

  return ctx.json({ data: "Deleted all users" } satisfies ApiSuccess<string>, StatusCodes.OK);
});

export default app;
