import type {
  KairosPlugin,
  KairosStatic,
  KairosInstance,
  KairosInput,
  KairosConfig,
  ExtensionMethods,
  StaticMethods,
  PluginUtils,
} from './types/plugin.js';
import type { DateLike } from './types/base.js';
import { LRUCache, memoize } from './utils/cache.js';
import { throwError } from './utils/validators.js';

// Type guards
const isKairosInstance = (obj: unknown): obj is KairosInstance => {
  return obj !== null && typeof obj === 'object' && '_date' in obj && obj._date instanceof Date;
};

const hasToDateMethod = (obj: unknown): obj is { toDate(): Date } => {
  return (
    obj !== null && typeof obj === 'object' && 'toDate' in obj && typeof obj.toDate === 'function'
  );
};

const isDateLike = (obj: unknown): obj is DateLike => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    (('year' in obj && 'month' in obj && 'day' in obj) || 'date' in obj)
  );
};

const globalCache = new LRUCache<string, unknown>(1000);

/**
 * Core Kairos class providing immutable date manipulation methods.
 * All methods return new instances rather than modifying the current instance.
 *
 * @example
 * ```typescript
 * import kairos from 'kairos';
 *
 * const date = kairos('2024-01-15');
 * const nextWeek = date.add(1, 'week');
 * const formatted = date.format('YYYY-MM-DD HH:mm:ss');
 * ```
 */
export class KairosCore {
  private _date: Date;
  private static config: KairosConfig = {
    locale: 'en',
    strict: false,
    suppressDeprecationWarnings: false,
  };

  /**
   * Creates a new Kairos instance.
   *
   * @param input - The input to parse into a date. Can be:
   *   - `undefined`: Creates instance with current date/time
   *   - `Date`: Creates instance from Date object
   *   - `number`: Creates instance from timestamp (milliseconds since Unix epoch)
   *   - `string`: Parses date string (ISO 8601, YYYY-MM-DD, etc.)
   *   - `KairosInstance`: Creates instance from another Kairos instance
   *
   * @example
   * ```typescript
   * kairos();                    // Current date/time
   * kairos(new Date());          // From Date object
   * kairos(1640995200000);       // From timestamp
   * kairos('2024-01-01');        // From ISO date string
   * kairos('2024-01-01T12:00');  // From ISO datetime string
   * ```
   */
  constructor(input?: KairosInput) {
    this._date = this.parseInput(input);
  }

  private parseInput(input?: KairosInput): Date {
    if (input === undefined) {
      return new Date();
    }

    if (input instanceof Date) {
      return new Date(input.getTime());
    }

    if (typeof input === 'number') {
      if (isNaN(input)) {
        return new Date(NaN);
      }
      return new Date(input);
    }

    if (typeof input === 'string') {
      // Check for obviously invalid strings first
      if (input.toLowerCase() === 'invalid' || input === '') {
        return new Date(NaN);
      }

      // Check if the input is a date-only string (YYYY-MM-DD)
      const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnlyPattern.test(input)) {
        // Parse as local date by adding time component
        const [year, month, day] = input.split('-').map(Number);

        // Validate month and day ranges
        if (month < 1 || month > 12) {
          return new Date(NaN);
        }

        // Create the date and check if it's valid
        const date = new Date(year, month - 1, day, 0, 0, 0, 0);

        // Check if the date components match what we input
        // This catches invalid dates like Feb 29 on non-leap years
        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          return new Date(NaN);
        }

        return date;
      }

      // Try European date format DD.MM.YYYY
      const europeanPattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
      if (europeanPattern.test(input)) {
        const match = input.match(europeanPattern);
        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10);
          const year = parseInt(match[3], 10);

          // Validate
          if (month < 1 || month > 12 || day < 1 || day > 31) {
            return new Date(NaN);
          }

          const date = new Date(year, month - 1, day, 0, 0, 0, 0);

