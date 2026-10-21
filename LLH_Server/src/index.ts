import "dotenv/config"
import { serve } from '@hono/node-server';
import userRoutes from './routes/users.ts'
import authRoutes from './routes/auth.ts'
import { db } from "./db/db.ts"
import { UsersTable } from "./db/schemas.ts";
import { StatusCodes } from 'http-status-codes';
import { Hono } from "hono";

const app = new Hono();

app.route('user', userRoutes);
app.route('auth', authRoutes)



app.get('/', (c) => {
  return c.text('Hello Hono!')
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

  try {
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const password = passwords[i];
      await db.insert(UsersTable).values({ email, password })  
    }

    return ctx.json("Seeded Database", StatusCodes.CREATED)

  } catch (error) {
    return ctx.json(error, StatusCodes.INTERNAL_SERVER_ERROR)
  }

});


const SERVER_PORT = process.env.SERVER_PORT;
if (!SERVER_PORT)
  throw new Error("pornt not in env")

serve({
  fetch: app.fetch,
  port: (SERVER_PORT as unknown) as number,
}, () => {
  console.log(`Server is running on http://localhost:${SERVER_PORT}`)
})
