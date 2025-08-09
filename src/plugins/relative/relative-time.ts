import type { KairosPlugin, KairosStatic, KairosInstance } from '../../core/types/plugin.js';

interface RelativeTimeOptions {
  locale?: string;
  numeric?: 'auto' | 'always';
  style?: 'long' | 'short' | 'narrow';
}

interface RelativeTimeLocale {
  future: string;
  past: string;
  s: string;
  m: string;
  mm: string;
  h: string;
  hh: string;
  d: string;
  dd: string;
  M: string;
  MM: string;
  y: string;
  yy: string;
}

const defaultLocale: RelativeTimeLocale = {
  future: 'in %s',
  past: '%s ago',
  s: 'a few seconds',
  m: 'a minute',
  mm: '%d minutes',
  h: 'an hour',
  hh: '%d hours',
  d: 'a day',
  dd: '%d days',
  M: 'a month',
  MM: '%d months',
  y: 'a year',
  yy: '%d years',
};

const locales: Record<string, RelativeTimeLocale> = {
  en: defaultLocale,
  'en-US': defaultLocale,
  'en-GB': defaultLocale,
  de: {
    future: 'in %s',
    past: 'vor %s',
    s: 'ein paar Sekunden',
    m: 'eine Minute',
    mm: '%d Minuten',
    h: 'eine Stunde',
    hh: '%d Stunden',
    d: 'ein Tag',
    dd: '%d Tage',
    M: 'ein Monat',
    MM: '%d Monate',
    y: 'ein Jahr',
    yy: '%d Jahre',
  },
  'de-DE': {
    future: 'in %s',
    past: 'vor %s',
    s: 'ein paar Sekunden',
    m: 'eine Minute',
    mm: '%d Minuten',
    h: 'eine Stunde',
    hh: '%d Stunden',
    d: 'ein Tag',
    dd: '%d Tage',
    M: 'ein Monat',
    MM: '%d Monate',
    y: 'ein Jahr',
    yy: '%d Jahre',
  },
  tr: {
    future: '%s içinde',
    past: '%s önce',
    s: 'birkaç saniye',
    m: 'bir dakika',
    mm: '%d dakika',
    h: 'bir saat',
    hh: '%d saat',
    d: 'bir gün',
    dd: '%d gün',
    M: 'bir ay',
    MM: '%d ay',
    y: 'bir yıl',
    yy: '%d yıl',
  },
  'tr-TR': {
    future: '%s içinde',
    past: '%s önce',
    s: 'birkaç saniye',
    m: 'bir dakika',
    mm: '%d dakika',
    h: 'bir saat',
    hh: '%d saat',
    d: 'bir gün',
    dd: '%d gün',
    M: 'bir ay',
    MM: '%d ay',
    y: 'bir yıl',
    yy: '%d yıl',
  },
  ja: {
    future: '%s後',
    past: '%s前',
    s: '数秒',
    m: '1分',
    mm: '%d分',
    h: '1時間',
    hh: '%d時間',
    d: '1日',
    dd: '%d日',
    M: '1ヶ月',
    MM: '%dヶ月',
    y: '1年',
    yy: '%d年',
  },
  'ja-JP': {
    future: '%s後',
    past: '%s前',
    s: '数秒',
    m: '1分',
    mm: '%d分',
    h: '1時間',
    hh: '%d時間',
    d: '1日',
    dd: '%d日',
    M: '1ヶ月',
    MM: '%dヶ月',
    y: '1年',
    yy: '%d年',
  },
};

class RelativeTimeCalculator {
  private locale: RelativeTimeLocale;

  constructor(locale = 'en') {
    this.locale = locales[locale] || locales[locale.split('-')[0]] || defaultLocale;
  }

  format(diff: number, withoutSuffix = false): string {
    const abs = Math.abs(diff);
    const seconds = Math.round(abs / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.436875); // Average month length
    const years = Math.round(days / 365.25); // Account for leap years

    let result: string;

    if (seconds < 45) {
      result = this.locale.s;
    } else if (seconds < 90) {
      result = this.locale.m;
    } else if (minutes < 45) {
      result = this.locale.mm.replace('%d', minutes.toString());
    } else if (minutes < 90) {
      result = this.locale.h;
    } else if (hours < 22) {
      result = this.locale.hh.replace('%d', hours.toString());
    } else if (hours < 36) {
      result = this.locale.d;
    } else if (days < 26) {
      result = this.locale.dd.replace('%d', days.toString());
    } else if (days < 46) {
      result = this.locale.M;
    } else if (days < 320) {
      result = this.locale.MM.replace('%d', months.toString());
    } else if (days < 548) {
      result = this.locale.y;
    } else {
      result = this.locale.yy.replace('%d', years.toString());
    }

    if (withoutSuffix) {
      return result;
    }

    const template = diff > 0 ? this.locale.future : this.locale.past;
    return template.replace('%s', result);
  }

