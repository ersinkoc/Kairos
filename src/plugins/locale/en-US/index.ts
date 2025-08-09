import type { KairosPlugin } from '../../../core/types/plugin.js';
import { holidays, federalHolidays, stateHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'English (United States)',
  code: 'en-US',
  months: [
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
  ],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  formats: {
    LT: 'h:mm A',
    LTS: 'h:mm:ss A',
    L: 'MM/DD/YYYY',
    LL: 'MMMM D, YYYY',
    LLL: 'MMMM D, YYYY h:mm A',
    LLLL: 'dddd, MMMM D, YYYY h:mm A',
  },
  ordinal: (n: number): string => {
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
  },
  meridiem: (hour: number, _minute: number, isLower: boolean): string => {
    const suffix = hour < 12 ? 'AM' : 'PM';
    return isLower ? suffix.toLowerCase() : suffix;
  },
};

export default {
  name: 'locale-en-US',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('en-US', {
      ...locale,
      holidays,
      federalHolidays,
      stateHolidays: stateHolidays as any,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['en-US'] = locale;

    // Add US-specific holiday methods
    kairos.extend({
      getUSHolidays(state?: string): any[] {
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

      getAllUSHolidays(): any[] {
        return allHolidays;
      },
    });

    // Add static methods
    kairos.addStatic?.({
      locale(name?: string) {
        if (name === undefined) {
          return localeManager.getCurrentLocale();
        }

        if (localeManager.setLocale(name)) {
          kairos.currentLocale = name;
          return kairos;
        }

        throw new Error(`Locale '${name}' not found`);
      },

      getAvailableLocales(): string[] {
        return Object.keys(kairos.locales || {});
      },
    });

    // Set as default locale
    kairos.currentLocale = 'en-US';
  },
} as KairosPlugin;
