import type { KairosInstance, TimeUnit } from '../../core/types/base.js';
import type { KairosPlugin } from '../../core/types/plugin.js';

export class DateRange {
  private start: Date;
  private end: Date;
  private unit: TimeUnit;
  private step: number;

  constructor(start: Date, end: Date, unit: TimeUnit = 'day', step: number = 1) {
    this.start = new Date(start);
    this.end = new Date(end);
    this.unit = unit;
    this.step = step;
  }

  *[Symbol.iterator](): Generator<Date> {
    let current = new Date(this.start);

    while (current <= this.end) {
      yield new Date(current);
      current = this.addUnit(current, this.unit, this.step);
    }
  }

  toArray(): Date[] {
    return Array.from(this);
  }

  map<T>(callback: (date: Date, index: number) => T): T[] {
    const result: T[] = [];
    let index = 0;

    for (const date of this) {
      result.push(callback(date, index++));
    }

    return result;
  }

  filter(callback: (date: Date, index: number) => boolean): Date[] {
    const result: Date[] = [];
    let index = 0;

    for (const date of this) {
      if (callback(date, index++)) {
        result.push(date);
      }
    }

    return result;
  }

  find(callback: (date: Date, index: number) => boolean): Date | undefined {
    let index = 0;

    for (const date of this) {
      if (callback(date, index++)) {
        return date;
      }
    }

    return undefined;
  }

  every(callback: (date: Date, index: number) => boolean): boolean {
    let index = 0;

    for (const date of this) {
      if (!callback(date, index++)) {
        return false;
      }
    }

    return true;
  }

  some(callback: (date: Date, index: number) => boolean): boolean {
    let index = 0;

    for (const date of this) {
      if (callback(date, index++)) {
        return true;
      }
    }

    return false;
  }

  reduce<T>(callback: (accumulator: T, date: Date, index: number) => T, initialValue: T): T {
    let accumulator = initialValue;
    let index = 0;

    for (const date of this) {
      accumulator = callback(accumulator, date, index++);
    }

    return accumulator;
  }

