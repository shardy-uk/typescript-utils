import PasswordUtils from '../../src/password/PasswordUtils';
import { VerificationError } from '../../src/errors/Errors';

describe('PasswordUtils', () => {
    describe('Base functionality tests', () => {
        it('should successfully hash a password', async () => {
            const { salt, hashedPassword } = await PasswordUtils.hashPassword('myPassword');

            expect(typeof salt).toBe('string');
            expect(typeof hashedPassword).toBe('string');
        });

        it('should successfully verify a valid password', async () => {
            const { salt, hashedPassword } = await PasswordUtils.hashPassword('myPassword');
            const isValid = await PasswordUtils.verifyPassword(hashedPassword, salt, 'myPassword');

            expect(isValid).toBe(true);
        });

        it('should fail to verify an invalid password', async () => {
            const { salt, hashedPassword } = await PasswordUtils.hashPassword('myPassword');
            const isValid = await PasswordUtils.verifyPassword(hashedPassword, salt, 'wrongPassword');

            expect(isValid).toBe(false);
        });

        it('should throw an error for missing parameters', async () => {
            await expect(PasswordUtils.verifyPassword('', 'someSalt', 'somePassword')).rejects.toThrow(VerificationError);
            await expect(PasswordUtils.verifyPassword('someHash', '', 'somePassword')).rejects.toThrow(VerificationError);
            await expect(PasswordUtils.verifyPassword('someHash', 'someSalt', '')).rejects.toThrow(VerificationError);
        });
    });
});
