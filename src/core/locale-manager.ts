import type { HolidayRule } from './types/holiday.js';

interface LocaleData {
  name: string;
  code: string;
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  formats: {
    LT: string;
    LTS: string;
    L: string;
    LL: string;
    LLL: string;
    LLLL: string;
  };
  ordinal: (n: number) => string;
  meridiem?: (hour: number, minute: number, isLower: boolean) => string;
}

export interface LocaleConfig extends LocaleData {
  holidays?: HolidayRule[];
  stateHolidays?: Record<string, HolidayRule[]>;
  federalHolidays?: HolidayRule[];
  publicHolidays?: HolidayRule[];
  observances?: HolidayRule[];
  [key: string]: any;
}

export class LocaleManager {
  private static instance: LocaleManager;
  private locales: Map<string, LocaleConfig> = new Map<string, LocaleConfig>();
  private currentLocale: string = 'en-US';
  private defaultLocale: string = 'en-US';

  private constructor() {}

  static getInstance(): LocaleManager {
    if (!LocaleManager.instance) {
      LocaleManager.instance = new LocaleManager();
    }
    return LocaleManager.instance;
  }

  register(code: string, locale: LocaleConfig): void {
    this.locales.set(code, locale);

    // Set as default if it's the first locale
    if (this.locales.size === 1) {
      this.defaultLocale = code;
      this.currentLocale = code;
    }
  }

  setLocale(code: string): boolean {
    if (this.locales.has(code)) {
      this.currentLocale = code;
      return true;
    }
    return false;
  }

  getLocale(code?: string): LocaleConfig | undefined {
    const targetCode = code || this.currentLocale;
    return this.locales.get(targetCode);
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  getDefaultLocale(): string {
    return this.defaultLocale;
  }

  setDefaultLocale(code: string): boolean {
    if (this.locales.has(code)) {
      this.defaultLocale = code;
      return true;
    }
    return false;
  }

  getHolidays(localeCode?: string, type?: string): HolidayRule[] {
    const locale = this.getLocale(localeCode);
    if (!locale) {
      return [];
    }

    // Handle different holiday types based on locale structure
    if (type) {
      switch (type) {
        case 'federal':
          return locale.federalHolidays || [];
        case 'state':
          return locale.stateHolidays ? Object.values(locale.stateHolidays).flat() : [];
        case 'public':
          return locale.publicHolidays || [];
        case 'observances':
          return locale.observances || [];
        default:
          // Check if the locale has a custom type
          if (locale[type] && Array.isArray(locale[type])) {
            return locale[type];
          }
      }
    }

    // Return default holidays for the locale
    return locale.holidays || [];
  }

  getStateHolidays(state: string, localeCode?: string): HolidayRule[] {
    const locale = this.getLocale(localeCode);
    if (!locale || !locale.stateHolidays) {
      return [];
    }

    if (!state || typeof state !== 'string') {
      return [];
    }

    const stateLower = state.toLowerCase();
    return locale.stateHolidays[stateLower] || [];
  }

  getAllHolidays(localeCode?: string): HolidayRule[] {
    const locale = this.getLocale(localeCode);
    if (!locale) {
      return [];
    }

    const allHolidays: HolidayRule[] = [];

    // Add main holidays
    if (locale.holidays) {
      allHolidays.push(...locale.holidays);
    }

    // Add federal holidays
    if (locale.federalHolidays) {
      allHolidays.push(...locale.federalHolidays);
    }

    // Add state holidays
    if (locale.stateHolidays) {
      for (const stateHols of Object.values(locale.stateHolidays)) {
        allHolidays.push(...stateHols);
      }
    }

    // Add public holidays
    if (locale.publicHolidays) {
      allHolidays.push(...locale.publicHolidays);
    }

    // Add observances
    if (locale.observances) {
      allHolidays.push(...locale.observances);
    }

    // Remove duplicates based on holiday name
    const uniqueHolidays = new Map<string, HolidayRule>();
    for (const holiday of allHolidays) {
      if (!uniqueHolidays.has(holiday.name)) {
        uniqueHolidays.set(holiday.name, holiday);
      }
    }

    return Array.from(uniqueHolidays.values());
  }

  getAvailableLocales(): string[] {
    return Array.from(this.locales.keys());
  }

  hasLocale(code: string): boolean {
    return this.locales.has(code);
  }

  clear(): void {
    this.locales.clear();
    this.currentLocale = 'en-US';
    this.defaultLocale = 'en-US';
  }
}

export const localeManager = LocaleManager.getInstance();
