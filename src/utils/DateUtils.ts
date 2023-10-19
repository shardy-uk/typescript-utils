export class DateUtils {

    /**
     * Returns the current date and time in ISO format
     */
    static nowISO(): string {
        return new Date().toISOString();
    }

    /**
     * Converts a Date object to an ISO format string
     * @param {Date} date - The date object
     */
    static toISO(date: Date): string {
        return date.toISOString();
    }

    /**
     * Parses an ISO format string to a Date object
     * @param {string} str - The ISO string
     */
    static fromISO(str: string): Date {
        return new Date(str);
    }

    /**
     * Adds days to a Date object and returns a new Date
     * @param {Date} date - The original date
     * @param {number} days - Number of days to add
     */
    static addDays(date: Date, days: number): Date {
        const newDate = new Date(date);
        newDate.setDate(date.getDate() + days);
        return newDate;
    }

    /**
     * Adds hours to a Date object and returns a new Date
     * @param {Date} date - The original date
     * @param {number} hours - Number of hours to add
     */
    static addHours(date: Date, hours: number): Date {
        const newDate = new Date(date);
        newDate.setHours(date.getHours() + hours);
        return newDate;
    }

    /**
     * Adds minutes to a Date object and returns a new Date
     * @param {Date} date - The original date
     * @param {number} minutes - Number of minutes to add
     */
    static addMinutes(date: Date, minutes: number): Date {
        const newDate = new Date(date);
        newDate.setMinutes(date.getMinutes() + minutes);
        return newDate;
    }

    /**
     * Checks if a date is in the past
     * @param {Date} date - The date to check
     */
    static isPast(date: Date): boolean {
        return new Date() > date;
    }

    /**
     * Checks if a date is in the future
     * @param {Date} date - The date to check
     */
    static isFuture(date: Date): boolean {
        return new Date() < date;
    }

    /**
     * Gets the difference in days between two dates
     * @param {Date} date1 - The first date
     * @param {Date} date2 - The second date
     */
    static diffInDays(date1: Date, date2: Date): number {
        const diffInTime = date2.getTime() - date1.getTime();
        return diffInTime / (1000 * 3600 * 24);
    }
}
