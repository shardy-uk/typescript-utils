import crypto from 'crypto';
import util from 'util';
import { HashingError, VerificationError } from '../errors/Errors';  // Import or define these specific errors

const pbkdf2 = util.promisify(crypto.pbkdf2);

export default class PasswordUtils {
    private static readonly SALT_LENGTH = 16;
    private static readonly HASH_ITERATIONS = 5000;
    private static readonly HASH_LENGTH = 64;
    private static readonly DIGEST = 'sha512';
    private static readonly ENCODING: BufferEncoding = 'hex';

    static async hashPassword(password: string): Promise<{ salt: string; hashedPassword: string }> {
        try {
            const salt = crypto.randomBytes(this.SALT_LENGTH).toString(this.ENCODING);
            const derivedKey = await pbkdf2(password, salt, this.HASH_ITERATIONS, this.HASH_LENGTH, this.DIGEST);
            return { salt, hashedPassword: derivedKey.toString(this.ENCODING) };
        } catch (error) {
            throw new HashingError('Failed to hash the password.');
        }
    }

    static async verifyPassword(storedHash: string, storedSalt: string, passwordAttempt: string): Promise<boolean> {
        if (!storedHash || !storedSalt || !passwordAttempt) {
            throw new VerificationError('Invalid parameters for password verification.');
        }

        try {
            const derivedKey = await pbkdf2(passwordAttempt, storedSalt, this.HASH_ITERATIONS, this.HASH_LENGTH, this.DIGEST);
            return storedHash === derivedKey.toString(this.ENCODING);
        } catch (error) {
            throw new VerificationError('Failed to verify the password.');
        }
    }
}
