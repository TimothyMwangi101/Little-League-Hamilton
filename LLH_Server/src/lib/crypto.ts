import { scrypt, randomBytes, timingSafeEqual, createHash } from "node:crypto"

const keyLen = 64;
const randomBytesSize = 20;
/**
 * Used to hash and salt a password
 * @param {string} password
 * @returns {string} The salt and hash
 * @see https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k#comment-24a9e
 */
export async function hashPassword(password: string): Promise<string> {
    return new Promise((res, rej) => {
        const salt = randomBytes(randomBytesSize).toString("hex");

        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);

            res(`${salt}:${derivedKey.toString("hex")}`);
        });
    });
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return new Promise((res, rej) => {
        const [salt, hashKey] = hashedPassword.split(":");
        const hashBuffer = Buffer.from(hashKey, "hex");
        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);

            res(timingSafeEqual(hashBuffer, derivedKey));
        });
    })
}

export function generateApiKey() {
    const raw = randomBytes(randomBytesSize).toBase64();
    const hash = createHash("sha256").update(raw).digest("hex");
    const prefix = raw.slice(0, 8);
    return { raw, hash, prefix }
}
