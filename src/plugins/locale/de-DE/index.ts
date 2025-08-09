import type { KairosPlugin } from '../../../core/types/plugin.js';
import {
  holidays,
  stateHolidays,
  federalHolidays,
  allHolidays,
  historicalHolidays,
} from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'Deutsch (Deutschland)',
  code: 'de-DE',
  months: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD.MM.YYYY',
    LL: 'D. MMMM YYYY',
    LLL: 'D. MMMM YYYY HH:mm',
    LLLL: 'dddd, D. MMMM YYYY HH:mm',
  },
  ordinal: (n: number): string => {
    return `${n}.`;
  },
  meridiem: (_hour: number, _minute: number, _isLower: boolean): string => {
    // German doesn't typically use AM/PM
    return '';
  },
};

export default {
  name: 'locale-de-DE',
  version: '1.0.0',
  size: 2048,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('de-DE', {
      ...locale,
      holidays,
      federalHolidays,
      stateHolidays: stateHolidays as any,
      historicalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['de-DE'] = locale;

    // Add German-specific holiday methods
    kairos.extend({
      getGermanHolidays(state?: string): any[] {
        if (state) {
          const stateLower = state.toLowerCase();
          const stateHols = (stateHolidays as any)[stateLower];
          if (stateHols) {
            return [...federalHolidays, ...stateHols];
          }
        }
        return holidays;
      },

      getFederalHolidays(): any[] {
        return federalHolidays;
      },

      getStateHolidays(state: string): any[] {
        return (stateHolidays as any)[state.toLowerCase()] || [];
      },

      getAllHolidays(): any[] {
        return allHolidays;
      },

      getHistoricalHolidays(): any[] {
        return historicalHolidays;
      },

      // German specific methods
      isEasterHoliday(): boolean {
        const holidayInfo = this.getHolidayInfo();
        return holidayInfo ? holidayInfo.type === 'easter-based' : false;
      },

      isCatholicHoliday(): boolean {
        const holidayInfo = this.getHolidayInfo();
        const catholicHolidays = ['epiphany', 'corpus-christi', 'assumption-day', 'all-saints-day'];
        return holidayInfo ? catholicHolidays.includes(holidayInfo.id) : false;
      },

      isProtestantHoliday(): boolean {
        const holidayInfo = this.getHolidayInfo();
        const protestantHolidays = ['reformation-day', 'repentance-day'];
        return holidayInfo ? protestantHolidays.includes(holidayInfo.id) : false;
      },

      // German date formatting
      formatGerman(template?: string): string {
        const germanTemplate = template || 'dddd, D. MMMM YYYY';
        return this.format(germanTemplate);
      },
    });

    // Add static methods for German holidays
    kairos.addStatic?.({
      getEasterHolidays(year: number): any[] {
        const easterHolidays = holidays.filter((h) => h.type === 'easter-based');
        const result = [];

        for (const holiday of easterHolidays) {
          const dates = kairos.holidayEngine.calculate(holiday, year);
          result.push(
            ...dates.map((date: Date) => ({
              date: kairos(date),
              name: holiday.name,
              id: holiday.id,
            }))
          );
        }

        return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
      },

      getBusBettag(year: number): any {
        // Buß- und Bettag (Repentance Day) - only in Saxony
        const repentanceDay = stateHolidays.saxony.find((h) => h.id === 'repentance-day');
        if (repentanceDay) {
          const dates = kairos.holidayEngine.calculate(repentanceDay, year);
          return dates.length > 0 ? kairos(dates[0]) : null;
        }
        return null;
      },

      getStateHolidaysForYear(state: string, year: number): any[] {
        const stateHols = (stateHolidays as any)[state.toLowerCase()];
        if (!stateHols) return [];

        const result = [];
        for (const holiday of stateHols) {
          const dates = kairos.holidayEngine.calculate(holiday, year);
          result.push(
            ...dates.map((date: Date) => ({
              date: kairos(date),
              name: holiday.name,
              id: holiday.id,
            }))
          );
        }

        return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
      },

      getAvailableStates(): string[] {
        return Object.keys(stateHolidays);
      },
    });
  },
} as KairosPlugin;
