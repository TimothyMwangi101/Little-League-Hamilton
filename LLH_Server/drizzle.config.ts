import { defineConfig } from "drizzle-kit";
import "dotenv"
import { config } from "dotenv";
config();


const DB_NAME = process.env.DB_NAME;
// const DB_NAME = "llh_test.db";
if(!DB_NAME)
  throw new Error("no db name in env")

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schemas.ts",
  dialect: "sqlite",
  verbose: true,
  dbCredentials: {
    url: DB_NAME,
  },
});
