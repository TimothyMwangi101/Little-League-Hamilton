import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from 'drizzle-orm/zod';

export const usersTable = sqliteTable("users", {
  userId: integer({ mode: "number"}).primaryKey( {autoIncrement: true  }),
  email: text({ length: 70 }).notNull().unique(),
  password: text({ length: 30 }).notNull(),
  createdAt: integer({ mode: "timestamp" }).default(new Date()),
});


export const createUserSchema = createInsertSchema(usersTable);