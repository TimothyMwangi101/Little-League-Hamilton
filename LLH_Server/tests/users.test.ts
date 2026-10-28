// tests/users.test.ts
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/db/db.ts", async () => {
  // using test db insted of real one
  const { db } = await import("./db_test.ts");
  return { db };
});

import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { UsersTable } from "../src/db/schemas.ts";
import { db } from "./db_test.ts";
import usersApp from "../src/routes/users.ts";

beforeEach(async () => {
  await db.delete(UsersTable);
});

afterAll(() => {
  db.$client.close();
});

describe("users routes", () => {
  it("returns all users", async () => {
    const users = await db
      .insert(UsersTable)
      .values([
        {
          email: "first@example.com",
          password: "first-hash",
          salt: "first-salt",
        },
        {
          email: "string@string.com",
          password: "second-hash",
          salt: "second-salt",
        },
      ])
      .returning();

    const response = await usersApp.request("/");

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({ data: users });
  });

  it("returns one user with only the id and email", async () => {
    const [user] = await db
      .insert(UsersTable)
      .values({ email: "member@example.com", password: "password-hash", salt: "salt" })
      .returning();

    const response = await usersApp.request(`/${user.id}`);

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({
      data: { id: user.id, email: user.email },
    });
  });

  it("rejects a negative user id", async () => {
    const response = await usersApp.request("/-1");

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    await expect(response.json()).resolves.toEqual({ error: "Invalid user id" });
  });

  it("returns not found for a user that does not exist", async () => {
    const response = await usersApp.request("/99999");

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    await expect(response.json()).resolves.toEqual({ error: "User not found" });
  });

  it("deletes the requested user without deleting other users", async () => {
    const users = await db
      .insert(UsersTable)
      .values([
        { email: "keep@example.com", password: "keep-hash", salt: "keep-salt" },
        { email: "remove@example.com", password: "remove-hash", salt: "remove-salt" },
      ])
      .returning();
    const [keepUser, removeUser] = users;

    const response = await usersApp.request(`/${removeUser.id}`, { method: "DELETE" });

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({ data: "User deleted" });
    await expect(
      db.select({ id: UsersTable.id }).from(UsersTable).where(eq(UsersTable.id, keepUser.id)),
    ).resolves.toEqual([{ id: keepUser.id }]);
    await expect(
      db.select({ id: UsersTable.id }).from(UsersTable).where(eq(UsersTable.id, removeUser.id)),
    ).resolves.toEqual([]);
  });

  it("deletes all users", async () => {
    await db.insert(UsersTable).values({
      email: "remove-all@example.com",
      password: "password-hash",
      salt: "salt",
    });

    const response = await usersApp.request("/", { method: "DELETE" });

    expect(response.status).toBe(StatusCodes.OK);
    await expect(response.json()).resolves.toEqual({ data: "Deleted all users" });
    await expect(db.select().from(UsersTable)).resolves.toEqual([]);
  });
});

