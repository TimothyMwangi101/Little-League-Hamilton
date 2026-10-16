import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import userRoutes from './routes/users.ts'
import { seedDatabase } from './db/db.ts';
import  { env }  from '../lib/env.ts';

const app = new OpenAPIHono();

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.get('/register', async (ctx) => {
  await seedDatabase();
  return ctx.text("Seeded Database")
});


app.route('user', userRoutes);


serve({
  fetch: app.fetch,
  port: env.SERVER_PORT,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
