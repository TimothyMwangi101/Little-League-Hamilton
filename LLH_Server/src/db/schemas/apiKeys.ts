import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { UsersTable } from "./users.ts";
import { createInsertSchema } from 'drizzle-orm/zod';

export const ApiKeysTable = sqliteTable("api_keys", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer({ mode: "number" }).notNull()
  .references(() => UsersTable.id, { onDelete: "cascade" }),     // FK to users table
  name: text().notNull(),
  keyHash: text().notNull(),
  keyPrefix: text({ length: 8 }).notNull(),
  createdAt: text().default(sql`(CURRENT_DATE)`),
});

export const createKeySchema = createInsertSchema(ApiKeysTable).pick({ name: true })
