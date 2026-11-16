import { integer, text, sqliteTable, } from "drizzle-orm/sqlite-core";

export const UsersTable = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  salt: text().notNull(),
});

