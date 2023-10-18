import crypto from "crypto";
import {CredentialsError} from "../errors/Errors";

export default class PasswordUtils {
    private static SALT_LENGTH = 16;
    private static HASH_ITERATIONS: number = 5000;
    private static HASH_LENGTH = 64;
    private static DIGEST = 'sha512';
    private static ENCODING = 'hex';

    static async hashPassword(password: string): Promise<{ salt: string, hashedPassword: string }> {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(this.SALT_LENGTH).toString(this.ENCODING);
            crypto.pbkdf2(password, salt, this.HASH_ITERATIONS, this.HASH_LENGTH, this.DIGEST, (err, derivedKey) => {
                if (err) reject(new CredentialsError('Failed to hash the password.'));
                resolve({salt, hashedPassword: derivedKey.toString(this.ENCODING)});
            });
        });
    }

    static async verifyPassword(storedHash: string, storedSalt: string, passwordAttempt: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(passwordAttempt, storedSalt, this.HASH_ITERATIONS, this.HASH_LENGTH, this.DIGEST, (err, derivedKey) => {
                if (err) reject(new CredentialsError('Failed to verify the password.'));
                resolve(storedHash === derivedKey.toString(this.ENCODING));
            });
        });
    }
}

