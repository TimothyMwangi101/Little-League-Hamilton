import type { InferRequestType, InferResponseType } from "hono/client";
import client from "../../client";
import type { StatusCodes } from "http-status-codes";

const auth = client.auth;
export type RegisterValues = InferRequestType<typeof auth.register.$post>["json"];
export type LoginValues = InferRequestType<typeof auth.login.$post>["json"];
export type ResetPasswordValues = InferRequestType<typeof auth.reset_password.$post>["json"];
export type Account = InferResponseType<typeof auth.login.$post, StatusCodes.OK>["data"];
export type Endpoint = "login" | "register" | "reset_password";

export async function register(values: RegisterValues) {
  const res = await auth.register.$post({ json: values });
  return res.json();
}

export async function login(values: LoginValues) {
  const res = await auth.login.$post({ json: values });
  return res.json(); 
}

export async function resetPassword(values: ResetPasswordValues) {
  const res = await auth.reset_password.$post({ json: values });
  return res.json();
}

export async function logout() {
  const res = await auth.logout.$post();
  return res.json();
}