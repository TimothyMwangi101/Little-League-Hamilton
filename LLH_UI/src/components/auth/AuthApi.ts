import type { ApiResponse, NewUser, resetPasswordValidator } from "@backend/db/schemas";
import type z from "zod";
import { StatusCodes,  } from 'http-status-codes';

export type Values = NewUser | z.infer<typeof resetPasswordValidator>

export type Endpoint = "register" | "login" | "reset-password";

export default async function authFetch<T = unknown>(endpoint: Endpoint, values: Values): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (response.status == StatusCodes.UNAUTHORIZED) {
      return { error : "Try registering first" }
    }

    if (!response.ok) {
      return { error : "Network error." }
    }

    return await response.json();

  } catch (err) {
    console.error(err)
    return { error: "Unable to reach server" }
  }
}