          // Verify date didn't roll over
          if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
          ) {
            return new Date(NaN);
          }

          return date;
        }
      }

      const parsed = new Date(input);
      if (isNaN(parsed.getTime())) {
        if (KairosCore.config.strict) {
          throwError(`Invalid date string: ${input}`, 'INVALID_DATE');
        }
        return new Date(NaN);
      }
      return parsed;
    }

    // Check if input is a Kairos instance or date-like object
    if (input && typeof input === 'object') {
      // Check for _date property (internal Kairos property)
      if (isKairosInstance(input)) {
        return new Date(input._date.getTime());
      }

      // Check for toDate method (Kairos instance method)
      if (hasToDateMethod(input)) {
        return input.toDate();
      }

      // Check for year/month/day object
      if (
        isDateLike(input) &&
        input.year !== undefined &&
        input.month !== undefined &&
        input.day !== undefined
      ) {
        const year = input.year;
        const month = input.month - 1; // Convert 1-12 to 0-11
        const day = input.day;
        const hour = input.hour || 0;
        const minute = input.minute || 0;
        const second = input.second || 0;
        const millisecond = input.millisecond || 0;

        const date = new Date(year, month, day, hour, minute, second, millisecond);

        // Validate the date
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
          return new Date(NaN);
        }

        return date;
      }

      // Legacy check for date property
      if (isDateLike(input) && input.date instanceof Date) {
        return new Date(input.date.getTime());
      }
    }

    return new Date(NaN);
  }

  /**
   * Returns the primitive numeric value (timestamp) of the instance.
   * @returns The timestamp in milliseconds since Unix epoch
   * @example
   * ```typescript
   * const date = kairos('2024-01-01');
   * console.log(date.valueOf()); // 1704067200000
   * ```
   */
  valueOf(): number {
    return this._date.getTime();
  }

  /**
   * Returns a string representation of the date.
   * @returns String representation using the native Date toString method
   */
  toString(): string {
    return this._date.toString();
  }

  /**
   * Returns the ISO 8601 string representation of the date.
   * @returns ISO 8601 formatted string (YYYY-MM-DDTHH:mm:ss.sssZ)
   * @example
   * ```typescript
   * const date = kairos('2024-01-01T12:00:00');
   * console.log(date.toISOString()); // '2024-01-01T12:00:00.000Z'
   * ```
   */
  toISOString(): string {
    return this._date.toISOString();
  }

  /**
   * Gets the timezone offset in minutes.
   * @returns The offset from UTC in minutes
   */
  offset(): number {
    // Check if this is a UTC instance
    if ((this as any)._isUTC) {
      return 0;
    }
    return -this._date.getTimezoneOffset();
  }

  /**
   * Returns a native JavaScript Date object.
   * @returns A new Date object with the same timestamp
   * @example
   * ```typescript
   * const kairos = kairos('2024-01-01');
   * const nativeDate = kairos.toDate();
   * console.log(nativeDate instanceof Date); // true
   * ```
   */
  toDate(): Date {
    return new Date(this._date.getTime());
  }

  /**
   * Creates a new Kairos instance with the same date/time.
   * @returns A new KairosInstance with identical timestamp
   * @example
   * ```typescript
   * const original = kairos('2024-01-01');
   * const copy = original.clone();
   * console.log(original.valueOf() === copy.valueOf()); // true
   * console.log(original === copy); // false (different instances)
   * ```
   */
  clone(): KairosInstance {
    return new KairosCore(this._date) as any;
  }

  /**
   * Gets or sets the year.
   * @param value - Optional year to set (1-9999)
   * @returns Current year if no parameter, new instance if setting
   * @example
   * ```typescript
   * const date = kairos('2024-06-15');
   * console.log(date.year()); // 2024
   * const newYear = date.year(2025);
   * console.log(newYear.year()); // 2025
   * ```
   */
  year(value?: number): number | KairosInstance {
    if (value === undefined) {
      return this._date.getFullYear();
    }
    const clone = this.clone();
    clone._date.setFullYear(value);
    return clone;
  }

  /**
   * Gets or sets the month.
   * @param value - Optional month to set (1-12, where 1 = January)
   * @returns Current month (1-12) if no parameter, new instance if setting
   * @example
   * ```typescript
   * const date = kairos('2024-06-15');
   * console.log(date.month()); // 6 (June)
   * const newMonth = date.month(12);
   * console.log(newMonth.month()); // 12 (December)
   * ```
   */
  month(value?: number): number | KairosInstance {
    if (value === undefined) {
      return this._date.getMonth() + 1;
    }
    const clone = this.clone();
    clone._date.setMonth(value - 1);
    return clone;
  }

  /**
   * Gets or sets the day of month.
   * @param value - Optional day to set (1-31)
   * @returns Current day of month if no parameter, new instance if setting
   * @example
   * ```typescript
   * const date = kairos('2024-06-15');
   * console.log(date.date()); // 15
   * const newDay = date.date(25);
   * console.log(newDay.date()); // 25
   * ```
   */
  date(value?: number): number | KairosInstance {
    if (value === undefined) {
      return this._date.getDate();
    }
    const clone = this.clone();
    clone._date.setDate(value);
    return clone;
  }

  /**
   * Gets the day of the week.
   * @returns Day of week (0-6, where 0 = Sunday, 1 = Monday, ..., 6 = Saturday)
   * @example
   * ```typescript
   * const date = kairos('2024-06-17'); // Monday
   * console.log(date.day()); // 1
   * ```
   */
  day(): number {
    return this._date.getDay();
  }

  /**
   * Gets or sets the hour.
   * @param value - Optional hour to set (0-23)
   * @returns Current hour if no parameter, new instance if setting
   * @example
   * ```typescript
   * const date = kairos('2024-06-15T14:30:00');
   * console.log(date.hour()); // 14
   * const newHour = date.hour(9);
   * console.log(newHour.hour()); // 9
   * ```
   */
  hour(value?: number): number | KairosInstance {
    if (value === undefined) {
      return this._date.getHours();
    }
    const clone = this.clone();
    clone._date.setHours(value);
    return clone;
  }

  /**
   * Gets or sets the minute.
   * @param value - Optional minute to set (0-59)
   * @returns Current minute if no parameter, new instance if setting
   * @example
   * ```typescript
   * const date = kairos('2024-06-15T14:30:00');
   * console.log(date.minute()); // 30
   * const newMinute = date.minute(45);
   * console.log(newMinute.minute()); // 45
   * ```
   */
  minute(value?: number): number | KairosInstance {
    if (value === undefined) {
      return this._date.getMinutes();
    }
    const clone = this.clone();
    clone._date.setMinutes(value);
    return clone;
  }

  /**
   * Gets or sets the second.
   * @param value - Optional second to set (0-59)
   * @returns Current second if no parameter, new instance if setting
   * @example
   * ```typescript
   * const date = kairos('2024-06-15T14:30:25');
   * console.log(date.second()); // 25
   * const newSecond = date.second(45);
   * console.log(newSecond.second()); // 45
   * ```
   */
  second(value?: number): number | KairosInstance {
    if (value === undefined) {
      return this._date.getSeconds();
    }
    const clone = this.clone();
    clone._date.setSeconds(value);
    return clone;
  }

  /**
   * Gets or sets the millisecond.
   * @param value - Optional millisecond to set (0-999)
   * @returns Current millisecond if no parameter, new instance if setting
   * @example
   * ```typescript
   * const date = kairos('2024-06-15T14:30:25.123');
   * console.log(date.millisecond()); // 123
   * const newMs = date.millisecond(456);
   * console.log(newMs.millisecond()); // 456
   * ```
   */
  millisecond(value?: number): number | KairosInstance {
    if (value === undefined) {
      return this._date.getMilliseconds();
    }
    const clone = this.clone();
    clone._date.setMilliseconds(value);
    return clone;
  }

  /**
   * Adds the specified amount of time to the date.
   * @param amount - The amount to add (can be negative for subtraction)
   * @param unit - The unit of time to add. Supported units:
   *   - `'year'`, `'years'`, `'y'` - Years
   *   - `'month'`, `'months'`, `'M'` - Months
   *   - `'week'`, `'weeks'`, `'w'` - Weeks
   *   - `'day'`, `'days'`, `'d'` - Days
   *   - `'hour'`, `'hours'`, `'h'` - Hours
   *   - `'minute'`, `'minutes'`, `'m'` - Minutes
   *   - `'second'`, `'seconds'`, `'s'` - Seconds
   *   - `'millisecond'`, `'milliseconds'`, `'ms'` - Milliseconds
   * @returns New KairosInstance with the time added
   * @example
   * ```typescript
   * const date = kairos('2024-01-15');
   * const nextWeek = date.add(1, 'week');
   * const nextMonth = date.add(2, 'months');
   * const yesterday = date.add(-1, 'day');
   * ```
   */
  add(amount: number, unit: string): KairosInstance {
    if (!this.isValid()) {
      return this.clone();
    }
    const clone = this.clone();
    const normalizedUnit = this.normalizeUnit(unit);

    switch (normalizedUnit) {
      case 'year':
        clone._date.setFullYear(clone._date.getFullYear() + amount);
        break;
      case 'month': {
        const currentDay = clone._date.getDate();
        const currentMonth = clone._date.getMonth();
        const currentYear = clone._date.getFullYear();

        // Calculate target month and year
        let targetMonth = currentMonth + amount;
        let targetYear = currentYear;

        while (targetMonth < 0) {
          targetMonth += 12;
          targetYear--;
        }
        while (targetMonth >= 12) {
          targetMonth -= 12;
          targetYear++;
        }

        // Get the last day of the target month
        const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

        // Set to the target month, capping the day if necessary
        // Set day to 1 first to avoid month overflow issues
        clone._date.setDate(1);
        clone._date.setFullYear(targetYear);
        clone._date.setMonth(targetMonth);
        clone._date.setDate(Math.min(currentDay, lastDayOfTargetMonth));
        break;
      }
      case 'week':
        clone._date.setDate(clone._date.getDate() + amount * 7);
        break;
      case 'day':
        // Handle fractional days by converting to hours
        if (amount % 1 !== 0) {
          const wholeDays = Math.floor(amount);
          const fractionalHours = (amount - wholeDays) * 24;
          clone._date.setDate(clone._date.getDate() + wholeDays);
          clone._date.setHours(clone._date.getHours() + fractionalHours);
        } else {
          clone._date.setDate(clone._date.getDate() + amount);
        }
        break;
      case 'hour':
        clone._date.setHours(clone._date.getHours() + amount);
        break;
      case 'minute':
        clone._date.setMinutes(clone._date.getMinutes() + amount);
        break;
      case 'second':
        clone._date.setSeconds(clone._date.getSeconds() + amount);
        break;
      case 'millisecond':
        clone._date.setMilliseconds(clone._date.getMilliseconds() + amount);
        break;
      default:
        throwError(`Unknown unit: ${unit}`, 'INVALID_UNIT');
    }

    return clone;
  }

  /**
   * Subtracts the specified amount of time from the date.
   * @param amount - The amount to subtract
   * @param unit - The unit of time to subtract (same options as `add`)
   * @returns New KairosInstance with the time subtracted
   * @example
   * ```typescript
   * const date = kairos('2024-01-15');
   * const lastWeek = date.subtract(1, 'week');
   * const twoMonthsAgo = date.subtract(2, 'months');
   * ```
   */
  subtract(amount: number, unit: string): KairosInstance {
    return this.add(-amount, unit);
  }

  /**
   * Returns a new instance set to the start of the specified time unit.
   * @param unit - The unit to set to start of ('year', 'month', 'week', 'day', 'hour', 'minute', 'second')
   * @returns New KairosInstance at the start of the specified unit
   * @example
   * ```typescript
   * const date = kairos('2024-06-15T14:30:45.123');
   * console.log(date.startOf('year'));   // 2024-01-01T00:00:00.000
   * console.log(date.startOf('month'));  // 2024-06-01T00:00:00.000
   * console.log(date.startOf('day'));    // 2024-06-15T00:00:00.000
   * console.log(date.startOf('hour'));   // 2024-06-15T14:00:00.000
   * ```
   */
  startOf(unit: string): KairosInstance {
    const clone = this.clone() as KairosCore;
    const normalizedUnit = this.normalizeUnit(unit);

    switch (normalizedUnit) {
      case 'year':
        clone._date.setMonth(0, 1);
        clone._date.setHours(0, 0, 0, 0);
        break;
      case 'month':
        clone._date.setDate(1);
        clone._date.setHours(0, 0, 0, 0);
        break;
      case 'week': {
        const day = clone._date.getDay();
        clone._date.setDate(clone._date.getDate() - day);
        clone._date.setHours(0, 0, 0, 0);
        break;
      }
      case 'day':
        clone._date.setHours(0, 0, 0, 0);
        break;
      case 'hour':
        clone._date.setMinutes(0, 0, 0);
        break;
      case 'minute':
        clone._date.setSeconds(0, 0);
        break;
      case 'second':
        clone._date.setMilliseconds(0);
        break;
    }

    return clone as KairosInstance;
  }

  /**
   * Returns a new instance set to the end of the specified time unit.
   * @param unit - The unit to set to end of ('year', 'month', 'week', 'day', 'hour', 'minute', 'second')
   * @returns New KairosInstance at the end of the specified unit
   * @example
   * ```typescript
   * const date = kairos('2024-06-15T14:30:45.123');
   * console.log(date.endOf('year'));   // 2024-12-31T23:59:59.999
   * console.log(date.endOf('month'));  // 2024-06-30T23:59:59.999
   * console.log(date.endOf('day'));    // 2024-06-15T23:59:59.999
   * console.log(date.endOf('hour'));   // 2024-06-15T14:59:59.999
   * ```
   */
  endOf(unit: string): KairosInstance {
    const clone = this.clone() as KairosCore;
    const normalizedUnit = this.normalizeUnit(unit);

    switch (normalizedUnit) {
      case 'year':
        clone._date.setMonth(11, 31);
        clone._date.setHours(23, 59, 59, 999);
        break;
      case 'month':
        clone._date.setMonth(clone._date.getMonth() + 1, 0);
        clone._date.setHours(23, 59, 59, 999);
        break;
      case 'week': {
        const day = clone._date.getDay();
        clone._date.setDate(clone._date.getDate() + (6 - day));
        clone._date.setHours(23, 59, 59, 999);
        break;
      }
      case 'day':
        clone._date.setHours(23, 59, 59, 999);
        break;
      case 'hour':
        clone._date.setMinutes(59, 59, 999);
        break;
      case 'minute':
        clone._date.setSeconds(59, 999);
        break;
      case 'second':
        clone._date.setMilliseconds(999);
        break;
    }

    return clone as KairosInstance;
  }

  /**
   * Checks if the date is valid.
   * @returns True if the date is valid, false otherwise
   * @example
   * ```typescript
   * const valid = kairos('2024-01-01');
   * const invalid = kairos('invalid');
   * console.log(valid.isValid()); // true
   * console.log(invalid.isValid()); // false
   * ```
   */
  isValid(): boolean {
    return !isNaN(this._date.getTime());
  }

  /**
   * Checks if this date is before another date.
   * @param other - The date to compare against
   * @returns True if this date is before the other date
   * @example
   * ```typescript
   * const date1 = kairos('2024-01-01');
   * const date2 = kairos('2024-01-02');
   * console.log(date1.isBefore(date2)); // true
   * console.log(date2.isBefore(date1)); // false
   * ```
   */
  isBefore(other: KairosInstance): boolean {
    return this.valueOf() < other.valueOf();
  }

  /**
   * Checks if this date is after another date.
   * @param other - The date to compare against
   * @returns True if this date is after the other date
   * @example
   * ```typescript
   * const date1 = kairos('2024-01-01');
   * const date2 = kairos('2024-01-02');
   * console.log(date2.isAfter(date1)); // true
   * console.log(date1.isAfter(date2)); // false
   * ```
   */
  isAfter(other: KairosInstance): boolean {
    return this.valueOf() > other.valueOf();
  }

  /**
   * Checks if this date is the same as another date.
   * @param other - The date to compare against
   * @returns True if both dates have the same timestamp
   * @example
   * ```typescript
   * const date1 = kairos('2024-01-01T12:00:00');
   * const date2 = kairos('2024-01-01T12:00:00');
   * const date3 = kairos('2024-01-01T12:00:01');
   * console.log(date1.isSame(date2)); // true
   * console.log(date1.isSame(date3)); // false
   * ```
   */
  isSame(other: KairosInstance): boolean {
    return this.valueOf() === other.valueOf();
  }

  /**
   * Formats the date according to the specified template.
   * @param template - Format template string. Supported tokens:
   *   - `YYYY` - 4-digit year
   *   - `MM` - 2-digit month (01-12)
   *   - `DD` - 2-digit day of month (01-31)
   *   - `HH` - 2-digit hour (00-23)
   *   - `mm` - 2-digit minute (00-59)
   *   - `ss` - 2-digit second (00-59)
   * @returns Formatted date string
   * @example
   * ```typescript
   * const date = kairos('2024-06-15T14:30:25');
   * console.log(date.format());                    // '2024-06-15'
   * console.log(date.format('YYYY-MM-DD HH:mm'));  // '2024-06-15 14:30'
   * console.log(date.format('DD/MM/YYYY'));        // '15/06/2024'
   * console.log(date.format('HH:mm:ss'));          // '14:30:25'
   * ```
   */
  format(template: string = 'YYYY-MM-DD'): string {
    if (!this.isValid()) {
      return 'Invalid Date';
    }

    // Use UTC methods if this is a UTC instance
    const isUtc = (this as any)._isUTC;
    const year = isUtc ? this._date.getUTCFullYear() : this._date.getFullYear();
    const month = isUtc ? this._date.getUTCMonth() + 1 : this._date.getMonth() + 1;
    const date = isUtc ? this._date.getUTCDate() : this._date.getDate();
    const hours = isUtc ? this._date.getUTCHours() : this._date.getHours();
    const minutes = isUtc ? this._date.getUTCMinutes() : this._date.getMinutes();
    const seconds = isUtc ? this._date.getUTCSeconds() : this._date.getSeconds();

    // Double-check for NaN values
    if (isNaN(year) || isNaN(month) || isNaN(date)) {
      return 'Invalid Date';
    }

    return template
      .replace(/YYYY/g, year.toString())
      .replace(/MM/g, month.toString().padStart(2, '0'))
      .replace(/DD/g, date.toString().padStart(2, '0'))
      .replace(/HH/g, hours.toString().padStart(2, '0'))
      .replace(/mm/g, minutes.toString().padStart(2, '0'))
      .replace(/ss/g, seconds.toString().padStart(2, '0'));
  }

  private normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      y: 'year',
      year: 'year',
      years: 'year',
      M: 'month',
      month: 'month',
      months: 'month',
      w: 'week',
      week: 'week',
      weeks: 'week',
      d: 'day',
      day: 'day',
      days: 'day',
      h: 'hour',
      hour: 'hour',
      hours: 'hour',
      m: 'minute',
      minute: 'minute',
      minutes: 'minute',
      s: 'second',
      second: 'second',
      seconds: 'second',
      ms: 'millisecond',
      millisecond: 'millisecond',
      milliseconds: 'millisecond',
    };
    return unitMap[unit] || unit;
  }
}

