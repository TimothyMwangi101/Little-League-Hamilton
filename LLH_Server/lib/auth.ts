import { betterAuth } from "better-auth";
import {db} from "../src/db/db.ts";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite"}),
    emailAndPassword: {
        enabled: true,
    }
});