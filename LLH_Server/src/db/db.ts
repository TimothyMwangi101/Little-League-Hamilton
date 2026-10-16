import { relations } from './relations.ts';
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schemas.ts";

import dotenv from "dotenv";
dotenv.config();

const dbName = process.env.DB_NAME;
if (!dbName) {
  throw new Error("DB_NAME is not defined in .env file");
}


export const db = drizzle(dbName, { relations });
if (!db) {
  throw new Error("Failed to connect to the database");
}




export async function createUser( email: string, password: string) {
  const user = await db.insert(schema.usersTable).values({
    email,
    password
  });
  return user;
}

export async function seedDatabase(email = "test@email.com", password = "password123") {
  await db.insert(schema.usersTable).values({
    email,
    password
  });
}

