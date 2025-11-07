import type { KairosPlugin } from '../../../core/types/plugin.js';
import { holidays, observances, regionalHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'Русский (Россия)',
  code: 'ru-RU',
  months: [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ],
  monthsShort: [
    'янв.',
    'фев.',
    'мар.',
    'апр.',
    'май',
    'июн.',
    'июл.',
    'авг.',
    'сен.',
    'окт.',
    'ноя.',
    'дек.',
  ],
  weekdays: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  weekdaysShort: ['вс.', 'пн.', 'вт.', 'ср.', 'чт.', 'пт.', 'сб.'],
  weekdaysMin: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  formats: {
    LT: 'H:mm',
    LTS: 'H:mm:ss',
    L: 'DD.MM.YYYY',
    LL: 'D MMMM YYYY [г.]',
    LLL: 'D MMMM YYYY [г.], H:mm',
    LLLL: 'dddd, D MMMM YYYY [г.], H:mm',
  },
  ordinal: (n: number): string => {
    return `${n}-й`;
  },
  meridiem: (hour: number, _minute: number, _isLower: boolean): string => {
    return hour < 4 ? 'ночи' : hour < 12 ? 'утра' : hour < 17 ? 'дня' : 'вечера';
  },
  relativeTime: {
    future: 'через %s',
    past: '%s назад',
    s: 'несколько секунд',
    ss: (n: number) => {
      return n % 10 === 1 && n % 100 !== 11
        ? `${n} секунду`
        : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
          ? `${n} секунды`
          : `${n} секунд`;
    },
    m: 'минуту',
    mm: (n: number) => {
      return n % 10 === 1 && n % 100 !== 11
        ? `${n} минуту`
        : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
          ? `${n} минуты`
          : `${n} минут`;
    },
    h: 'час',
    hh: (n: number) => {
      return n % 10 === 1 && n % 100 !== 11
        ? `${n} час`
        : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
          ? `${n} часа`
          : `${n} часов`;
    },
    d: 'день',
    dd: (n: number) => {
      return n % 10 === 1 && n % 100 !== 11
        ? `${n} день`
        : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
          ? `${n} дня`
          : `${n} дней`;
    },
    M: 'месяц',
    MM: (n: number) => {
      return n % 10 === 1 && n % 100 !== 11
        ? `${n} месяц`
        : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
          ? `${n} месяца`
          : `${n} месяцев`;
    },
    y: 'год',
    yy: (n: number) => {
      return n % 10 === 1 && n % 100 !== 11
        ? `${n} год`
        : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
          ? `${n} года`
          : `${n} лет`;
    },
  },
};

export default {
  name: 'locale-ru-RU',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('ru-RU', {
      ...locale,
      holidays,
      observances,
      regionalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['ru-RU'] = locale;

    // Add Russian-specific holiday methods
    kairos.extend({
      getRussianHolidays(region?: string): any[] {
        if (region && typeof region === 'string') {
          const regionLower = region.toLowerCase();
          const regionHols = regionalHolidays[regionLower];
          if (regionHols) {
            return [...holidays, ...regionHols];
          }
        }
        return holidays;
      },

      getRussianObservances(): any[] {
        return observances;
      },

      getRegionalRussianHolidays(region: string): any[] {
        if (!region || typeof region !== 'string') {
          return [];
        }
        return regionalHolidays[region.toLowerCase()] || [];
      },

      getAllRussianHolidays(): any[] {
        return allHolidays;
      },
    });
  },
} as KairosPlugin;
