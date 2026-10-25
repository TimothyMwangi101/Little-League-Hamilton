import "dotenv/config"
import { relations } from './relations.ts';
import { drizzle } from "drizzle-orm/node-sqlite";
import { count, sql } from 'drizzle-orm';
import * as schema from "./schemas.ts";
import type { z } from "zod";

const DB_NAME = process.env.DB_NAME ?? "llh.db";

export const db = drizzle(DB_NAME, { relations });
if (!db) {
  throw new Error("Failed to connect to the database");
}
