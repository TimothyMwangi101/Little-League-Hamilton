export * from "./schemas/users.ts";
export * from "./schemas/apiKeys.ts"

export type ApiSuccess<T> = {
    data: T,
    msg?: string,
};

export type ApiFail = { error: string };

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFail;