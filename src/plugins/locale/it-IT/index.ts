import type { KairosPlugin } from '../../../core/types/plugin.js';
import { holidays, observances, regionalHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'Italiano (Italia)',
  code: 'it-IT',
  months: [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre',
  ],
  monthsShort: [
    'gen.',
    'feb.',
    'mar.',
    'apr.',
    'mag.',
    'giu.',
    'lug.',
    'ago.',
    'set.',
    'ott.',
    'nov.',
    'dic.',
  ],
  weekdays: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
  weekdaysShort: ['dom.', 'lun.', 'mar.', 'mer.', 'gio.', 'ven.', 'sab.'],
  weekdaysMin: ['do', 'lu', 'ma', 'me', 'gi', 've', 'sa'],
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd D MMMM YYYY HH:mm',
  },
  ordinal: (n: number): string => {
    return `${n}º`;
  },
  meridiem: (hour: number, _minute: number, isLower: boolean): string => {
    const m = hour < 12 ? 'del mattino' : hour < 18 ? 'del pomeriggio' : 'della sera';
    return isLower ? m : m.toUpperCase();
  },
  relativeTime: {
    future: 'tra %s',
    past: '%s fa',
    s: 'alcuni secondi',
    ss: '%d secondi',
    m: 'un minuto',
    mm: '%d minuti',
    h: "un'ora",
    hh: '%d ore',
    d: 'un giorno',
    dd: '%d giorni',
    M: 'un mese',
    MM: '%d mesi',
    y: 'un anno',
    yy: '%d anni',
  },
};

export default {
  name: 'locale-it-IT',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('it-IT', {
      ...locale,
      holidays,
      observances,
      regionalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['it-IT'] = locale;

    // Add Italian-specific holiday methods
    kairos.extend({
      getItalianHolidays(region?: string): any[] {
        if (region) {
          const regionLower = region.toLowerCase();
          const regionHols = regionalHolidays[regionLower];
          if (regionHols) {
            return [...holidays, ...regionHols];
          }
        }
        return holidays;
      },

      getItalianObservances(): any[] {
        return observances;
      },

      getRegionalItalianHolidays(region: string): any[] {
        return regionalHolidays[region.toLowerCase()] || [];
      },

      getAllItalianHolidays(): any[] {
        return allHolidays;
      },
    });
  },
} as KairosPlugin;
