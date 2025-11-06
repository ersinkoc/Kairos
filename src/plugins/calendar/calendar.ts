import type { KairosPlugin, KairosStatic, KairosInstance } from '../../core/types/plugin.js';
import { throwError } from '../../core/utils/validators.js';

interface CalendarInfo {
  year: number;
  quarter: number;
  month: number;
  week: number;
  weekYear: number;
  isoWeek: number;
  isoWeekYear: number;
  dayOfYear: number;
  dayOfWeek: number;
  daysInMonth: number;
  daysInYear: number;
  isLeapYear: boolean;
  weekOfMonth: number;
}

class CalendarCalculator {
  /**
   * Calculate ISO week number
   * ISO weeks start on Monday and the first week contains January 4th
   */
  static getISOWeek(date: Date): number {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);

    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));

    // Get first day of year
    const yearStart = new Date(d.getFullYear(), 0, 1);

    // Calculate full weeks to nearest Thursday
    const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

    return weekNumber;
  }

  /**
   * Get the year for ISO week
   */
  static getISOWeekYear(date: Date): number {
    const d = new Date(date.getTime());
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return d.getFullYear();
  }

  /**
   * Calculate week number (week starts on Sunday by default)
   */
  static getWeek(date: Date, startDay = 0): number {
    const d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);

    // Get the first day of the year
    const yearStart = new Date(d.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);

    // Find the first week start day of the year
    const yearStartDay = yearStart.getDay();
    const daysToWeekStart = (startDay - yearStartDay + 7) % 7;
    const firstWeekStart = new Date(yearStart);

    if (daysToWeekStart > 0) {
      firstWeekStart.setDate(yearStart.getDate() + daysToWeekStart - 7);
    }

    // Calculate the number of days from the first week start
    const daysDiff = Math.floor((d.getTime() - firstWeekStart.getTime()) / 86400000);

    // Calculate week number
    const weekNumber = Math.floor(daysDiff / 7) + 1;

    // If the week number is less than 1, it belongs to the previous year
    if (weekNumber < 1) {
      // Calculate week number for the previous year
      const prevYearEnd = new Date(d.getFullYear() - 1, 11, 31);
      return this.getWeek(prevYearEnd, startDay);
    }

    return weekNumber;
  }

  /**
   * Get the quarter (1-4)
   */
  static getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
  }

  /**
   * Get day of year (1-366)
   */
  static getDayOfYear(date: Date): number {
    // Use UTC to avoid DST issues
    const start = new Date(Date.UTC(date.getFullYear(), 0, 1));
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const diff = target.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
  }

  /**
   * Get number of days in month
   */
  static getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Get number of days in year
   */
  static getDaysInYear(year: number): number {
    return this.isLeapYear(year) ? 366 : 365;
  }

  /**
   * Check if year is a leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * Get week of month (1-5)
   */
  static getWeekOfMonth(date: Date, startDay = 0): number {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstDayOfWeek = firstDay.getDay();
    const offsetDays = (firstDayOfWeek - startDay + 7) % 7;
    const dayOfMonth = date.getDate();

    return Math.ceil((dayOfMonth + offsetDays) / 7);
  }

  /**
   * Get full calendar information
   */
  static getCalendarInfo(date: Date): CalendarInfo {
    const year = date.getFullYear();

    return {
      year,
      quarter: this.getQuarter(date),
      month: date.getMonth() + 1,
      week: this.getWeek(date),
      weekYear: year,
      isoWeek: this.getISOWeek(date),
      isoWeekYear: this.getISOWeekYear(date),
      dayOfYear: this.getDayOfYear(date),
      dayOfWeek: date.getDay(),
      daysInMonth: this.getDaysInMonth(date),
      daysInYear: this.getDaysInYear(year),
      isLeapYear: this.isLeapYear(year),
      weekOfMonth: this.getWeekOfMonth(date),
    };
  }
}

