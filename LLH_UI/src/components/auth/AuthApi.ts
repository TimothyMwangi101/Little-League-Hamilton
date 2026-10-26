import type { ApiResponse, AuthUser, resetPasswordValidator } from "@backend/db/schemas";
import type z from "zod";

export type Values = AuthUser | z.infer<typeof resetPasswordValidator>

export type Endpoint = "register" | "login" | "reset-password";

export default async function authFetch<T = unknown>(endpoint: Endpoint, values: Values): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const result: ApiResponse<T> = await response.json()

    if ("error" in result) {
      return result
    }

    if (!response.ok) {
      return { error: "Request failed. Please try again." }
    }

    return result

  } catch (err) {
    console.error(err)
    return { error: "Unable to reach server" }
  }
}