import type { KairosPlugin } from '../../core/types/plugin.js';

export class TokenFormatter {
  static readonly TOKENS: Record<string, (date: Date, locale?: any) => string> = {
    // Year
    YYYY: (date) => date.getFullYear().toString(),
    YY: (date) => (date.getFullYear() % 100).toString().padStart(2, '0'),
    Y: (date) => date.getFullYear().toString(),

    // Month
    MMMM: (date, locale) =>
      locale?.months?.[date.getMonth()] || TokenFormatter.getMonthName(date.getMonth()),
    MMM: (date, locale) =>
      locale?.monthsShort?.[date.getMonth()] || TokenFormatter.getMonthShortName(date.getMonth()),
    MM: (date) => (date.getMonth() + 1).toString().padStart(2, '0'),
    M: (date) => (date.getMonth() + 1).toString(),

    // Day of month
    DD: (date) => date.getDate().toString().padStart(2, '0'),
    D: (date) => date.getDate().toString(),
    Do: (date, locale) => {
      const day = date.getDate();
      const ordinal = locale?.ordinal?.(day) || TokenFormatter.getOrdinal(day);
      return ordinal;
    },

    // Day of week
    dddd: (date, locale) =>
      locale?.weekdays?.[date.getDay()] || TokenFormatter.getWeekdayName(date.getDay()),
    ddd: (date, locale) =>
      locale?.weekdaysShort?.[date.getDay()] || TokenFormatter.getWeekdayShortName(date.getDay()),
    dd: (date, locale) =>
      locale?.weekdaysMin?.[date.getDay()] || TokenFormatter.getWeekdayMinName(date.getDay()),
    d: (date) => date.getDay().toString(),

    // Hour
    HH: (date) => date.getHours().toString().padStart(2, '0'),
    H: (date) => date.getHours().toString(),
    hh: (date) => {
      const hour = date.getHours();
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return hour12.toString().padStart(2, '0');
    },
    h: (date) => {
      const hour = date.getHours();
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return hour12.toString();
    },

    // Minute
    mm: (date) => date.getMinutes().toString().padStart(2, '0'),
    m: (date) => date.getMinutes().toString(),

    // Second
    ss: (date) => date.getSeconds().toString().padStart(2, '0'),
    s: (date) => date.getSeconds().toString(),

    // Millisecond
    SSS: (date) => date.getMilliseconds().toString().padStart(3, '0'),
    SS: (date) =>
      Math.floor(date.getMilliseconds() / 10)
        .toString()
        .padStart(2, '0'),
    S: (date) => Math.floor(date.getMilliseconds() / 100).toString(),

    // AM/PM
    A: (date, locale) => {
      const hour = date.getHours();
      return locale?.meridiem?.(hour, date.getMinutes(), false) || (hour < 12 ? 'AM' : 'PM');
    },
    a: (date, locale) => {
      const hour = date.getHours();
      return locale?.meridiem?.(hour, date.getMinutes(), true) || (hour < 12 ? 'am' : 'pm');
    },

    // Timezone
    Z: (date) => {
      const offset = -date.getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    },
    ZZ: (date) => {
      const offset = -date.getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      const sign = offset >= 0 ? '+' : '-';
      return `${sign}${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;
    },

    // Unix timestamp
    X: (date) => Math.floor(date.getTime() / 1000).toString(),
    x: (date) => date.getTime().toString(),

    // Week of year (simplified)
    ww: (date) => TokenFormatter.getWeekOfYear(date).toString().padStart(2, '0'),
    w: (date) => TokenFormatter.getWeekOfYear(date).toString(),

    // Day of year
    DDD: (date) => TokenFormatter.getDayOfYear(date).toString().padStart(3, '0'),
    DDDD: (date) => TokenFormatter.getDayOfYear(date).toString(),

    // Quarter
    Q: (date) => Math.floor(date.getMonth() / 3 + 1).toString(),
    Qo: (date, locale) => {
      const quarter = Math.floor(date.getMonth() / 3 + 1);
      const ordinal = locale?.ordinal?.(quarter) || TokenFormatter.getOrdinal(quarter);
      return ordinal;
    },
  };

  format(date: Date, template: string, locale?: any): string {
    if (!date || !template) {
      return '';
    }

    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Sort tokens by length (longest first) to avoid partial matches
    const tokenKeys = Object.keys(TokenFormatter.TOKENS).sort((a, b) => b.length - a.length);

    let result = template;

    for (const token of tokenKeys) {
      // Escape special regex characters and use global replace without word boundaries
      const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedToken, 'g');
      result = result.replace(regex, TokenFormatter.TOKENS[token](date, locale));
    }

    return result;
  }

  private static getMonthName(month: number): string {
    const names = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return names[month] || '';
  }

  private static getMonthShortName(month: number): string {
    const names = [
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
    return names[month] || '';
  }

  private static getWeekdayName(weekday: number): string {
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[weekday] || '';
  }

  private static getWeekdayShortName(weekday: number): string {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return names[weekday] || '';
  }

  private static getWeekdayMinName(weekday: number): string {
    const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return names[weekday] || '';
  }

  private static getOrdinal(n: number): string {
    if (n >= 11 && n <= 13) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  }

  private static getWeekOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }

  private static getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay) + 1;
  }
}

export default {
  name: 'format-tokens',
  version: '1.0.0',
  size: 2048,
  tokens: TokenFormatter.TOKENS,
  install(kairos, _utils) {
    const formatter = new TokenFormatter();

    // Enhanced format method
    kairos.extend({
      format(template: string = 'YYYY-MM-DD'): string {
        // Check if the date is valid first
        if (!this.isValid()) {
          return 'Invalid Date';
        }

        // If this is a UTC instance and we're using basic template, use core format method
        if ((this as any)._isUTC && /^[YMDHmsS\-: ]+$/.test(template)) {
          // Use core format method for UTC instances with basic templates
          const date = this.toDate();
          const year = date.getUTCFullYear();
          const month = date.getUTCMonth() + 1;
          const day = date.getUTCDate();
          const hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          const seconds = date.getUTCSeconds();

          return template
            .replace(/YYYY/g, year.toString())
            .replace(/MM/g, month.toString().padStart(2, '0'))
            .replace(/DD/g, day.toString().padStart(2, '0'))
            .replace(/HH/g, hours.toString().padStart(2, '0'))
            .replace(/mm/g, minutes.toString().padStart(2, '0'))
            .replace(/ss/g, seconds.toString().padStart(2, '0'));
        }

        const currentLocale = kairos.locales?.[kairos.currentLocale || 'en'];
        return formatter.format(this.toDate(), template, currentLocale);
      },

      // Common format shortcuts
      toDateString(): string {
        return this.format('YYYY-MM-DD');
      },

      toTimeString(): string {
        return this.format('HH:mm:ss');
      },

      toDateTimeString(): string {
        return this.format('YYYY-MM-DD HH:mm:ss');
      },

      toLongDateString(): string {
        return this.format('dddd, MMMM Do, YYYY');
      },

      toShortDateString(): string {
        return this.format('MMM D, YYYY');
      },

      toTimeStringWithAMPM(): string {
        return this.format('h:mm A');
      },
    });

    // Add static formatting methods
    kairos.addStatic?.({
      formatDate(date: any, template: string): string {
        const instance = kairos(date);
        return instance.format(template);
      },

      getAvailableTokens(): string[] {
        return Object.keys(TokenFormatter.TOKENS);
      },
    });
  },
} as KairosPlugin;
