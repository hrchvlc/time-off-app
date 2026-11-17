const MILLISECONDS_PER_DAY: number = 86_400_000;
const SUNDAY: number = 0;
const SATURDAY: number = 6;

/**
 * Returns the calendar day ('YYYY-MM-DD') of an ISO date string.
 */
export function toCalendarDay(isoDate: string): string {
  return isoDate.slice(0, 10);
}

/**
 * Returns today's local calendar day ('YYYY-MM-DD').
 */
export function getLocalToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Counts Monday to Friday days between two dates, both inclusive.
 * Works with UTC timestamps, so daylight saving changes do not affect the result.
 */
export function countWorkingDays(startDate: string, endDate: string): number {
  const startTimestamp = toUtcTimestamp(startDate);
  const endTimestamp = toUtcTimestamp(endDate);
  let workingDays = 0;

  for (let currentTimestamp = startTimestamp; currentTimestamp <= endTimestamp; currentTimestamp += MILLISECONDS_PER_DAY) {
    const weekday = new Date(currentTimestamp).getUTCDay();
    if (weekday !== SATURDAY && weekday !== SUNDAY) {
      workingDays++;
    }
  }

  return workingDays;
}

function toUtcTimestamp(isoDate: string): number {
  const [ year, month, day ] = toCalendarDay(isoDate).split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}
