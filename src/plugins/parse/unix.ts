import type { KairosPlugin } from '../../core/types/plugin.js';

export class UnixTimestampParser {
  // Unix timestamp patterns
  static readonly UNIX_SECONDS_REGEX = /^\d{10}$/;
  static readonly UNIX_MILLISECONDS_REGEX = /^\d{13}$/;
  static readonly UNIX_MICROSECONDS_REGEX = /^\d{16}$/;
  static readonly UNIX_NANOSECONDS_REGEX = /^\d{19}$/;

  parse(input: string | number): Date | null {
    if (input === null || input === undefined) {
      return null;
    }

    let timestamp: number;

    if (typeof input === 'number') {
      timestamp = input;
    } else if (typeof input === 'string') {
      // Check if it's a valid numeric string
      if (!/^\d+$/.test(input)) {
        return null;
      }
      timestamp = parseInt(input, 10);
    } else {
      return null;
    }

    // Determine the unit based on the magnitude
    let date: Date;

    if (timestamp < 10000000000) {
      // Seconds (before year 2286)
      date = new Date(timestamp * 1000);
    } else if (timestamp < 10000000000000) {
      // Milliseconds (before year 2286)
      date = new Date(timestamp);
    } else if (timestamp < 10000000000000000) {
      // Microseconds
      date = new Date(Math.floor(timestamp / 1000));
    } else {
      // Nanoseconds
      date = new Date(Math.floor(timestamp / 1000000));
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      return null;
    }

    // Check if the date is in a reasonable range (1970-2099)
    const year = date.getFullYear();
    if (year < 1970 || year >= 2100) {
      return null;
    }

    return date;
  }

  toUnix(
    date: Date,
    unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds' = 'seconds'
  ): number {
    const milliseconds = date.getTime();

    switch (unit) {
      case 'seconds':
        return Math.floor(milliseconds / 1000);
      case 'milliseconds':
        return milliseconds;
      case 'microseconds':
        return milliseconds * 1000;
      case 'nanoseconds':
        return milliseconds * 1000000;
      default:
        return Math.floor(milliseconds / 1000);
    }
  }

  isUnixTimestamp(input: string | number): boolean {
    if (typeof input === 'number') {
      return input > 0 && input < 10000000000000;
    }

    if (typeof input === 'string') {
      return (
        UnixTimestampParser.UNIX_SECONDS_REGEX.test(input) ||
        UnixTimestampParser.UNIX_MILLISECONDS_REGEX.test(input) ||
        UnixTimestampParser.UNIX_MICROSECONDS_REGEX.test(input) ||
        UnixTimestampParser.UNIX_NANOSECONDS_REGEX.test(input)
      );
    }

    return false;
  }
}

const parser = new UnixTimestampParser();

export default {
  name: 'parse-unix',
  version: '1.0.0',
  size: 1536,
  install(kairos) {
    // Static methods for Unix timestamps
    kairos.unix = (timestamp: number | string): any => {
      const parsed = parser.parse(timestamp);
      return parsed ? kairos(parsed) : null;
    };

    // eslint-disable-next-line @typescript-eslint/unbound-method
    kairos.fromUnix = kairos.unix;

    kairos.isUnixTimestamp = (input: string | number) => parser.isUnixTimestamp(input);

    // Instance methods
    kairos.extend({
      unix(unit?: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'): number {
        return parser.toUnix(this.toDate(), unit);
      },

      toUnix(unit?: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'): number {
        return parser.toUnix(this.toDate(), unit);
      },

      fromNow(): string {
        const now = Date.now();
        const timestamp = this.toDate().getTime();
        const diff = now - timestamp;
        const seconds = Math.floor(Math.abs(diff) / 1000);

        if (seconds < 60) {
          return diff > 0 ? `${seconds} seconds ago` : `in ${seconds} seconds`;
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
          return diff > 0 ? `${minutes} minutes ago` : `in ${minutes} minutes`;
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
          return diff > 0 ? `${hours} hours ago` : `in ${hours} hours`;
        }

        const days = Math.floor(hours / 24);
        if (days < 30) {
          return diff > 0 ? `${days} days ago` : `in ${days} days`;
        }

        const months = Math.floor(days / 30);
        if (months < 12) {
          return diff > 0 ? `${months} months ago` : `in ${months} months`;
        }

        const years = Math.floor(months / 12);
        return diff > 0 ? `${years} years ago` : `in ${years} years`;
      },
    });

    // Register with main parse chain
    const originalParse = kairos.parse || ((input: any) => kairos(input));
    kairos.parse = (input: any) => {
      // Try Unix timestamp first if it looks like one
      if (parser.isUnixTimestamp(input)) {
        const unixResult = parser.parse(input);
        if (unixResult) {
          return kairos(unixResult);
        }
      }
      // Fall back to original parser
      return originalParse(input);
    };
  },
} as KairosPlugin;
