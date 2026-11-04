import type { InferRequestType, InferResponseType } from "hono/client";
import type { StatusCodes } from "http-status-codes";
import client from "../../client";

const account = client.account;

export type CreateAccountValues = InferRequestType<typeof account.create.$post>["json"];
export type JoinTeamValues = InferRequestType<typeof account.join.$post>["json"];

export type JoinedAccount = InferResponseType<typeof account.join.$post, StatusCodes.OK>["data"];

// Every route here sits behind your auth middleware. If it rejects a request
// (e.g. an expired token), the body may be plain text, and res.json() would throw.
async function parse<T>(res: { status: number; json(): Promise<T> }): Promise<T | { error: string }> {
  try {
    return await res.json();
  } catch {
    return {
      error: res.status === 401
        ? "Your session has expired. Please log in again."
        : "Unexpected server response.",
    };
  }
}

export async function getAccount() {
  const res = await account.$get();
  return parse(res);
}

export async function createAccount(values: CreateAccountValues) {
  const res = await account.create.$post({ json: values });
  return parse(res);
}

export async function joinTeam(values: JoinTeamValues) {
  const res = await account.join.$post({ json: values });
  return parse(res);
}