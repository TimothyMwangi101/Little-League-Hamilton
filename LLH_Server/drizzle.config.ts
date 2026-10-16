import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas.ts",
  dialect: "sqlite",
  verbose: true,
  dbCredentials: {
    url: process.env.DB_NAME!,
  },
});
