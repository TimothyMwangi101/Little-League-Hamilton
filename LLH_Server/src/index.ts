import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import userRoutes from './routes/users.ts'
import env from './data/env.ts';

const app = new OpenAPIHono();

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.get('/login', ctx => {
    return ctx.text("Login Page")
});


app.get('/register', ctx => {
    return ctx.text("Register Page")
});


app.route('user', userRoutes);


serve({
  fetch: app.fetch,
  port: env.SERVER_PORT,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
