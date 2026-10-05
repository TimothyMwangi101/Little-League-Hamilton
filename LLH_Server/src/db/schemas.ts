import { integer, varchar, pgTable, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  userId: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: varchar({ length: 20 }).default(""),
  lastName: varchar({ length: 30 }).default(""),
  email: varchar({ length: 70 }).notNull().unique(),
  password: varchar({ length: 30 }).notNull(),
  createdAt: timestamp().defaultNow(),
});

