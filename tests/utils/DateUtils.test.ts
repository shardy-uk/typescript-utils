import {DateUtils} from '../../src/utils/DateUtils';

describe('DateUtils', () => {

    describe('nowISO', () => {
        it('should return the current date and time in ISO format', () => {
            const now = new Date().toISOString();
            const result = DateUtils.nowISO();
            expect(result).toEqual(now);
        });
    });

    describe('toISO', () => {
        it('should convert a Date object to an ISO string', () => {
            const date = new Date('2022-01-01T00:00:00.000Z');
            const result = DateUtils.toISO(date);
            expect(result).toEqual('2022-01-01T00:00:00.000Z');
        });
    });

    describe('fromISO', () => {
        it('should convert an ISO string to a Date object', () => {
            const isoString = '2022-01-01T00:00:00.000Z';
            const result = DateUtils.fromISO(isoString);
            expect(result.toISOString()).toEqual(isoString);
        });
    });

    describe('addDays', () => {
        it('should add days to a Date object', () => {
            const date = new Date('2022-01-01T00:00:00.000Z');
            const result = DateUtils.addDays(date, 1);
            expect(result.toISOString()).toEqual('2022-01-02T00:00:00.000Z');
        });
    });

    describe('addHours', () => {
        it('should add hours to a Date object', () => {
            const date = new Date('2022-01-01T00:00:00.000Z');
            const result = DateUtils.addHours(date, 1);
            expect(result.toISOString()).toEqual('2022-01-01T01:00:00.000Z');
        });
    });

    describe('addMinutes', () => {
        it('should add minutes to a Date object', () => {
            const date = new Date('2022-01-01T00:00:00.000Z');
            const result = DateUtils.addMinutes(date, 1);
            expect(result.toISOString()).toEqual('2022-01-01T00:01:00.000Z');
        });
    });

    describe('isPast', () => {
        it('should return true if the date is in the past', () => {
            const date = new Date('2000-01-01T00:00:00.000Z');
            const result = DateUtils.isPast(date);
            expect(result).toBeTruthy();
        });

        it('should return false if the date is in the future', () => {
            const date = new Date('3000-01-01T00:00:00.000Z');
            const result = DateUtils.isPast(date);
            expect(result).toBeFalsy();
        });
    });

    describe('isFuture', () => {
        it('should return true if the date is in the future', () => {
            const date = new Date('3000-01-01T00:00:00.000Z');
            const result = DateUtils.isFuture(date);
            expect(result).toBeTruthy();
        });

        it('should return false if the date is in the past', () => {
            const date = new Date('2000-01-01T00:00:00.000Z');
            const result = DateUtils.isFuture(date);
            expect(result).toBeFalsy();
        });
    });

    describe('diffInDays', () => {
        it('should return the difference in days between two dates', () => {
            const date1 = new Date('2022-01-01T00:00:00.000Z');
            const date2 = new Date('2022-01-02T00:00:00.000Z');
            const result = DateUtils.diffInDays(date1, date2);
            expect(result).toEqual(1);
        });
    });
});
