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
export declare class LocaleManager {
    private static instance;
    private locales;
    private currentLocale;
    private defaultLocale;
    private constructor();
    static getInstance(): LocaleManager;
    register(code: string, locale: LocaleConfig): void;
    setLocale(code: string): boolean;
    getLocale(code?: string): LocaleConfig | undefined;
    getCurrentLocale(): string;
    getDefaultLocale(): string;
    setDefaultLocale(code: string): boolean;
    getHolidays(localeCode?: string, type?: string): HolidayRule[];
    getStateHolidays(state: string, localeCode?: string): HolidayRule[];
    getAllHolidays(localeCode?: string): HolidayRule[];
    getAvailableLocales(): string[];
    hasLocale(code: string): boolean;
    clear(): void;
}
export declare const localeManager: LocaleManager;
export {};
//# sourceMappingURL=locale-manager.d.ts.map