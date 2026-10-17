import "dotenv/config";
import z from "zod";

const envSchema = z.object({
    DB_NAME: z.string().nonempty(),
    BETTER_AUTH_URL: z.url().nonempty(),
    AUTH_SECRET: z.string().nonempty(),
    SERVER_PORT: z.coerce.number().int().positive(),
});

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success) {
    throw new Error(`Invalid env: ${z.treeifyError(parsedEnv.error)}`);
}
export const env =  parsedEnv.data;