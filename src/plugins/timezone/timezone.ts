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

      // Get offset
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
      const offset = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);

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

      return currentOffset < Math.max(janOffset, julOffset);
    } catch (error) {
      return false;
    }
  }

  // Get timezone offset in minutes
  static getOffset(date: Date, timezone: string): number {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
  }

  // Convert date to specific timezone
  static convertToTimezone(date: Date, timezone: string): Date {
    const normalizedTz = this.normalizeTimezone(timezone);
    return new Date(date.toLocaleString('en-US', { timeZone: normalizedTz }));
  }

  // Convert date from one timezone to another
  static convertTimezone(date: Date, fromTz: string, toTz: string): Date {
    const normalizedFromTz = this.normalizeTimezone(fromTz);
    const normalizedToTz = this.normalizeTimezone(toTz);

    // Create a date as if it's in the source timezone
    const sourceDate = new Date(date.toLocaleString('en-US', { timeZone: normalizedFromTz }));

    // Convert to target timezone
    return new Date(sourceDate.toLocaleString('en-US', { timeZone: normalizedToTz }));
  }

  // Normalize timezone name
  static normalizeTimezone(timezone: string): string {
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
        (instance as any)._isUTC = true;
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
        // Check if this instance was created with UTC flag
        return !!(this as any)._isUTC || this.offset() === 0;
      },
      
      // Convert to local time
      local(): any {
        // If already in local time, return clone
        if (!this.isUTC()) {
          return this.clone();
        }
        // Convert from UTC to local
        const localDate = new Date(this.toDate().getTime());
        const instance = kairos(localDate);
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
