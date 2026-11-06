# Little League Hamilton Server

The Little League Hamilton server is a Hono-based API running on Node.js. It provides user, authentication, account, and team routes, uses SQLite through Drizzle ORM, and can serve the built UI as a single-page application.

## Getting started

Install dependancies from the root dir, not this dir, then start the server:

```sh
npm run dev
```

Create a `.env` file in `LLH_Server` with the required settings:

```dotenv
DB_NAME=llh.db
AUTH_SECRET=replace-with-a-private-secret
SERVER_PORT=3000
```

`PORT` can be used instead of `SERVER_PORT`; when both are set, `PORT` takes precedence. When deployed on [railway](https://railway.com), `PORT` is automatically added to the env and is used to listen to request. The server exits during startup if it cannot find a port, database name, or authentication secret.

Start the server in development mode:

```sh
npm run dev
```

The development command watches `src/index.ts` and restarts the server when source files change. On startup, the server applies the Drizzle migrations from `src/db/migrations`.

To build and run the compiled server:

```sh
npm run build
npm start
```

The API is mounted at `/api`, with route groups under `/api/user`, `/api/auth`, `/api/account`, and `/api/team`. The server also serves the UI build from `../LLH_UI/dist` by default, with a fallback to `index.html` for client-side routes. Set `UI_DIST` to use a different UI build directory. These paths are resolved relative to the `LLH_Server` working directory, so run the commands above from that directory.

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the server in watch mode. |
| `npm run build` | Compile the TypeScript source into `dist`. |
| `npm start` | Run the compiled server from `dist/index.js`. |
| `npm test` | Run the test suite once with Vitest. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run lint` | Check the code with Oxlint. |
| `npm run lint:fix` | Apply automatic Oxlint fixes. |

## Project structure

| Directory | Description |
| --- | --- |
| `src/` | Server application source code. |
| `src/db/` | SQLite connection, Drizzle table definitions and relations, and database migrations. |
| `src/db/schemas/` | Table and validation schemas grouped by entity, such as users, accounts, and teams. |
| `src/db/migrations/` | SQL migrations and Drizzle migration metadata, applied when the server starts. |
| `src/lib/` | Shared utilities, including password hashing helpers. |
| `src/middleware/` | Request middleware and authentication helpers, including JWT handling. |
| `src/routes/` | Hono route handlers for users, authentication, accounts, and teams. |
| `tests/` | Vitest tests for authentication, database behavior, and users. |

`src/index.ts` configures the port, applies database migrations, mounts the API and static UI handlers, and starts the Node.js server. `src/app.ts` assembles the API route groups.
