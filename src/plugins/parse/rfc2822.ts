import type { KairosPlugin } from '../../core/types/plugin.js';

export class RFC2822Parser {
  // RFC 2822 regex pattern
  static readonly RFC2822_REGEX =
    /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d{2}):(\d{2})(?::(\d{2}))?\s(?:(UT|GMT|[ECMP][SD]T|[A-Z])|([+-]\d{4}))$/;

  private static readonly MONTHS: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  private static readonly WEEKDAYS: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  private static readonly TIMEZONE_OFFSETS: Record<string, number> = {
    UT: 0,
    GMT: 0,
    EST: -5,
    EDT: -4,
    CST: -6,
    CDT: -5,
    MST: -7,
    MDT: -6,
    PST: -8,
    PDT: -7,
    // Military time zones
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, K: 10, L: 11, M: 12,
    N: -1, O: -2, P: -3, Q: -4, R: -5, S: -6, T: -7, U: -8, V: -9, W: -10, X: -11, Y: -12,
    Z: 0, // Zulu time (UTC)
  };

  parse(input: string): Date | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const trimmed = input.trim();
    const match = trimmed.match(RFC2822Parser.RFC2822_REGEX);

    if (!match) {
      return null;
    }

    const [, weekday, day, month, year, hour, minute, second, timezone, offset] = match;

    const parsedYear = parseInt(year, 10);
    const fullYear =
      parsedYear < 100 ? (parsedYear < 50 ? 2000 + parsedYear : 1900 + parsedYear) : parsedYear;

    const parsedDay = parseInt(day, 10);
    const parsedHour = parseInt(hour, 10);
    const parsedMinute = parseInt(minute, 10);
    const parsedSecond = second ? parseInt(second, 10) : 0;

    // Validate ranges
    if (parsedDay < 1 || parsedDay > 31) return null;
    if (parsedHour > 23) return null;
    if (parsedMinute > 59) return null;
    if (parsedSecond > 59) return null;

    const date = new Date(
      fullYear,
      RFC2822Parser.MONTHS[month],
      parsedDay,
      parsedHour,
      parsedMinute,
      parsedSecond,
      0
    );

    // Check if date was adjusted (e.g., day 32 became Feb 1)
    if (date.getDate() !== parsedDay || date.getMonth() !== RFC2822Parser.MONTHS[month] || date.getFullYear() !== fullYear) {
      return null;
    }

    // Handle timezone offset
    if (timezone) {
      const offsetMinutes = RFC2822Parser.TIMEZONE_OFFSETS[timezone] * 60;
      date.setMinutes(date.getMinutes() - offsetMinutes);
    } else if (offset) {
      const sign = offset[0] === '+' ? 1 : -1;
      const offsetHours = parseInt(offset.slice(1, 3), 10);
      const offsetMinutes = parseInt(offset.slice(3, 5), 10);
      const totalOffsetMinutes = sign * (offsetHours * 60 + offsetMinutes);
      date.setMinutes(date.getMinutes() - totalOffsetMinutes);
    }

    // Validate weekday if provided
    if (weekday) {
      const expectedWeekday = RFC2822Parser.WEEKDAYS[weekday];
      if (date.getDay() !== expectedWeekday) {
        console.warn(`RFC2822: Weekday mismatch. Expected ${weekday}, got ${date.getDay()}`);
      }
    }

    return date;
  }

  format(date: Date): string {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    // Get timezone offset
    const offset = -date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset >= 0 ? '+' : '-';
    const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}${String(offsetMinutes).padStart(2, '0')}`;

    return `${weekday}, ${day} ${month} ${year} ${hour}:${minute}:${second} ${offsetString}`;
  }
}

const parser = new RFC2822Parser();

export default {
  name: 'parse-rfc2822',
  version: '1.0.0',
  size: 2048,
  install(kairos) {
    // Add parsing support
    kairos.parseRFC2822 = (input: string) => {
      const parsed = parser.parse(input);
      if (parsed) {
        const instance = kairos(parsed);
        instance._isRFC2822 = true;
        return instance;
      }
      return null;
    };

    // Add validation support
    kairos.isValidRFC2822 = (input: string): boolean => {
      return parser.parse(input) !== null;
    };

    // Add formatting support
    kairos.formatRFC2822 = (input: any): string => {
      const date = kairos(input);
      return parser.format(date.toDate());
    };

    // Add loose parsing support
    kairos.parseRFC2822Loose = (input: string) => {
      // Normalize spacing and format variations
      const normalized = input
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/,\s*/g, ', ')
        .replace(/\s*([+-]\d{4})/, ' $1');
      
      const parsed = parser.parse(normalized);
      if (parsed) {
        const instance = kairos(parsed);
        instance._isRFC2822 = true;
        return instance;
      }
      return null;
    };

    // Add formatting support
    kairos.extend({
      toRFC2822(): string {
        return parser.format(this.toDate());
      },

      isRFC2822(): boolean {
        // Check if this date was created from RFC2822 parsing
        return (this as any)._isRFC2822 === true;
      },
    });

    // Register with main parse chain
    const originalParse = kairos.parse || ((input: string) => kairos(input));
    kairos.parse = (input: string) => {
      // Only try RFC2822 for strings that might match the pattern
      if (typeof input === 'string' && /^[A-Za-z]{3},?\s+\d{1,2}\s+[A-Za-z]{3}/.test(input)) {
        const rfc2822Result = parser.parse(input);
        if (rfc2822Result) {
          const instance = kairos(rfc2822Result);
          instance._isRFC2822 = true;
          return instance;
        }
      }
      // Fall back to original parser
      return originalParse(input);
    };
  },
} as KairosPlugin;
