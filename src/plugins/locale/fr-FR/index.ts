import type { KairosPlugin } from '../../../core/types/plugin.js';
import { holidays, observances, regionalHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'Français (France)',
  code: 'fr-FR',
  months: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
  monthsShort: [
    'janv.',
    'févr.',
    'mars',
    'avr.',
    'mai',
    'juin',
    'juil.',
    'août',
    'sept.',
    'oct.',
    'nov.',
    'déc.',
  ],
  weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  weekdaysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  weekdaysMin: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'],
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd D MMMM YYYY HH:mm',
  },
  ordinal: (n: number): string => {
    return n === 1 ? `${n}er` : `${n}e`;
  },
  meridiem: (_hour: number, _minute: number, _isLower: boolean): string => {
    return ''; // 24-hour format in French
  },
  relativeTime: {
    future: 'dans %s',
    past: 'il y a %s',
    s: 'quelques secondes',
    ss: '%d secondes',
    m: 'une minute',
    mm: '%d minutes',
    h: 'une heure',
    hh: '%d heures',
    d: 'un jour',
    dd: '%d jours',
    M: 'un mois',
    MM: '%d mois',
    y: 'un an',
    yy: '%d ans',
  },
};

export default {
  name: 'locale-fr-FR',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('fr-FR', {
      ...locale,
      holidays,
      observances,
      regionalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['fr-FR'] = locale;

    // Add French-specific holiday methods
    kairos.extend({
      getFrenchHolidays(region?: string): any[] {
        if (region && typeof region === 'string') {
          const regionLower = region.toLowerCase();
          const regionHols = regionalHolidays[regionLower];
          if (regionHols) {
            return [...holidays, ...regionHols];
          }
        }
        return holidays;
      },

      getFrenchObservances(): any[] {
        return observances;
      },

      getRegionalHolidays(region: string): any[] {
        if (!region || typeof region !== 'string') {
          return [];
        }
        return regionalHolidays[region.toLowerCase()] || [];
      },

      getAllFrenchHolidays(): any[] {
        return allHolidays;
      },
    });
  },
} as KairosPlugin;
