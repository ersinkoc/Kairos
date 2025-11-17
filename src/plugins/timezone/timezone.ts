import type { KairosPlugin } from '../../core/types/plugin.js';

export interface TimezoneInfo {
  name: string;
  abbreviation: string;
  offset: number; // in minutes
  dst: boolean;
}

export class TimezoneManager {
  private static readonly TIMEZONE_MAP: Record<string, string> = {
    EST: 'America/New_York',
    PST: 'America/Los_Angeles',
    CST: 'America/Chicago',
    MST: 'America/Denver',
    GMT: 'Europe/London',
    UTC: 'UTC',
    CET: 'Europe/Paris',
    JST: 'Asia/Tokyo',
    IST: 'Asia/Kolkata',
    CST_CN: 'Asia/Shanghai',
    AEST: 'Australia/Sydney',
  };

  // Get timezone info for a date
  static getTimezoneInfo(date: Date, timezone?: string): TimezoneInfo {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'short',
      });

      const parts = formatter.formatToParts(date);
      const timeZoneName = parts.find((part) => part.type === 'timeZoneName')?.value || '';

      // Get offset using Intl.DateTimeFormat to extract components properly
      const offset = this.getOffset(date, tz);

      return {
        name: tz,
        abbreviation: timeZoneName,
        offset,
        dst: this.isDST(date, tz),
      };
    } catch (error) {
      return {
        name: 'UTC',
        abbreviation: 'UTC',
        offset: 0,
        dst: false,
      };
    }
  }

  // Check if date is in daylight saving time
  static isDST(date: Date, timezone?: string): boolean {
    const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    try {
      const jan = new Date(date.getFullYear(), 0, 1);
      const jul = new Date(date.getFullYear(), 6, 1);

      const janOffset = this.getOffset(jan, tz);
      const julOffset = this.getOffset(jul, tz);
      const currentOffset = this.getOffset(date, tz);

      // DST has a greater offset (less negative, more positive) than standard time
      // For example: EDT (UTC-4, offset=-240) > EST (UTC-5, offset=-300)
      return currentOffset > Math.min(janOffset, julOffset);
    } catch (error) {
      return false;
    }
  }

  // Get timezone offset in minutes
  static getOffset(date: Date, timezone: string): number {
    // Use Intl.DateTimeFormat to properly extract date components in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);

    // BUG FIX (BUG-CRIT-002): Validate all parseInt results to prevent NaN values
    const tzYearStr = parts.find((p) => p.type === 'year')?.value || '0';
    const tzYear = parseInt(tzYearStr, 10);
    if (isNaN(tzYear)) {
      throw new Error(`Invalid timezone year value from Intl.DateTimeFormat: ${tzYearStr}`);
    }

    const tzMonthStr = parts.find((p) => p.type === 'month')?.value || '0';
    const tzMonthParsed = parseInt(tzMonthStr, 10);
    if (isNaN(tzMonthParsed)) {
      throw new Error(`Invalid timezone month value from Intl.DateTimeFormat: ${tzMonthStr}`);
    }
    const tzMonth = tzMonthParsed - 1;

    const tzDayStr = parts.find((p) => p.type === 'day')?.value || '0';
    const tzDay = parseInt(tzDayStr, 10);
    if (isNaN(tzDay)) {
      throw new Error(`Invalid timezone day value from Intl.DateTimeFormat: ${tzDayStr}`);
    }

    const tzHourStr = parts.find((p) => p.type === 'hour')?.value || '0';
    const tzHour = parseInt(tzHourStr, 10);
    if (isNaN(tzHour)) {
      throw new Error(`Invalid timezone hour value from Intl.DateTimeFormat: ${tzHourStr}`);
    }

    const tzMinuteStr = parts.find((p) => p.type === 'minute')?.value || '0';
    const tzMinute = parseInt(tzMinuteStr, 10);
    if (isNaN(tzMinute)) {
      throw new Error(`Invalid timezone minute value from Intl.DateTimeFormat: ${tzMinuteStr}`);
    }

    const tzSecondStr = parts.find((p) => p.type === 'second')?.value || '0';
    const tzSecond = parseInt(tzSecondStr, 10);
    if (isNaN(tzSecond)) {
      throw new Error(`Invalid timezone second value from Intl.DateTimeFormat: ${tzSecondStr}`);
    }

    // Create a UTC timestamp for the timezone's local time
    const tzTime = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond);

    // The offset is the difference between the timezone's UTC representation and the original UTC timestamp
    // Positive offset means timezone is ahead of UTC (east), negative means behind UTC (west)
    const offset = (tzTime - date.getTime()) / (1000 * 60);

    return offset;
  }

  // Convert date to specific timezone
  static convertToTimezone(date: Date, timezone: string): Date {
    const normalizedTz = this.normalizeTimezone(timezone);

    // Get the date components in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: normalizedTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);

    // BUG FIX (BUG-CRIT-002): Validate all parseInt results to prevent NaN values
    const yearStr = parts.find((p) => p.type === 'year')?.value || '0';
    const year = parseInt(yearStr, 10);
    if (isNaN(year)) {
      throw new Error(`Invalid year value from Intl.DateTimeFormat: ${yearStr}`);
    }

    const monthStr = parts.find((p) => p.type === 'month')?.value || '0';
    const monthParsed = parseInt(monthStr, 10);
    if (isNaN(monthParsed)) {
      throw new Error(`Invalid month value from Intl.DateTimeFormat: ${monthStr}`);
    }
    const month = monthParsed - 1;

    const dayStr = parts.find((p) => p.type === 'day')?.value || '0';
    const day = parseInt(dayStr, 10);
    if (isNaN(day)) {
      throw new Error(`Invalid day value from Intl.DateTimeFormat: ${dayStr}`);
    }

    const hourStr = parts.find((p) => p.type === 'hour')?.value || '0';
    const hour = parseInt(hourStr, 10);
    if (isNaN(hour)) {
      throw new Error(`Invalid hour value from Intl.DateTimeFormat: ${hourStr}`);
    }

    const minuteStr = parts.find((p) => p.type === 'minute')?.value || '0';
    const minute = parseInt(minuteStr, 10);
    if (isNaN(minute)) {
      throw new Error(`Invalid minute value from Intl.DateTimeFormat: ${minuteStr}`);
    }

    const secondStr = parts.find((p) => p.type === 'second')?.value || '0';
    const second = parseInt(secondStr, 10);
    if (isNaN(second)) {
      throw new Error(`Invalid second value from Intl.DateTimeFormat: ${secondStr}`);
    }

    // Create a new local date with these components
    return new Date(year, month, day, hour, minute, second, date.getMilliseconds());
  }

  // Convert date from one timezone to another
  static convertTimezone(date: Date, fromTz: string, toTz: string): Date {
    const normalizedFromTz = this.normalizeTimezone(fromTz);
    const normalizedToTz = this.normalizeTimezone(toTz);

    // Interpret the date as being in the source timezone
    // We need to find what UTC time corresponds to this local time in fromTz
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const ms = date.getMilliseconds();

    // Create a date in UTC with these components, then adjust for the source timezone offset
    const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
    const fromOffset = this.getOffset(utcDate, normalizedFromTz);

    // Adjust to get the correct UTC time
    const correctUTC = new Date(utcDate.getTime() - fromOffset * 60 * 1000);

    // Now convert to target timezone
    return this.convertToTimezone(correctUTC, normalizedToTz);
  }

  // Normalize timezone name
  static normalizeTimezone(timezone: string): string {
    if (!timezone || typeof timezone !== 'string') {
      return 'UTC'; // Default to UTC for invalid input
    }
    return this.TIMEZONE_MAP[timezone.toUpperCase()] || timezone;
  }

  // Get all available timezones
  static getAvailableTimezones(): string[] {
    try {
      return (Intl as any).supportedValuesOf('timeZone');
    } catch (error) {
      // Fallback list of common timezones
      return [
        'UTC',
        'America/New_York',
        'America/Los_Angeles',
        'America/Chicago',
        'America/Denver',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Kolkata',
        'Australia/Sydney',
        'Pacific/Auckland',
      ];
    }
  }

  // Get common timezone abbreviations
  static getCommonTimezones(): Record<string, string> {
    return { ...this.TIMEZONE_MAP };
  }

  // Format timezone offset
  static formatOffset(offset: number): string {
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';

    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Parse timezone offset
  static parseOffset(offsetStr: string): number {
    const match = offsetStr.match(/^([+-])(\d{1,2}):?(\d{2})$/);
    if (!match) return 0;

    const [, sign, hours, minutes] = match;
    const offset = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    return sign === '-' ? -offset : offset;
  }

  // Get timezone from offset
  static getTimezoneFromOffset(offset: number): string[] {
    const availableTimezones = this.getAvailableTimezones();
    const testDate = new Date();

    return availableTimezones.filter((tz) => {
      try {
        const tzOffset = this.getOffset(testDate, tz);
        return Math.abs(tzOffset - offset) < 1; // Allow 1 minute tolerance
      } catch (error) {
        return false;
      }
    });
  }
}

