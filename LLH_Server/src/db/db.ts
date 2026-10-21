import "dotenv/config"
import { relations } from './relations.ts';
import { drizzle } from "drizzle-orm/node-sqlite";
import * as schema from "./schemas.ts";
import type { z } from "zod";

const DB_NAME = process.env.DB_NAME ?? "llh.db";

export const db = drizzle(DB_NAME, { relations });
if (!db) {
  throw new Error("Failed to connect to the database");
}

export async function createUser(user: z.infer<typeof schema.createUserSchema>, returning = false) {
  if (returning)
    return await db.insert(schema.users).values(user).returning()
  await db.insert(schema.users).values(user);
}