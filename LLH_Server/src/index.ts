import "dotenv/config";
import { serve } from '@hono/node-server';
import app from "./app.ts";
import { migrate } from 'drizzle-orm/node-sqlite/migrator';
import { db } from './db/db.ts';
import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { serveStatic } from '@hono/node-server/serve-static';

// Railway injects PORT; locally it falls back to SERVER_PORT from your .env
const port = Number.parseInt(process.env.PORT ?? process.env.SERVER_PORT ?? '');
if (Number.isNaN(port))
  throw new Error('PORT / SERVER_PORT not in env');

// serveStatic roots are relative to the working directory (LLH_Server when started via npm)
const UI_DIST = process.env.UI_DIST ?? '../LLH_UI/dist';
migrate(db, {
  migrationsFolder: "./src/db/migrations",
  migrationsSchema: "./src/db/schemas.ts",
});

const server = new Hono()
  .route('/api', app)
  .all('/api/*', (ctx) => ctx.json({ error: 'Not found' }, StatusCodes.NOT_FOUND))
  .use('*', serveStatic({ root: UI_DIST }))
  // SPA fallback so client-side routes survive a refresh
  .get('*', serveStatic({ root: UI_DIST, rewriteRequestPath: () => '/index.html' }));

serve({ fetch: server.fetch, port }, () => {
  console.log(`Server is running on port ${port}`);
});