import type { KairosPlugin } from '../../../core/types/plugin.js';
import { holidays, observances, regionalHolidays, allHolidays } from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'Português (Brasil)',
  code: 'pt-BR',
  months: [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ],
  monthsShort: [
    'jan.',
    'fev.',
    'mar.',
    'abr.',
    'mai.',
    'jun.',
    'jul.',
    'ago.',
    'set.',
    'out.',
    'nov.',
    'dez.',
  ],
  weekdays: [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ],
  weekdaysShort: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
  weekdaysMin: ['do', 'sg', 'te', 'qa', 'qi', 'sx', 'sá'],
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD/MM/YYYY',
    LL: 'D [de] MMMM [de] YYYY',
    LLL: 'D [de] MMMM [de] YYYY [às] HH:mm',
    LLLL: 'dddd, D [de] MMMM [de] YYYY [às] HH:mm',
  },
  ordinal: (n: number): string => {
    return `${n}º`;
  },
  meridiem: (hour: number, _minute: number, isLower: boolean): string => {
    const m = hour < 12 ? 'da manhã' : hour < 18 ? 'da tarde' : 'da noite';
    return isLower ? m : m.toUpperCase();
  },
  relativeTime: {
    future: 'em %s',
    past: 'há %s',
    s: 'poucos segundos',
    ss: '%d segundos',
    m: 'um minuto',
    mm: '%d minutos',
    h: 'uma hora',
    hh: '%d horas',
    d: 'um dia',
    dd: '%d dias',
    M: 'um mês',
    MM: '%d meses',
    y: 'um ano',
    yy: '%d anos',
  },
};

export default {
  name: 'locale-pt-BR',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('pt-BR', {
      ...locale,
      holidays,
      observances,
      regionalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['pt-BR'] = locale;

    // Add Brazilian Portuguese-specific holiday methods
    kairos.extend({
      getBrazilianHolidays(region?: string): any[] {
        if (region) {
          const regionLower = region.toLowerCase();
          const regionHols = regionalHolidays[regionLower];
          if (regionHols) {
            return [...holidays, ...regionHols];
          }
        }
        return holidays;
      },

      getBrazilianObservances(): any[] {
        return observances;
      },

      getRegionalBrazilianHolidays(region: string): any[] {
        return regionalHolidays[region.toLowerCase()] || [];
      },

      getAllBrazilianHolidays(): any[] {
        return allHolidays;
      },
    });
  },
} as KairosPlugin;
