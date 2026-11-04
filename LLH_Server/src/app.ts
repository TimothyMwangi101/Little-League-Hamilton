import userRoutes from './routes/users.ts'
import authRoutes from './routes/auth.ts'
import accountRoutes from './routes/accounts.ts'
import teamRoutes from './routes/teams.ts'
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";
import type { ApplyGlobalResponse } from 'hono/client'
import { HTTPException } from 'hono/http-exception';

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


export type AppType = ApplyGlobalResponse<typeof app, {
  500: { json: { error: string } }
}>;
export default app;