export default {
  name: 'timezone',
  version: '1.0.0',
  size: 2048,
  install(kairos) {
    // Add timezone methods to instances
    kairos.extend({
      // Get timezone info
      timezone(tz?: string): TimezoneInfo {
        return TimezoneManager.getTimezoneInfo(this.toDate(), tz);
      },

      // Convert to specific timezone
      tz(timezone: string): any {
        const converted = TimezoneManager.convertToTimezone(this.toDate(), timezone);
        const instance = kairos(converted);
        if (timezone === 'UTC') {
          (instance as any)._isUTC = true;
        }
        return instance;
      },

      // Convert to UTC
      utc(): any {
        const instance = this.tz('UTC');
        instance._isUTC = true;
        return instance;
      },

      // Get timezone offset
      utcOffset(offset?: number): number | any {
        if (offset === undefined) {
          return -this.toDate().getTimezoneOffset();
        }
        const current = -this.toDate().getTimezoneOffset();
        const diff = offset - current;
        return this.add(diff, 'minutes');
      },

      // Check if in daylight saving time
      isDST(): boolean {
        return TimezoneManager.isDST(this.toDate());
      },

      // Get timezone abbreviation

      // Check if in UTC
      isUTC(): boolean {
        // Only check if this instance was created with UTC flag
        // Don't check offset() === 0 because local time can have 0 offset in UTC timezone
        return !!(this as any)._isUTC;
      },

      // Convert to local time
      local(): any {
        // If already in local time, return clone
        if (!this.isUTC()) {
          return this.clone();
        }
        // Convert from UTC to local time
        // Create a new instance without the UTC flag
        const instance = kairos(this.toDate());
        delete (instance as any)._isUTC;
        return instance;
      },
    });

    // Add static methods
    kairos.addStatic?.({
      // Get timezone info
      getTimezoneInfo(date: any, timezone?: string): TimezoneInfo {
        const d = kairos(date);
        return TimezoneManager.getTimezoneInfo(d.toDate(), timezone);
      },

      // Convert between timezones
      convertTimezone(date: any, fromTz: string, toTz: string): any {
        const d = kairos(date);
        const converted = TimezoneManager.convertTimezone(d.toDate(), fromTz, toTz);
        return kairos(converted);
      },

      // Get available timezones
      getAvailableTimezones(): string[] {
        return TimezoneManager.getAvailableTimezones();
      },

      // Get common timezones
      getCommonTimezones(): Record<string, string> {
        return TimezoneManager.getCommonTimezones();
      },

      // Parse timezone offset
      parseTimezoneOffset(offsetStr: string): number {
        return TimezoneManager.parseOffset(offsetStr);
      },

      // Format timezone offset
      formatTimezoneOffset(offset: number): string {
        return TimezoneManager.formatOffset(offset);
      },

      // Get timezones for specific offset
      getTimezonesForOffset(offset: number): string[] {
        return TimezoneManager.getTimezoneFromOffset(offset);
      },

      // Create date in specific timezone
      inTimezone(input: any, timezone: string): any {
        const date = kairos(input);
        return date.tz(timezone);
      },
    });
  },
} as KairosPlugin;
