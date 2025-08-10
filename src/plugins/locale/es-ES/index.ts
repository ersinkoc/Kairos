import type { KairosPlugin } from '../../../core/types/plugin.js';
import { holidays, observances, regionalHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'Español (España)',
  code: 'es-ES',
  months: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthsShort: [
    'ene.',
    'feb.',
    'mar.',
    'abr.',
    'may.',
    'jun.',
    'jul.',
    'ago.',
    'sep.',
    'oct.',
    'nov.',
    'dic.',
  ],
  weekdays: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  weekdaysShort: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  weekdaysMin: ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'],
  formats: {
    LT: 'H:mm',
    LTS: 'H:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D [de] MMMM [de] YYYY',
    LLL: 'D [de] MMMM [de] YYYY H:mm',
    LLLL: 'dddd, D [de] MMMM [de] YYYY H:mm',
  },
  ordinal: (n: number): string => {
    return `${n}º`;
  },
  meridiem: (hour: number, _minute: number, isLower: boolean): string => {
    const m = hour < 12 ? 'de la mañana' : hour < 20 ? 'de la tarde' : 'de la noche';
    return isLower ? m : m.toUpperCase();
  },
  relativeTime: {
    future: 'en %s',
    past: 'hace %s',
    s: 'unos segundos',
    ss: '%d segundos',
    m: 'un minuto',
    mm: '%d minutos',
    h: 'una hora',
    hh: '%d horas',
    d: 'un día',
    dd: '%d días',
    M: 'un mes',
    MM: '%d meses',
    y: 'un año',
    yy: '%d años',
  },
};

export default {
  name: 'locale-es-ES',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('es-ES', {
      ...locale,
      holidays,
      observances,
      regionalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['es-ES'] = locale;

    // Add Spanish-specific holiday methods
    kairos.extend({
      getSpanishHolidays(region?: string): any[] {
        if (region) {
          const regionLower = region.toLowerCase().replace(/\s/g, '');
          const regionHols = regionalHolidays[regionLower];
          if (regionHols) {
            return [...holidays, ...regionHols];
          }
        }
        return holidays;
      },

      getSpanishObservances(): any[] {
        return observances;
      },

      getRegionalSpanishHolidays(region: string): any[] {
        return regionalHolidays[region.toLowerCase().replace(/\s/g, '')] || [];
      },

      getAllSpanishHolidays(): any[] {
        return allHolidays;
      },
    });
  },
} as KairosPlugin;