/**
 * Plugin system for extending Kairos functionality.
 * Manages plugin installation, dependency resolution, and method extension.
 */
export class PluginSystem {
  static plugins = new Map<string, KairosPlugin>();
  private static installedPlugins = new Set<string>();
  private static extensionMethods: ExtensionMethods = {};
  private static staticMethods: StaticMethods = {};

  /**
   * Installs one or more plugins into the Kairos system.
   * @param plugin - A single plugin or array of plugins to install
   * @returns The Kairos static object for chaining
   * @example
   * ```typescript
   * import kairos from 'kairos';
   * import businessPlugin from 'kairos/plugins/business';
   * import holidayPlugin from 'kairos/plugins/holidays';
   *
   * // Install single plugin
   * kairos.use(businessPlugin);
   *
   * // Install multiple plugins
   * kairos.use([businessPlugin, holidayPlugin]);
   *
   * // Now use extended functionality
   * const date = kairos('2024-01-15');
   * console.log(date.isBusinessDay());
   * ```
   */
  static use(plugin: KairosPlugin | KairosPlugin[]): KairosStatic {
    const plugins = Array.isArray(plugin) ? plugin : [plugin];

    for (const p of plugins) {
      this.installPlugin(p);
    }

    return kairos as KairosStatic;
  }

