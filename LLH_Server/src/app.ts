import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import userRoutes from './routes/users.ts'
import authRoutes from './routes/auth.ts'
import accountRoutes from './routes/accounts.ts'
import teamRoutes from './routes/teams.ts'
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import type { ApplyGlobalResponse } from 'hono/client'
import { HTTPException } from 'hono/http-exception';

expand(dotenv.config());

const SERVER_URL = process.env.SERVER_URL;
if (!SERVER_URL)
  throw new Error("server url not in env")

const app = new Hono()
  .route('/user', userRoutes)
  .route('/auth', authRoutes)
  .route('/account', accountRoutes)
  .route('/team', teamRoutes)
  .onError((error, ctx) => {
    if (error instanceof HTTPException)
      if (error.status == 401)
        return ctx.json({ error: error.message }, error.status);

    console.error(error);
    throw error;
  }).notFound((ctx) => {
    return ctx.json({ error: "Not found" }, StatusCodes.NOT_FOUND);
  }).get('/', (ctx) => {
    return ctx.json({ data: "Hello Hono!" }, StatusCodes.OK);
  });

app.post('/seed', async (ctx) => {
  const emails = [
    "alex.smith@example.com",
    "sarah.jones@example.com",
    "david.brown@example.com",
    "emily.davis@example.com",
    "michael.wilson@example.com",
    "jessica.taylor@example.com",
    "robert.anderson@example.com",
    "linda.thomas@example.com",
    "james.jackson@example.com",
    "patricia.white@example.com"
  ]
  const passwords = [
    "Xk9#mP2!qZ",
    "T7v*Ld8$wR",
    "B3n@Kp5%yH",
    "F6c!Js9&xV",
    "H2w#Rt4*mN",
    "P8k$Df7!bC",
    "G5m%Gh3#zX",
    "L4q&Jk2*vT",
    "R9v!Bn6$wP",
    "M1h#Xz8%dL"
  ]

  const requests = emails.map((email, i) => {
    const password = passwords[i];
    return app.fetch(new Request(SERVER_URL + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }));
  });

  const responses = await Promise.all(requests);
  const results = await Promise.all(responses.map(res => res.json()))

  return ctx.json({ data: results }, StatusCodes.CREATED);
});

export type AppType = ApplyGlobalResponse<typeof app, {
  500: { json: { error: string } }
}>;
export default app;