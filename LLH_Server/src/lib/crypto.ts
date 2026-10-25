import { scrypt, randomBytes, timingSafeEqual, createHash } from "node:crypto"

const keyLen = 64;
const randomBytesSize = 20;

type SecurePassword = {
    salt: string;
    hashedPassword: string;
}

/**
 * Used to hash and salt a password
 * @param {string} password
 * @returns {string} The salt and hash
 * @see https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k#comment-24a9e
 */
export async function hashPassword(password: string): Promise<SecurePassword> {
    return new Promise((res, rej) => {
        const salt = randomBytes(randomBytesSize).toString("hex");

        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);

            res({ salt: salt, hashedPassword: derivedKey.toString("hex")});
        });
    });
}

export async function comparePasswords(password: string, securePassword: SecurePassword): Promise<boolean> {
    return new Promise((res, rej) => {
        const { salt, hashedPassword } = securePassword;
        const hashBuffer = Buffer.from(hashedPassword, "hex");
        scrypt(password, salt, keyLen, (err, derivedKey) => {
            if (err) return rej(err);

            res(timingSafeEqual(hashBuffer, derivedKey));
        });
    })
}
