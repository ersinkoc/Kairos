import type { KairosPlugin } from '../../core/types/plugin.js';

/**
 * Object representation of duration components.
 */
export interface DurationObject {
  /** Number of years */
  years?: number;
  /** Number of months */
  months?: number;
  /** Number of weeks */
  weeks?: number;
  /** Number of days */
  days?: number;
  /** Number of hours */
  hours?: number;
  /** Number of minutes */
  minutes?: number;
  /** Number of seconds */
  seconds?: number;
  /** Number of milliseconds */
  milliseconds?: number;
}

/**
 * Duration class for representing and manipulating time spans.
 * Supports ISO 8601 duration format parsing and human-readable output.
 * 
 * @example
 * ```typescript
 * import kairos from 'kairos';
 * import durationPlugin from 'kairos/plugins/duration';
 * 
 * kairos.use(durationPlugin);
 * 
 * // Create durations
 * const dur1 = kairos.duration(5000); // 5 seconds
 * const dur2 = kairos.duration('P1Y2M3DT4H5M6S'); // ISO 8601
 * const dur3 = kairos.duration({ hours: 2, minutes: 30 }); // Object
 * 
 * // Use with dates
 * const date = kairos('2024-01-01');
 * const later = date.addDuration(dur3);
 * ```
 */
export class Duration {
  private ms: number = 0;
  private _years: number = 0;
  private _months: number = 0;
  private _weeks: number = 0;
  private _days: number = 0;
  private _hours: number = 0;
  private _minutes: number = 0;
  private _seconds: number = 0;
  private _milliseconds: number = 0;

  /**
   * Creates a new Duration instance.
   * 
   * @param input - Duration input, can be:
   *   - `number`: Milliseconds
   *   - `string`: ISO 8601 duration (P1Y2M3DT4H5M6S) or simple format ("2 hours")
   *   - `DurationObject`: Object with component properties
   * 
   * @example
   * ```typescript
   * new Duration(5000);                      // 5 seconds from milliseconds
   * new Duration('P1Y2M3DT4H5M6S');          // ISO 8601 format
   * new Duration('2 hours');                 // Simple format
   * new Duration({ hours: 2, minutes: 30 }); // Object format
   * ```
   */
  constructor(input: number | DurationObject | string) {
    if (typeof input === 'number') {
      this.ms = input;
      this._milliseconds = input;
    } else if (typeof input === 'string') {
      const parsed = this.parseStringToObject(input);
      this.setFromObject(parsed);
    } else {
      this.setFromObject(input);
    }
  }

  private setFromObject(obj: DurationObject): void {
    this._years = obj.years || 0;
    this._months = obj.months || 0;
    this._weeks = obj.weeks || 0;
    this._days = obj.days || 0;
    this._hours = obj.hours || 0;
    this._minutes = obj.minutes || 0;
    this._seconds = obj.seconds || 0;
    this._milliseconds = obj.milliseconds || 0;
    this.ms = this.parseObject(obj);
  }

  private parseStringToObject(input: string): DurationObject {
    // Parse ISO 8601 duration format: P[n]Y[n]M[n]DT[n]H[n]M[n]S
    const isoMatch = input.match(
      /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
    );

    if (isoMatch) {
      const [, years, months, weeks, days, hours, minutes, seconds] = isoMatch;
      return {
        years: years ? parseInt(years, 10) : 0,
        months: months ? parseInt(months, 10) : 0,
        weeks: weeks ? parseInt(weeks, 10) : 0,
        days: days ? parseInt(days, 10) : 0,
        hours: hours ? parseInt(hours, 10) : 0,
        minutes: minutes ? parseInt(minutes, 10) : 0,
        seconds: seconds ? parseFloat(seconds) : 0,
      };
    }

    // Parse simple formats like "2 hours", "30 minutes", "1 day"
    const simpleMatch = input.match(
      /^(\d+(?:\.\d+)?)\s*(years?|months?|weeks?|days?|hours?|minutes?|seconds?|milliseconds?|ms|y|M|w|d|h|m|s)$/i
    );

    if (simpleMatch) {
      const [, amount, unit] = simpleMatch;
      const obj: DurationObject = {};
      const normalizedUnit = this.normalizeUnit(unit);
      obj[normalizedUnit as keyof DurationObject] = parseFloat(amount);
      return obj;
    }

    // If no match, assume milliseconds
    const parsed = parseFloat(input);
    return { milliseconds: isNaN(parsed) ? 0 : parsed };
  }