const calendarPlugin: KairosPlugin = {
  name: 'calendar',

  install(kairos: KairosStatic) {
    // Add instance methods
    kairos.extend({
      quarter(value?: number): number | KairosInstance {
        const current = CalendarCalculator.getQuarter(this.toDate());

        if (value === undefined) {
          return current;
        }

        if (value < 1 || value > 4) {
          throw new Error('Quarter must be between 1 and 4');
        }

        const clone = this.clone();
        const month = (value - 1) * 3 + 1; // First month of the quarter (1-based)
        return clone.month(month);
      },

      week(value?: number): number | KairosInstance {
        const current = CalendarCalculator.getWeek(this.toDate());

        if (value === undefined) {
          return current;
        }

        const clone = this.clone();
        const currentWeek = current;
        const weekDiff = value - currentWeek;
        return clone.add(weekDiff * 7, 'days');
      },

      isoWeek(value?: number): number | KairosInstance {
        const current = CalendarCalculator.getISOWeek(this.toDate());

        if (value === undefined) {
          return current;
        }

        const clone = this.clone();
        const currentWeek = current;
        const weekDiff = value - currentWeek;
        return clone.add(weekDiff * 7, 'days');
      },

      isoWeekYear(): number {
        return CalendarCalculator.getISOWeekYear(this.toDate());
      },

      weekYear(): number {
        return this.year() as number;
      },

      dayOfYear(value?: number): number | KairosInstance {
        const current = CalendarCalculator.getDayOfYear(this.toDate());

        if (value === undefined) {
          return current;
        }

        // Validate input range
        const clone = this.clone();
        const year = clone.year() as number;
        const daysInYear = CalendarCalculator.getDaysInYear(year);

        if (value < 1 || value > daysInYear) {
          throwError(
            `Day of year must be between 1 and ${daysInYear} for year ${year}`,
            'INVALID_DAY_OF_YEAR'
          );
        }

        const yearStart = new Date(year, 0, 1);
        yearStart.setDate(value);
        return kairos(yearStart);
      },

      daysInMonth(): number {
        return CalendarCalculator.getDaysInMonth(this.toDate());
      },

      daysInYear(): number {
        return CalendarCalculator.getDaysInYear(this.year() as number);
      },

      isLeapYear(): boolean {
        return CalendarCalculator.isLeapYear(this.year() as number);
      },

      weekOfMonth(): number {
        return CalendarCalculator.getWeekOfMonth(this.toDate());
      },

      calendarInfo(): CalendarInfo {
        return CalendarCalculator.getCalendarInfo(this.toDate());
      },

      startOfQuarter(): KairosInstance {
        const quarter = this.quarter() as number;
        const month = (quarter - 1) * 3;
        return kairos(new Date(this.year() as number, month, 1)).startOf('day');
      },

      endOfQuarter(): KairosInstance {
        const quarter = this.quarter() as number;
        const month = quarter * 3;
        return kairos(new Date(this.year() as number, month, 0)).endOf('day');
      },

      startOfWeek(startDay = 0): KairosInstance {
        const clone = this.clone();
        const day = clone.day();
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const diff = (day < startDay ? -7 : 0) + startDay - (day as number);
        return clone.add(diff, 'days').startOf('day');
      },

      endOfWeek(startDay = 0): KairosInstance {
        const clone = this.clone();
        const day = clone.day();
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const diff = (day < startDay ? -7 : 0) + startDay - (day as number) + 6;
        return clone.add(diff, 'days').endOf('day');
      },

      startOfISOWeek(): KairosInstance {
        return this.startOfWeek(1); // ISO weeks start on Monday
      },

      endOfISOWeek(): KairosInstance {
        return this.endOfWeek(1); // ISO weeks start on Monday
      },

      isWeekend(): boolean {
        const day = this.day();
        return day === 0 || day === 6;
      },

      isWeekday(): boolean {
        return !this.isWeekend();
      },

      isSameQuarter(other: KairosInstance): boolean {
        return this.quarter() === other.quarter() && this.year() === other.year();
      },

      isSameWeek(other: KairosInstance, startDay = 0): boolean {
        const thisStart = this.startOfWeek(startDay);
        const otherStart = other.startOfWeek(startDay);
        // Compare just the date parts, not the time
        return thisStart.format('YYYY-MM-DD') === otherStart.format('YYYY-MM-DD');
      },

      isSameISOWeek(other: KairosInstance): boolean {
        return this.isoWeek() === other.isoWeek() && this.isoWeekYear() === other.isoWeekYear();
      },

      weeksInYear(): number {
        const lastDay = kairos(new Date(this.year() as number, 11, 31));
        return CalendarCalculator.getWeek(lastDay.toDate());
      },

      isoWeeksInYear(): number {
        const year = this.year() as number;
        const lastWeek = CalendarCalculator.getISOWeek(new Date(year, 11, 31));

        // If last week is 1, then the year has 52 weeks
        if (lastWeek === 1) {
          return CalendarCalculator.getISOWeek(new Date(year, 11, 24));
        }

        return lastWeek;
      },
    });

    // Add static methods
    kairos.addStatic({
      calendar: CalendarCalculator,
    });
  },
};

export default calendarPlugin;
export { CalendarCalculator };
export type { CalendarInfo };
