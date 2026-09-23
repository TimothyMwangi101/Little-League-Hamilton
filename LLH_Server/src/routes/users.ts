import { sValidator } from "@hono/standard-validator";
import { OpenAPIHono } from "@hono/zod-openapi";
import z, { email, string, success, uuid } from "zod";

const app = new OpenAPIHono();

const createUserSchema = z.object({
  userId: string(),
  name: string(),
  email: string(),
});

const users = [
  {
    userId: "1",
    name: "Tim",
    email: "email@gmail.com",
  },
  {
    userId: "2",
    name: "Tom",
    email: "gmail@email.com",
  },
];

app.get("/", (ctx) => {
  if (users === null || users.length == 0) {
    ctx.json({ ok: "No users" }, 200);
  }
  return ctx.json(users, 200);
});

app.get("/:userId", (ctx) => {
  const userId = ctx.req.param("userId");

  const user = users.find((u) => u.userId === userId);
  if (user === null) {
    return ctx.json({ error: "User not found" }, 404);
  }

  return ctx.json(user);
});

app.post("/", sValidator("json", createUserSchema), (ctx) => {
  const user = ctx.req.valid("json");
  users.push(user);

  return ctx.json(user, 201);
});

app.delete("/:userId", (ctx) => {
  const userId = ctx.req.param("userId");

  const useridx = users.findIndex((u) => u.userId === userId);
  const user = users.splice(useridx, 1);

  return ctx.json(user, 200);
});

export default app;
