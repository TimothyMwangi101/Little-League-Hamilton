import { sValidator } from "@hono/standard-validator";
import { OpenAPIHono } from "@hono/zod-openapi";
import { decodeBase64 } from "hono/utils/encode";
import { users, createUserSchema } from "../db/schemas.ts";
import { db } from "../db/db.ts";
import { eq, lt, gte, ne } from 'drizzle-orm';

const app = new OpenAPIHono();


app.get("/", async (ctx) => {
  const allUsers = await db.select().from(users).all();
  if (allUsers.length === 0) {
    ctx.json({ ok: "No users" }, 200);
  }
  return ctx.json(allUsers, 200);
});

app.get("/:userId", async (ctx) => {
  const userId = parseInt(ctx.req.param("userId"));

  const user = await db.select({
    email: users.email,
    createdAt: users.createdAt
  })
    .from(users)
    .where(eq(users.userId, userId))
    .get();


  if (user === null) {
    return ctx.json({ error: "User not found" }, 404);
  }

  return ctx.json(user);
});

// app.post("/", sValidator("json", createUserSchema), (ctx) => {
//   const user = ctx.req.valid("json");
//   users.push(user);

//   return ctx.json(user, 201);
// });

// app.delete("/:userId", (ctx) => {
//   const userId = ctx.req.param("userId");

//   const useridx = users.findIndex((u) => u.userId === userId);
//   const user = users.splice(useridx, 1);

//   return ctx.json(user, 200);
// });

export default app;
