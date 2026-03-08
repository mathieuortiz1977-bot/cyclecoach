/**
 * Timezone Utility Library
 * All dates in CycleCoach use America/Bogota (UTC-5)
 * 
 * RULE: Always use these functions for date operations
 * NEVER use: new Date(), toLocaleDateString(), toISOString() directly
 */

const TIMEZONE = "America/Bogota";
const UTC_OFFSET_MS = -5 * 60 * 60 * 1000; // UTC-5

/**
 * Get current date/time in America/Bogota timezone
 * @returns Date object adjusted to UTC-5
 */
export function now(): Date {
  const utcDate = new Date();
  // Convert UTC to UTC-5 by subtracting 5 hours
  return new Date(utcDate.getTime() + UTC_OFFSET_MS);
}

/**
 * Get today's date at midnight (UTC-5)
 * @returns Date at 00:00:00 UTC-5
 */
export function today(): Date {
  const currentTime = now();
  const date = new Date(currentTime);
  date.setUTCHours(5, 0, 0, 0); // 5 UTC = 00:00 UTC-5
  return date;
}

/**
 * Get start of week (Monday) in UTC-5
 * @param date - optional date to calculate from
 * @returns Date at start of week (Monday 00:00:00 UTC-5)
 */
export function getWeekStart(date?: Date): Date {
  const d = date ? new Date(date) : today();
  const day = d.getUTCDay();
  // Adjust to Monday (1 = Monday in getUTCDay)
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d);
  weekStart.setUTCDate(diff);
  weekStart.setUTCHours(5, 0, 0, 0); // 5 UTC = 00:00 UTC-5
  return weekStart;
}

/**
 * Get end of week (Sunday) in UTC-5
 * @param date - optional date to calculate from
 * @returns Date at end of week (Sunday 23:59:59 UTC-5)
 */
export function getWeekEnd(date?: Date): Date {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  weekEnd.setUTCHours(4, 59, 59, 999); // 4:59:59 UTC = 23:59:59 UTC-5
  return weekEnd;
}

/**
 * Get start of month (1st day) in UTC-5
 * @param date - optional date to calculate from
 * @returns Date at start of month (00:00:00 UTC-5)
 */
export function getMonthStart(date?: Date): Date {
  const d = date ? new Date(date) : today();
  const monthStart = new Date(d);
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(5, 0, 0, 0); // 5 UTC = 00:00 UTC-5
  return monthStart;
}

/**
 * Get end of month (last day) in UTC-5
 * @param date - optional date to calculate from
 * @returns Date at end of month (23:59:59 UTC-5)
 */
export function getMonthEnd(date?: Date): Date {
  const d = date ? new Date(date) : today();
  const monthEnd = new Date(d);
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1, 0);
  monthEnd.setUTCHours(4, 59, 59, 999); // 4:59:59 UTC = 23:59:59 UTC-5
  return monthEnd;
}

/**
 * Format date for display (friendly format)
 * @param date - date to format
 * @returns Formatted string like "Mar 8, 2026"
 */
export function formatForDisplay(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Format date for calendar display
 * @param date - date to format
 * @returns Formatted string like "Sun, Mar 8"
 */
export function formatForCalendar(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Format date and time for display
 * @param date - date to format
 * @returns Formatted string like "Mar 8, 2026 2:30 PM"
 */
export function formatDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Format as ISO date string (YYYY-MM-DD) in UTC-5
 * @param date - date to format
 * @returns ISO date string like "2026-03-08"
 */
export function formatAsISO(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const formatted = new Intl.DateTimeFormat("en-CA", options).format(date);
  return formatted; // en-CA gives YYYY-MM-DD format
}

/**
 * Parse ISO date string to Date object (in UTC-5)
 * @param isoString - ISO date string like "2026-03-08"
 * @returns Date object at 00:00:00 UTC-5
 */
export function parseISO(isoString: string): Date {
  const [year, month, day] = isoString.split("-").map(Number);
  const date = new Date();
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(5, 0, 0, 0); // 5 UTC = 00:00 UTC-5
  return date;
}

/**
 * Check if date is today (UTC-5)
 * @param date - date to check
 * @returns true if date is today
 */
export function isToday(date: Date): boolean {
  const todayDate = today();
  return formatAsISO(date) === formatAsISO(todayDate);
}

/**
 * Check if date is in the past (UTC-5)
 * @param date - date to check
 * @returns true if date is before today
 */
export function isPast(date: Date): boolean {
  return date < today();
}

/**
 * Check if date is in the future (UTC-5)
 * @param date - date to check
 * @returns true if date is after today
 */
export function isFuture(date: Date): boolean {
  return date > today();
}

/**
 * Check if two dates are the same day (UTC-5)
 * @param date1 - first date
 * @param date2 - second date
 * @returns true if same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatAsISO(date1) === formatAsISO(date2);
}

/**
 * Get number of days between two dates
 * @param date1 - first date
 * @param date2 - second date
 * @returns number of days (can be negative)
 */
export function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setUTCHours(12, 0, 0, 0);
  d2.setUTCHours(12, 0, 0, 0);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get number of weeks between two dates
 * @param date1 - first date
 * @param date2 - second date
 * @returns number of weeks (can be negative)
 */
export function weeksBetween(date1: Date, date2: Date): number {
  return daysBetween(date1, date2) / 7;
}

/**
 * Add days to a date
 * @param date - base date
 * @param days - number of days to add
 * @returns new date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Add weeks to a date
 * @param date - base date
 * @param weeks - number of weeks to add
 * @returns new date
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * Get day of week (0=Sunday, 1=Monday, etc.) in UTC-5
 * @param date - date to check
 * @returns day of week number
 */
export function getDayOfWeek(date: Date): number {
  return date.getUTCDay();
}

/**
 * Get day name in UTC-5
 * @param date - date to check
 * @returns day name like "Monday"
 */
export function getDayName(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    weekday: "long",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Get month name in UTC-5
 * @param date - date to check
 * @returns month name like "March"
 */
export function getMonthName(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    month: "long",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Parse a date string in various formats
 * @param dateString - date string to parse
 * @returns parsed Date object at 00:00:00 UTC-5
 */
export function parseDate(dateString: string): Date {
  // Handle ISO format: "2026-03-08"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return parseISO(dateString);
  }

  // Handle other formats by parsing and adjusting
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  // Normalize to UTC-5 00:00:00
  const isoString = formatAsISO(date);
  return parseISO(isoString);
}

/**
 * Get the day of month in UTC-5
 * @param date - date to check
 * @returns day of month (1-31)
 */
export function getDayOfMonth(date: Date): number {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    day: "numeric",
  };
  return parseInt(new Intl.DateTimeFormat("en-US", options).format(date));
}

/**
 * Get the month (0-11) in UTC-5
 * @param date - date to check
 * @returns month (0=January, 11=December)
 */
export function getMonth(date: Date): number {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    month: "2-digit",
  };
  const monthStr = new Intl.DateTimeFormat("en-US", options).format(date);
  return parseInt(monthStr) - 1;
}

/**
 * Get the year in UTC-5
 * @param date - date to check
 * @returns year
 */
export function getYear(date: Date): number {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    year: "numeric",
  };
  return parseInt(new Intl.DateTimeFormat("en-US", options).format(date));
}
