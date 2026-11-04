import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { serve } from '@hono/node-server';
import app from "./app.ts";

expand(dotenv.config());

const SERVER_PORT = process.env.SERVER_PORT;
if (!SERVER_PORT)
  throw new Error("port not in env")

const SERVER_URL = process.env.SERVER_URL;
if (!SERVER_URL)
  throw new Error("server url not in env")

serve({
    fetch: app.fetch,
    port: Number.parseInt(SERVER_PORT, 10) 
  }, () => {
    console.log(`Server is running on ${SERVER_URL}`);
  }
);