  private static installPlugin(plugin: KairosPlugin): void {
    if (this.installedPlugins.has(plugin.name)) {
      return;
    }

    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.installedPlugins.has(dep)) {
          throwError(
            `Plugin ${plugin.name} depends on ${dep} which is not installed`,
            'MISSING_DEPENDENCY'
          );
        }
      }
    }

    this.plugins.set(plugin.name, plugin);
    this.installedPlugins.add(plugin.name);

    const utils: PluginUtils = {
      cache: globalCache as any,
      memoize,
      validateInput: (input: any, type: string) => {
        switch (type) {
          case 'date':
            return input instanceof Date && !isNaN(input.getTime());
          case 'number':
            return typeof input === 'number' && !isNaN(input);
          case 'string':
            return typeof input === 'string';
          default:
            return false;
        }
      },
      throwError,
    };

    plugin.install(kairos as KairosStatic, utils);
  }

  static extend(methods: ExtensionMethods): void {
    Object.assign(this.extensionMethods, methods);

    for (const [name, method] of Object.entries(methods)) {
      KairosCore.prototype[name as keyof KairosCore] = method as any;
    }
  }

  static addStatic(methods: StaticMethods): void {
    Object.assign(this.staticMethods, methods);

    for (const [name, method] of Object.entries(methods)) {
      (kairos as any)[name] = method;
    }
  }

  static getPlugin(name: string): KairosPlugin | undefined {
    return this.plugins.get(name);
  }

  static isInstalled(name: string): boolean {
    return this.installedPlugins.has(name);
  }

  static getInstalledPlugins(): string[] {
    return Array.from(this.installedPlugins);
  }
}

