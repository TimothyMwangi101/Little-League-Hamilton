import { relations } from '../src/db/relations.ts';
import { drizzle } from "drizzle-orm/node-sqlite";

const DB_NAME = "llh_test.db";

export const db = drizzle(DB_NAME, { relations });
if (!db) {
  throw new Error("Failed to connect to the database");
}