  private parseObject(obj: DurationObject): number {
    let milliseconds = 0;

    if (obj.years) milliseconds += obj.years * 365.25 * 24 * 60 * 60 * 1000;
    if (obj.months) milliseconds += obj.months * 30.44 * 24 * 60 * 60 * 1000;
    if (obj.weeks) milliseconds += obj.weeks * 7 * 24 * 60 * 60 * 1000;
    if (obj.days) milliseconds += obj.days * 24 * 60 * 60 * 1000;
    if (obj.hours) milliseconds += obj.hours * 60 * 60 * 1000;
    if (obj.minutes) milliseconds += obj.minutes * 60 * 1000;
    if (obj.seconds) milliseconds += obj.seconds * 1000;
    if (obj.milliseconds) milliseconds += obj.milliseconds;

    return milliseconds;
  }

  private normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      y: 'years',
      year: 'years',
      years: 'years',
      M: 'months',
      month: 'months',
      months: 'months',
      w: 'weeks',
      week: 'weeks',
      weeks: 'weeks',
      d: 'days',
      day: 'days',
      days: 'days',
      h: 'hours',
      hour: 'hours',
      hours: 'hours',
      m: 'minutes',
      minute: 'minutes',
      minutes: 'minutes',
      s: 'seconds',
      second: 'seconds',
      seconds: 'seconds',
      ms: 'milliseconds',
      millisecond: 'milliseconds',
      milliseconds: 'milliseconds',
    };
    return unitMap[unit.toLowerCase()] || unit;
  }

  // Getters
  asMilliseconds(): number {
    return this.ms;
  }

  asSeconds(): number {
    return this.ms / 1000;
  }

  asMinutes(): number {
    return this.ms / (1000 * 60);
  }

  asHours(): number {
    return this.ms / (1000 * 60 * 60);
  }

  asDays(): number {
    return this.ms / (1000 * 60 * 60 * 24);
  }

  asWeeks(): number {
    return this.ms / (1000 * 60 * 60 * 24 * 7);
  }

  asMonths(): number {
    return this.ms / (1000 * 60 * 60 * 24 * 30.44);
  }

  asYears(): number {
    return this.ms / (1000 * 60 * 60 * 24 * 365.25);
  }

  // Get individual components (return the originally parsed values)
  get years(): number {
    return this._years;
  }

  get months(): number {
    return this._months;
  }

  get weeks(): number {
    return this._weeks;
  }

  get days(): number {
    return this._days;
  }

  get hours(): number {
    return this._hours;
  }

  get minutes(): number {
    return this._minutes;
  }

  get seconds(): number {
    return this._seconds;
  }

  get milliseconds(): number {
    return this._milliseconds;
  }

  // Arithmetic operations
  add(amount: number | Duration | DurationObject | string): Duration {
    const other = amount instanceof Duration ? amount : new Duration(amount);
    return new Duration(this.ms + other.ms);
  }

  subtract(amount: number | Duration | DurationObject | string): Duration {
    const other = amount instanceof Duration ? amount : new Duration(amount);
    return new Duration(this.ms - other.ms);
  }

  multiply(factor: number): Duration {
    return new Duration(this.ms * factor);
  }

  divide(divisor: number): Duration {
    return new Duration(this.ms / divisor);
  }

  negate(): Duration {
    return new Duration(-this.ms);
  }

  abs(): Duration {
    return new Duration(Math.abs(this.ms));
  }

  // Comparison
  equals(other: Duration): boolean {
    return this.ms === other.ms;
  }

  isGreaterThan(other: Duration): boolean {
    return this.ms > other.ms;
  }

  isLessThan(other: Duration): boolean {
    return this.ms < other.ms;
  }

  isZero(): boolean {
    return this.ms === 0;
  }

  isNegative(): boolean {
    return this.ms < 0;
  }

  isPositive(): boolean {
    return this.ms > 0;
  }

  // Formatting
  toString(): string {
    return this.toISOString();
  }

  toISOString(): string {
    const abs = Math.abs(this.ms);
    const sign = this.ms < 0 ? '-' : '';

    const years = Math.floor(abs / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor(
      (abs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44)
    );
    const days = Math.floor((abs % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((abs % (1000 * 60)) / 1000);
    const milliseconds = abs % 1000;

    let result = sign + 'P';

    if (years > 0) result += `${years}Y`;
    if (months > 0) result += `${months}M`;
    if (days > 0) result += `${days}D`;

    if (hours > 0 || minutes > 0 || seconds > 0 || milliseconds > 0) {
      result += 'T';
      if (hours > 0) result += `${hours}H`;
      if (minutes > 0) result += `${minutes}M`;
      if (seconds > 0 || milliseconds > 0) {
        const totalSeconds = seconds + milliseconds / 1000;
        result += `${totalSeconds}S`;
      }
    }

    return result === sign + 'P' ? sign + 'P0D' : result;
  }

  toJSON(): string {
    return this.toISOString();
  }

  // Human readable format
  humanize(largest?: number): string {
    const abs = Math.abs(this.ms);
    const sign = this.ms < 0 ? '-' : '';

    const units = [
      { name: 'year', value: 1000 * 60 * 60 * 24 * 365.25 },
      { name: 'month', value: 1000 * 60 * 60 * 24 * 30.44 },
      { name: 'week', value: 1000 * 60 * 60 * 24 * 7 },
      { name: 'day', value: 1000 * 60 * 60 * 24 },
      { name: 'hour', value: 1000 * 60 * 60 },
      { name: 'minute', value: 1000 * 60 },
      { name: 'second', value: 1000 },
      { name: 'millisecond', value: 1 },
    ];

    const parts: string[] = [];
    let remaining = abs;

    for (const unit of units) {
      if (remaining >= unit.value) {
        const count = Math.floor(remaining / unit.value);
        parts.push(`${count} ${unit.name}${count !== 1 ? 's' : ''}`);
        remaining %= unit.value;

        if (largest && parts.length >= largest) {
          break;
        }
      }
    }

    if (parts.length === 0) {
      return '0 milliseconds';
    }

    const result = parts.join(', ');
    return sign + result;
  }

  // Convert to object
  toObject(): DurationObject {
    return {
      years: this.years,
      months: this.months,
      days: this.days,
      hours: this.hours,
      minutes: this.minutes,
      seconds: this.seconds,
      milliseconds: this.milliseconds,
    };
  }

  // Clone
  clone(): Duration {
    return new Duration(this.ms);
  }
}

export default {
  name: 'duration',
  version: '1.0.0',
  size: 4096,
  install(kairos, _utils) {
    // Add duration methods to instances
    kairos.extend({
      // Get duration from this date to another
      duration(other: any): Duration {
        const otherDate = kairos(other);
        const diff = (otherDate as any).valueOf() - (this as any).valueOf();
        return new Duration(diff);
      },

      // Get duration since this date
      durationSince(): Duration {
        const now = kairos();
        const diff = (now as any).valueOf() - (this as any).valueOf();
        return new Duration(diff);
      },

      // Get duration until this date
      durationUntil(): Duration {
        const now = kairos();
        const diff = (this as any).valueOf() - (now as any).valueOf();
        return new Duration(diff);
      },

      // Add duration to this date
      addDuration(duration: Duration | DurationObject | string): any {
        const dur = duration instanceof Duration ? duration : new Duration(duration);
        return this.add(dur.asMilliseconds(), 'milliseconds');
      },

      // Subtract duration from this date
      subtractDuration(duration: Duration | DurationObject | string): any {
        const dur = duration instanceof Duration ? duration : new Duration(duration);
        return this.subtract(dur.asMilliseconds(), 'milliseconds');
      },

      // Human readable time ago
      fromNow(): string {
        return this.durationSince().humanize();
      },

      // Human readable time until
      toNow(): string {
        return this.durationUntil().humanize();
      },
    });

    // Add static methods
    kairos.addStatic?.({
      duration(input?: number | Duration | DurationObject | string): Duration {
        return new Duration(input || 0);
      },

      // Create duration from specific values
      durationFromObject(obj: DurationObject): Duration {
        return new Duration(obj);
      },

      // Parse ISO duration string
      parseDuration(str: string): Duration {
        return new Duration(str);
      },

      // Create duration between two dates
      durationBetween(start: any, end: any): Duration {
        const startDate = kairos(start);
        const endDate = kairos(end);
        const diff = endDate.valueOf() - startDate.valueOf();
        return new Duration(diff);
      },
    });
  },
} as KairosPlugin;
