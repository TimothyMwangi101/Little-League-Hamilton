import "dotenv/config"
import { relations } from './relations.ts';
import { drizzle } from "drizzle-orm/node-sqlite";

const DB_NAME = process.env.DB_NAME ?? "llh.db";

export const db = drizzle(DB_NAME, { relations });
if (!db) {
  throw new Error("Failed to connect to the database");
}
