import { countWorkingDays, getLocalToday, toCalendarDay } from './date.util';

describe('date.util', () => {
  describe('toCalendarDay', () => {
    it('returns the date part of a date picker value', () => {
      expect(toCalendarDay('2026-11-20T14:23:00')).toBe('2026-11-20');
    });

    it('returns the date part of a UTC ISO string', () => {
      expect(toCalendarDay('2026-12-21T09:15:00.000Z')).toBe('2026-12-21');
    });

    it('returns a calendar day unchanged', () => {
      expect(toCalendarDay('2026-11-20')).toBe('2026-11-20');
    });
  });

  describe('getLocalToday', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns the local date as YYYY-MM-DD', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 10, 16, 23, 59));

      expect(getLocalToday()).toBe('2026-11-16');
    });

    it('pads single-digit months and days with a zero', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 0, 5, 8, 0));

      expect(getLocalToday()).toBe('2026-01-05');
    });
  });

  describe('countWorkingDays', () => {
    it('counts a single weekday as one day', () => {
      expect(countWorkingDays('2026-11-18', '2026-11-18')).toBe(1);
    });

    it('counts Monday to Friday as five days', () => {
      expect(countWorkingDays('2026-11-16', '2026-11-20')).toBe(5);
    });

    it('skips the weekend between Friday and Monday', () => {
      expect(countWorkingDays('2026-11-20', '2026-11-23')).toBe(2);
    });

    it('returns zero for a weekend-only range', () => {
      expect(countWorkingDays('2026-11-21', '2026-11-22')).toBe(0);
    });

    it('counts two full weeks as ten days', () => {
      expect(countWorkingDays('2026-11-16', '2026-11-29')).toBe(10);
    });

    it('ignores the time part of date picker values', () => {
      expect(countWorkingDays('2026-11-20T23:30:00', '2026-11-23T00:15:00')).toBe(2);
    });

    it('is not affected by daylight saving time changes', () => {
      expect(countWorkingDays('2026-03-27', '2026-03-30')).toBe(2);
      expect(countWorkingDays('2026-10-23', '2026-10-26')).toBe(2);
    });

    it('returns zero when the end date is before the start date', () => {
      expect(countWorkingDays('2026-11-20', '2026-11-16')).toBe(0);
    });
  });
});
