import type { KairosPlugin } from '../../core/types/plugin.js';

export class ISOParser {
  static readonly ISO_REGEX =
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?(?:Z|([+-]\d{2}):?(\d{2}))?)?$/;
  static readonly DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
  // private static readonly _TIME_REGEX = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/;

  parse(input: string): Date | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const trimmed = input.trim();

    // Try full ISO format first
    const isoMatch = trimmed.match(ISOParser.ISO_REGEX);
    if (isoMatch) {
      return this.parseISOMatch(isoMatch);
    }

    // Try date-only format
    const dateMatch = trimmed.match(ISOParser.DATE_ONLY_REGEX);
    if (dateMatch) {
      return this.parseDateOnly(dateMatch);
    }

    return null;
  }

  private parseISOMatch(match: RegExpMatchArray): Date {
    const [
      fullMatch,
      year,
      month,
      day,
      hour = '0',
      minute = '0',
      second = '0',
      millisecond = '0',
      tzHour,
      tzMinute,
    ] = match;

    // Check if the input has a 'Z' suffix (UTC indicator)
    const hasZSuffix = fullMatch.endsWith('Z');

    // If Z suffix is present, create date in UTC
    if (hasZSuffix) {
      return new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(minute, 10),
          parseInt(second, 10),
          parseInt(millisecond.padEnd(3, '0'), 10)
        )
      );
    }

    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10),
      parseInt(millisecond.padEnd(3, '0'), 10)
    );

    // Handle timezone offset (e.g., +05:30 or -05:30)
    if (tzHour !== undefined && tzMinute !== undefined) {
      const hours = parseInt(tzHour, 10);
      const minutes = parseInt(tzMinute, 10);
      // Apply sign to both hours and minutes
      const offsetMinutes = hours * 60 + (hours < 0 ? -minutes : minutes);
      date.setMinutes(date.getMinutes() - offsetMinutes);
    }

    return date;
  }

  private parseDateOnly(match: RegExpMatchArray): Date {
    const [, year, month, day] = match;

    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  // Format date to ISO string
  format(date: Date, includeTime: boolean = true): string {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    if (!includeTime) {
      return `${year}-${month}-${day}`;
    }

    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const millisecond = date.getMilliseconds().toString().padStart(3, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`;
  }

  // Validate ISO format
  isValid(input: string): boolean {
    return this.parse(input) !== null;
  }
}

export default {
  name: 'parse-iso',
  version: '1.0.0',
  size: 1024,
  patterns: [ISOParser.ISO_REGEX, ISOParser.DATE_ONLY_REGEX],
  install(kairos, _utils) {
    const parser = new ISOParser();

    // Add parsing capability to static methods
    kairos.addStatic?.({
      parseISO(input: string): any {
        const parsed = parser.parse(input);
        return parsed ? kairos(parsed) : null;
      },

      isValidISO(input: string): boolean {
        return parser.isValid(input);
      },
    });

    // Add instance methods
    kairos.extend({
      toISO(includeTime: boolean = true): string {
        return parser.format(this.toDate(), includeTime);
      },
    });
  },
} as KairosPlugin;
