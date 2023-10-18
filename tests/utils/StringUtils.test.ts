import { StringUtils } from '../../src/utils/StringUtils';  // Change the import path to wherever your StringUtils class resides.

describe('StringUtils', () => {
    it('should capitalize the first letter of a string', () => {
        expect(StringUtils.capitalizeFirstLetter('hello')).toBe('Hello');
    });

    it('should truncate a string with an ellipsis', () => {
        expect(StringUtils.truncateWithEllipsis('This is a long string', 10)).toBe('This is...');
    });

    it('should convert a string to title case', () => {
        expect(StringUtils.toTitleCase('hello world')).toBe('Hello World');
    });

    it('should pad a string to the left', () => {
        expect(StringUtils.padLeft('hello', 10, '-')).toBe('-----hello');
    });

    it('should pad a string to the right', () => {
        expect(StringUtils.padRight('hello', 10, '-')).toBe('hello-----');
    });

    it('should check if a string is null or empty', () => {
        expect(StringUtils.isNullOrEmpty('')).toBe(true);
        expect(StringUtils.isNullOrEmpty(null)).toBe(true);
        expect(StringUtils.isNullOrEmpty(undefined)).toBe(true);
        expect(StringUtils.isNullOrEmpty('hello')).toBe(false);
    });

    it('should validate an email address', () => {
        expect(StringUtils.isValidEmail('test@email.com')).toBe(true);
        expect(StringUtils.isValidEmail('invalid-email')).toBe(false);
    });

    it('should replace all occurrences of a substring', () => {
        expect(StringUtils.replaceAll('hello world world', 'world', 'everyone')).toBe('hello everyone everyone');
    });

    it('should remove all whitespace from a string', () => {
        expect(StringUtils.removeWhitespace('  hello world  ')).toBe('helloworld');
    });

    it('should strip HTML tags from a string', () => {
        expect(StringUtils.stripHtmlTags('<p>Hello World</p>')).toBe('Hello World');
    });

    it('should set a default value if the string is empty', () => {
        expect(StringUtils.setIfEmpty('', 'default')).toBe('default');
        expect(StringUtils.setIfEmpty(null, 'default')).toBe('default');
        expect(StringUtils.setIfEmpty(undefined, 'default')).toBe('default');
        expect(StringUtils.setIfEmpty('hello', 'default')).toBe('hello');
    });
});
