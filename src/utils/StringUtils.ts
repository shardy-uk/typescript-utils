export class StringUtils {
    static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    static capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static truncateWithEllipsis(str: string, length: number): string {
        return str.length > length ? str.substring(0, length - 3) + '...' : str;
    }

    static toTitleCase(str: string): string {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
        });
    }

    static padLeft(str: string, length: number, padChar = ' '): string {
        return String(padChar.repeat(length) + str).slice(-length);
    }

    static padRight(str: string, length: number, padChar = ' '): string {
        return String(str + padChar.repeat(length)).substring(0, length);
    }

    static isNullOrEmpty(str: string | null | undefined): boolean {
        return !str || str.length === 0;
    }

    static isValidEmail(str: string): boolean {
        return this.EMAIL_PATTERN.test(str);
    }

    static replaceAll(str: string, find: string, replace: string): string {
        return str.split(find).join(replace);
    }

    static removeWhitespace(str: string): string {
        return str.replace(/\s+/g, '');
    }

    static stripHtmlTags(str: string): string {
        return str.replace(/<\/?[^>]+(>|$)/g, "");
    }

    static setIfEmpty(value: string | null | undefined, defaultValue: string): string {
        // @ts-ignore - this is stupid, isNullOrEmpty correctly protects against undefined
        return this.isNullOrEmpty(value) ? defaultValue : value;
    }
}
