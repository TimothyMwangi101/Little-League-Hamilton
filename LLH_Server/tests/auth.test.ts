import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/db/db.ts", async () => {
  const { db } = await import("./db_test.ts");
  return { db };
});

import { AccountsTable, TeamsTable, UsersTable } from "../src/db/schemas.ts";
import { db } from "./db_test.ts";

import authApp from "../src/routes/auth.ts";
import accountApp from "../src/routes/accounts.ts";

beforeAll(async () => {
  vi.stubEnv("AUTH_SECRET", "test-auth-secret-that-is-long-enough");
  vi.stubEnv("SERVER_URL", "http://localhost");
});

beforeEach(async () => {
  await db.delete(AccountsTable);
  await db.delete(TeamsTable);
  await db.delete(UsersTable);
});

afterAll(() => {
  db.$client.close();
  vi.unstubAllEnvs();
});

const jsonRequest = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

describe("auth routes", () => {
  it("rejects a registration request with an invalid body", async () => {
    const response = await authApp.request(
      "/register",
      jsonRequest({ email: "nop@email.com" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid request body" });
  });

  it("registers a user and creates their account", async () => {
    const response = await authApp.request(
      "/register",
      jsonRequest({ email: "string@email.com", password: "passphrase" }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ data: null });
    await expect(db.select().from(UsersTable)).resolves.toHaveLength(1);
    await expect(db.select().from(AccountsTable)).resolves.toHaveLength(1);
  });

  it("does not create a duplicate user", async () => {
    const request = jsonRequest({ email: "existing@email.com", password: "passphrase" });

    expect((await authApp.request("/register", request)).status).toBe(201);
    const duplicateResponse = await authApp.request("/register", request);

    expect(duplicateResponse.status).toBe(200);
    await expect(db.select().from(UsersTable)).resolves.toHaveLength(1);
    await expect(db.select().from(AccountsTable)).resolves.toHaveLength(1);
  });

  it("logs in a registered user and sets an authentication cookie", async () => {
    await authApp.request(
      "/register",
      jsonRequest({ email: "login@email.com", password: "passphrase" }),
    );

    const response = await authApp.request(
      "/login",
      jsonRequest({ email: "login@email.com", password: "passphrase" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { userId: expect.any(Number) },
    });
    expect(response.headers.get("set-cookie")).toContain("token=");
  });

  it.each([
    ["unknown email", "unknown@email.com", "passphrase"],
    ["incorrect password", "known@email.com", "wrong-password"],
  ])("rejects login with an %s", async (_caseName, email, password) => {
    if (email === "known@email.com") {
      await authApp.request(
        "/register",
        jsonRequest({ email, password: "passphrase" }),
      );
    }

    const response = await authApp.request(
      "/login",
      jsonRequest({ email, password }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid email or password",
    });
  });

  it("resets a registered user's password", async () => {
    await authApp.request(
      "/register",
      jsonRequest({ email: "reset@email.com", password: "old-password" }),
    );

    const response = await authApp.request(
      "/reset-password",
      jsonRequest({ email: "reset@email.com", newPassword: "new-password" }),
    );
    const oldPasswordResponse = await authApp.request(
      "/login",
      jsonRequest({ email: "reset@email.com", password: "old-password" }),
    );
    const newPasswordResponse = await authApp.request(
      "/login",
      jsonRequest({ email: "reset@email.com", password: "new-password" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: null });
    expect(oldPasswordResponse.status).toBe(401);
    expect(newPasswordResponse.status).toBe(200);
  });

  it("rejects a password reset for an unknown email", async () => {
    const response = await authApp.request(
      "/reset-password",
      jsonRequest({ email: "unknown@email.com", newPassword: "new-password" }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid email or password",
    });
  });

  it("logs out by clearing the authentication cookie", async () => {
    const response = await authApp.request("/logout", { method: "POST" });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: null });
    expect(response.headers.get("set-cookie")).toContain("token=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("updates the signed-in user's account fields", async () => {
    const credentials = { email: "account@email.com", password: "passphrase" };
    await authApp.request("/register", jsonRequest(credentials));
    const login = await authApp.request("/login", jsonRequest(credentials));
    const cookie = login.headers.get("set-cookie")?.split(";")[0];

    const response = await accountApp.request("/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie ?? "",
      },
      body: JSON.stringify({
        firstName: "  Alex ",
        lastName: "Johnson",
        region: "Lower Hamilton",
        prefers: ["Baseball", "Soccer"],
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        AccountsTable: {
          firstName: "Alex",
          lastName: "Johnson",
          region: "Lower Hamilton",
          prefers: ["Baseball", "Soccer"],
        },
        email: credentials.email,
      },
    });
  });

  it("rejects invalid account updates without changing the account", async () => {
    const credentials = { email: "invalid-account@email.com", password: "passphrase" };
    await authApp.request("/register", jsonRequest(credentials));
    const login = await authApp.request("/login", jsonRequest(credentials));
    const cookie = login.headers.get("set-cookie")?.split(";")[0];

    const response = await accountApp.request("/", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie ?? "",
      },
      body: JSON.stringify({ region: "Toronto" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid request body" });
    await expect(db.select().from(AccountsTable)).resolves.toMatchObject([
      { region: null },
    ]);
  });
});
