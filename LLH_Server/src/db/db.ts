import "dotenv/config"
import { relations } from './relations.ts';
import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from 'drizzle-orm/node-sqlite/migrator';

const DB_NAME = process.env.DB_NAME;
if (!DB_NAME)
  throw new Error('no db name');

const db = drizzle(DB_NAME, { relations });
if (!db)
  throw new Error("Failed to create to the database");

migrate(db, {
  migrationsFolder: "./src/db/migrations",
});

export default db;