/**
 * Main Kairos function for creating date instances.
 *
 * @param input - Optional input to create date from (undefined = now, Date, number, string, or KairosInstance)
 * @returns A new KairosInstance
 *
 * @example
 * ```typescript
 * // Create from various inputs
 * const now = kairos();
 * const specific = kairos('2024-01-15');
 * const fromDate = kairos(new Date());
 * const fromTimestamp = kairos(1640995200000);
 *
 * // Use with plugins
 * import businessPlugin from 'kairos/plugins/business';
 * kairos.use(businessPlugin);
 *
 * const date = kairos('2024-01-15');
 * console.log(date.isBusinessDay());
 * ```
 */
const kairos = (input?: KairosInput) => new KairosCore(input) as KairosInstance;

// Bind plugin system methods
(kairos as any).use = PluginSystem.use.bind(PluginSystem);
(kairos as any).extend = PluginSystem.extend.bind(PluginSystem);
(kairos as any).addStatic = PluginSystem.addStatic.bind(PluginSystem);
(kairos as any).plugins = PluginSystem.plugins;

/**
 * Creates a Kairos instance in UTC.
 * @param input - Input to parse as UTC date
 * @returns New KairosInstance in UTC
 */
(kairos as any).utc = (input?: KairosInput) => {
  let utcDate: Date;

  if (
    typeof input === 'string' &&
    !input.endsWith('Z') &&
    !input.includes('+') &&
    !/[+-]\d{2}:?\d{2}$/.test(input)
  ) {
    // Parse as UTC by manually constructing the date components
    const dateTimePattern = /^(\d{4})-(\d{2})-(\d{2})(?:\s+|T)(\d{2}):(\d{2})(?::(\d{2}))?$/;
    const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

    const match = input.match(dateTimePattern) || input.match(dateOnlyPattern);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // 0-indexed
      const day = parseInt(match[3], 10);
      const hour = match[4] ? parseInt(match[4], 10) : 0;
      const minute = match[5] ? parseInt(match[5], 10) : 0;
      const second = match[6] ? parseInt(match[6], 10) : 0;

      // Use Date.UTC to create UTC timestamp
      utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      // Fall back to adding Z
      input = input.replace(' ', 'T') + 'Z';
      utcDate = new Date(input);
    }
  } else {
    utcDate = new Date(input as any);
  }

  const instance = new KairosCore(utcDate) as any;
  instance._isUTC = true;
  return instance;
};

/**
 * Creates a Kairos instance from Unix timestamp (seconds).
 * @param timestamp - Unix timestamp in seconds
 * @returns New KairosInstance
 */
(kairos as any).unix = (timestamp: number) => new KairosCore(new Date(timestamp * 1000));

export default kairos as KairosStatic;
