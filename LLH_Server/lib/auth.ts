import { Hono } from 'hono'
import {
    initAuthConfig,
    verifyAuth,
    authHandler,
} from '@hono/auth-js'
import { db } from '../src/db/db.ts'
import { createUserSchema, users } from '../src/db/schemas.ts'
import Credentials from "@auth/core/providers/credentials";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto"
import z from 'zod';
import { and, eq } from 'drizzle-orm';


type PasswordHash = {
    salt: string;
    hashKey: string;
};
const keyLen = 64;

const v1Router = new Hono()
    .use(
        '*',
        initAuthConfig((c) => ({
            providers: [
                Credentials({
                    credentials: {
                        email: { label: "Email", type: "email" },
                        password: { label: "Password", type: "password" },
                    }
                }),
            ],
            session: { strategy: 'jwt' },
            async authorize(credentials: any) {
                const parsed = await createUserSchema.safeParseAsync(credentials);

                if (!parsed.success)
                    throw new Error(`Invalid credential: ${z.treeifyError(parsed.error)}`);


                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, parsed.data.email))
                    
                if (!user) return "User does not exist"

                const isValid = await compare(parsed.data.password, user.password)
                if(!isValid) return "Wrong password"

                // Return user object to create a session token
                return user;
            }
        }))
    )
    .use('*', verifyAuth())
    .use('/auth/*', authHandler())

const app = new Hono().route('/api/v1', v1Router)


/**
 * Used to hash a password
 * @param {string} password
 * @returns {string} The salt and hash
 * @see https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k#comment-24a9e
 */
async function hash(password: string): Promise<string> {
    return new Promise((res, rej) => {
        const salt = randomBytes(16).toString("hex");

        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);

            res(JSON.stringify({
                "salt": salt,
                "hashKey": derivedKey.toString("hex")
            } satisfies PasswordHash));
        });
    });
}


async function compare(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((res, rej) => {
        const { salt, hashKey } = JSON.parse(hashedPassword) as PasswordHash;
        const hashBuffer = Buffer.from(hashKey, "hex");
        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);
           
            res(timingSafeEqual(hashBuffer, derivedKey));
        });
    })
}

export default app