  formatNative(diff: number, locale = 'en', options: RelativeTimeOptions = {}): string {
    // Use native Intl.RelativeTimeFormat if available
    if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
      const rtf = new Intl.RelativeTimeFormat(locale, {
        numeric: options.numeric || 'auto',
        style: options.style || 'long',
      });

      const abs = Math.abs(diff);
      const seconds = abs / 1000;
      const minutes = seconds / 60;
      const hours = minutes / 60;
      const days = hours / 24;
      const weeks = days / 7;
      const months = days / 30.436875;
      const years = days / 365.25;

      const sign = diff > 0 ? 1 : -1;

      if (years >= 1) {
        return rtf.format(sign * Math.round(years), 'year');
      }
      if (months >= 1) {
        return rtf.format(sign * Math.round(months), 'month');
      }
      if (weeks >= 1) {
        return rtf.format(sign * Math.round(weeks), 'week');
      }
      if (days >= 1) {
        return rtf.format(sign * Math.round(days), 'day');
      }
      if (hours >= 1) {
        return rtf.format(sign * Math.round(hours), 'hour');
      }
      if (minutes >= 1) {
        return rtf.format(sign * Math.round(minutes), 'minute');
      }
      return rtf.format(sign * Math.round(seconds), 'second');
    }

    // Fallback to custom implementation
    return this.format(diff);
  }
}

const relativeTimePlugin: KairosPlugin = {
  name: 'relativeTime',

  install(kairos: KairosStatic) {
    // Add instance methods
    kairos.extend({
      fromNow(withoutSuffix = false): string {
        const now = Date.now();
        const thisTime = this.valueOf() as number;
        const diff = thisTime - now;
        const calculator = new RelativeTimeCalculator();
        return calculator.format(diff, withoutSuffix);
      },

      from(other: KairosInstance, withoutSuffix = false): string {
        const thisTime = this.valueOf() as number;
        const otherTime = other.valueOf();
        const diff = thisTime - otherTime;
        const calculator = new RelativeTimeCalculator();
        return calculator.format(diff, withoutSuffix);
      },

      toNow(withoutSuffix = false): string {
        const now = Date.now();
        const thisTime = this.valueOf() as number;
        const diff = now - thisTime;
        const calculator = new RelativeTimeCalculator();
        return calculator.format(diff, withoutSuffix);
      },

      to(other: KairosInstance, withoutSuffix = false): string {
        const thisTime = this.valueOf() as number;
        const otherTime = other.valueOf();
        const diff = otherTime - thisTime;
        const calculator = new RelativeTimeCalculator();
        return calculator.format(diff, withoutSuffix);
      },

      humanize(withSuffix = false): string {
        const calculator = new RelativeTimeCalculator();
        const value = this.valueOf() as number;
        return calculator.format(value, !withSuffix);
      },

      // Native Intl.RelativeTimeFormat support
      fromNowNative(locale = 'en', options?: RelativeTimeOptions): string {
        const now = Date.now();
        const thisTime = this.valueOf() as number;
        const diff = thisTime - now;
        const calculator = new RelativeTimeCalculator();
        return calculator.formatNative(diff, locale, options);
      },

      toNowNative(locale = 'en', options?: RelativeTimeOptions): string {
        const now = Date.now();
        const thisTime = this.valueOf() as number;
        const diff = now - thisTime;
        const calculator = new RelativeTimeCalculator();
        return calculator.formatNative(diff, locale, options);
      },
    });

    // Add static methods
    kairos.addStatic({
      relativeTime: {
        registerLocale(name: string, locale: RelativeTimeLocale): void {
          locales[name] = locale;
        },

        getLocale(name: string): RelativeTimeLocale | undefined {
          return locales[name];
        },

        calculator(locale?: string): RelativeTimeCalculator {
          return new RelativeTimeCalculator(locale);
        },
      },
    });
  },
};

export default relativeTimePlugin;
export { RelativeTimeCalculator };
export type { RelativeTimeLocale, RelativeTimeOptions };