  count(): number {
    let count = 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const _ of this) {
      count++;
    }
    return count;
  }

  // Get business days only
  businessDays(): Date[] {
    return this.filter((date) => {
      const day = date.getDay();
      return day !== 0 && day !== 6; // Not Sunday or Saturday
    });
  }

  // Get weekends only
  weekends(): Date[] {
    return this.filter((date) => {
      const day = date.getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
  }

  // Get specific weekdays
  weekday(weekday: number): Date[] {
    return this.filter((date) => date.getDay() === weekday);
  }

  // Get dates in specific month
  month(month: number): Date[] {
    return this.filter((date) => date.getMonth() === month - 1);
  }

  // Get dates in specific year
  year(year: number): Date[] {
    return this.filter((date) => date.getFullYear() === year);
  }

  // Split range into chunks
  chunk(size: number): DateRange[] {
    const dates = this.toArray();
    const chunks: DateRange[] = [];

    for (let i = 0; i < dates.length; i += size) {
      const chunkDates = dates.slice(i, i + size);
      if (chunkDates.length > 0) {
        chunks.push(
          new DateRange(chunkDates[0], chunkDates[chunkDates.length - 1], this.unit, this.step)
        );
      }
    }

    return chunks;
  }

  // Check if date is in range
  includes(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  // Alias for includes() to match common API expectations
  contains(date: Date): boolean {
    return this.includes(date);
  }

  // Get start date
  getStart(): Date {
    return new Date(this.start);
  }

  // Get end date
  getEnd(): Date {
    return new Date(this.end);
  }

  // Check if range overlaps with another range
  overlaps(other: DateRange): boolean {
    return this.start <= other.end && this.end >= other.start;
  }

  // Get intersection with another range
  intersection(other: DateRange): DateRange | null {
    const start = new Date(Math.max(this.start.getTime(), other.start.getTime()));
    const end = new Date(Math.min(this.end.getTime(), other.end.getTime()));

    if (start <= end) {
      return new DateRange(start, end, this.unit, this.step);
    }

    return null;
  }

  // Get union with another range (if they overlap or are adjacent)
  union(other: DateRange): DateRange | null {
    if (this.overlaps(other) || this.isAdjacent(other)) {
      const start = new Date(Math.min(this.start.getTime(), other.start.getTime()));
      const end = new Date(Math.max(this.end.getTime(), other.end.getTime()));
      return new DateRange(start, end, this.unit, this.step);
    }

    return null;
  }

  // Check if ranges are adjacent
  private isAdjacent(other: DateRange): boolean {
    const nextDay = new Date(this.end);
    nextDay.setDate(nextDay.getDate() + 1);

    const prevDay = new Date(this.start);
    prevDay.setDate(prevDay.getDate() - 1);

    return nextDay.getTime() === other.start.getTime() || prevDay.getTime() === other.end.getTime();
  }

  // Get range duration
  duration(): number {
    return this.end.getTime() - this.start.getTime();
  }

  // Get range duration in specific unit
  durationIn(unit: TimeUnit): number {
    const ms = this.duration();

    switch (unit) {
      case 'millisecond':
      case 'milliseconds':
      case 'ms':
        return ms;
      case 'second':
      case 'seconds':
      case 's':
        return ms / 1000;
      case 'minute':
      case 'minutes':
      case 'm':
        return ms / (1000 * 60);
      case 'hour':
      case 'hours':
      case 'h':
        return ms / (1000 * 60 * 60);
      case 'day':
      case 'days':
      case 'd':
        return ms / (1000 * 60 * 60 * 24);
      case 'week':
      case 'weeks':
      case 'w':
        return ms / (1000 * 60 * 60 * 24 * 7);
      case 'month':
      case 'months':
      case 'M':
        return ms / (1000 * 60 * 60 * 24 * 30.44); // Average month length
      case 'year':
      case 'years':
      case 'y':
        return ms / (1000 * 60 * 60 * 24 * 365.25); // Average year length
      default:
        return ms;
    }
  }

  private addUnit(date: Date, unit: TimeUnit, amount: number): Date {
    const result = new Date(date);

    switch (unit) {
      case 'year':
      case 'years':
      case 'y':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'month':
      case 'months':
      case 'M':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'week':
      case 'weeks':
      case 'w':
        result.setDate(result.getDate() + amount * 7);
        break;
      case 'day':
      case 'days':
      case 'd':
        result.setDate(result.getDate() + amount);
        break;
      case 'hour':
      case 'hours':
      case 'h':
        result.setHours(result.getHours() + amount);
        break;
      case 'minute':
      case 'minutes':
      case 'm':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'second':
      case 'seconds':
      case 's':
        result.setSeconds(result.getSeconds() + amount);
        break;
      case 'millisecond':
      case 'milliseconds':
      case 'ms':
        result.setMilliseconds(result.getMilliseconds() + amount);
        break;
    }

    return result;
  }
}

export default {
  name: 'range',
  version: '1.0.0',
  size: 3072,
  install(kairos) {
    // Add range method to instances
    kairos.extend({
      range(end: KairosInstance, unit: TimeUnit = 'day', step: number = 1): DateRange {
        return new DateRange(this.toDate(), end.toDate(), unit, step);
      },

      // Get all dates until another date
      until(end: KairosInstance, unit: TimeUnit = 'day'): Date[] {
        return new DateRange(this.toDate(), end.toDate(), unit).toArray();
      },

      // Get all dates since another date
      since(start: KairosInstance, unit: TimeUnit = 'day'): Date[] {
        return new DateRange(start.toDate(), this.toDate(), unit).toArray();
      },

      // Get dates in current month
      datesInMonth(): Date[] {
        const start = this.clone().date(1);
        const end = this.clone().add(1, 'month').date(1).subtract(1, 'day');
        return new DateRange(start.toDate(), end.toDate()).toArray();
      },

      // Get dates in current year
      datesInYear(): Date[] {
        const start = this.clone().month(1).date(1);
        const end = this.clone().add(1, 'year').month(1).date(1).subtract(1, 'day');
        return new DateRange(start.toDate(), end.toDate()).toArray();
      },

      // Get business days in current month
      businessDaysInCurrentMonth(): Date[] {
        const start = this.clone().date(1);
        const end = this.clone().add(1, 'month').date(1).subtract(1, 'day');
        return new DateRange(start.toDate(), end.toDate()).businessDays();
      },

      // Create range for a duration from this date
      rangeFor(amount: number, unit: TimeUnit): DateRange {
        const end = this.add(amount, unit);
        return new DateRange(this.toDate(), end.toDate());
      },

      // Get business days until another date
      businessDaysUntil(end: KairosInstance): Date[] {
        return new DateRange(this.toDate(), end.toDate()).businessDays();
      },

      // Get dates in current week (Sunday to Saturday)
      datesInWeek(): Date[] {
        const currentDay = this.day(); // 0 = Sunday, 6 = Saturday
        const startOfWeek = this.clone().subtract(currentDay, 'days');
        const endOfWeek = startOfWeek.clone().add(6, 'days');
        return new DateRange(startOfWeek.toDate(), endOfWeek.toDate()).toArray();
      },
    });

    // Add static methods
    kairos.addStatic?.({
      range(start: any, end: any, unit: TimeUnit = 'day', step: number = 1): DateRange {
        const startDate = kairos(start);
        const endDate = kairos(end);
        return new DateRange(startDate.toDate(), endDate.toDate(), unit, step);
      },

      // Create date range for specific period
      monthRange(year: number, month: number): DateRange {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        return new DateRange(start, end);
      },

      yearRange(year: number): DateRange {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        return new DateRange(start, end);
      },

      // Create range from today
      next(amount: number, unit: TimeUnit): DateRange {
        const start = new Date();
        const end = kairos(start).add(amount, unit).toDate();
        return new DateRange(start, end);
      },

      previous(amount: number, unit: TimeUnit): DateRange {
        const end = new Date();
        const start = kairos(end).subtract(amount, unit).toDate();
        return new DateRange(start, end);
      },

      // Utility to create ranges
      createRange: (start: Date, end: Date, unit?: TimeUnit, step?: number) =>
        new DateRange(start, end, unit, step),
    });
  },
} as KairosPlugin;
