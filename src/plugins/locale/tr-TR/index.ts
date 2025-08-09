import type { KairosPlugin } from '../../../core/types/plugin.js';
import {
  holidays,
  observances,
  historicalHolidays,
  allHolidays,
  publicHolidays,
} from './holidays.js';
import { localeManager } from '../../../core/locale-manager.js';

const locale = {
  name: 'Türkçe (Türkiye)',
  code: 'tr-TR',
  months: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  weekdays: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  weekdaysShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  weekdaysMin: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD.MM.YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd, D MMMM YYYY HH:mm',
  },
  ordinal: (n: number): string => {
    // Turkish ordinal numbers
    if (n === 1) return `${n}'inci`;
    if (n === 2) return `${n}'nci`;
    if (n === 3) return `${n}'üncü`;
    if (n === 4) return `${n}'üncü`;
    if (n === 5) return `${n}'inci`;
    if (n === 6) return `${n}'ncı`;
    if (n === 7) return `${n}'nci`;
    if (n === 8) return `${n}'inci`;
    if (n === 9) return `${n}'uncu`;
    if (n === 10) return `${n}'uncu`;

    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
      return `${n}'üncü`;
    }

    switch (lastDigit) {
      case 1:
        return `${n}'inci`;
      case 2:
        return `${n}'nci`;
      case 3:
        return `${n}'üncü`;
      case 4:
        return `${n}'üncü`;
      case 5:
        return `${n}'inci`;
      case 6:
        return `${n}'ncı`;
      case 7:
        return `${n}'nci`;
      case 8:
        return `${n}'inci`;
      case 9:
        return `${n}'uncu`;
      case 0:
        return `${n}'uncu`;
      default:
        return `${n}'üncü`;
    }
  },
  meridiem: (_hour: number, _minute: number, _isLower: boolean): string => {
    // Turkish doesn't typically use AM/PM
    return '';
  },
};

export default {
  name: 'locale-tr-TR',
  version: '1.0.0',
  size: 1536,
  dependencies: ['holiday-engine'],
  locale,
  install(kairos, _utils) {
    // Register the locale with the locale manager
    localeManager.register('tr-TR', {
      ...locale,
      holidays,
      publicHolidays,
      observances,
      historicalHolidays,
    });

    // Register with legacy system for backward compatibility
    kairos.locales = kairos.locales || {};
    kairos.locales['tr-TR'] = locale;

    // Add Turkish-specific holiday methods
    kairos.extend({
      getTurkishHolidays(type?: 'public' | 'religious' | 'historical' | 'all'): any[] {
        switch (type) {
          case 'public':
            return publicHolidays;
          case 'religious':
            return holidays.filter((h) => h.type === 'lunar' || h.type === 'custom');
          case 'historical':
            return historicalHolidays;
          case 'all':
            return allHolidays;
          default:
            return holidays;
        }
      },

      getPublicHolidays(): any[] {
        return publicHolidays;
      },

      getReligiousHolidays(): any[] {
        return holidays.filter((h) => h.type === 'lunar' || h.type === 'custom');
      },

      getObservances(): any[] {
        return observances;
      },

      isReligiousHoliday(): boolean {
        const holidayInfo = this.getHolidayInfo();
        return holidayInfo ? holidayInfo.type === 'lunar' || holidayInfo.type === 'custom' : false;
      },

      isPublicHoliday(): boolean {
        const holidayInfo = this.getHolidayInfo(publicHolidays);
        return holidayInfo !== null;
      },

      // Turkish specific formatting
      formatTurkish(template?: string): string {
        const turkishTemplate = template || 'D MMMM YYYY, dddd';
        return this.format(turkishTemplate);
      },
    });

    // Add static methods for Turkish holidays
    kairos.addStatic?.({
      getRamazanBayrami(year: number): any {
        const ramadanFeast = holidays.find((h) => h.id === 'ramadan-feast');
        if (ramadanFeast) {
          const dates = kairos.holidayEngine.calculate(ramadanFeast, year);
          return dates.map((date: Date) => kairos(date));
        }
        return [];
      },

      getKurbanBayrami(year: number): any {
        const sacrificeFeast = holidays.find((h) => h.id === 'sacrifice-feast');
        if (sacrificeFeast) {
          const dates = kairos.holidayEngine.calculate(sacrificeFeast, year);
          return dates.map((date: Date) => kairos(date));
        }
        return [];
      },

      getKandilGecesi(year: number): any[] {
        const kandilNights = holidays.filter(
          (h) => h.name.includes('Kandil') || h.name.includes('Kadir')
        );

        const result = [];
        for (const kandil of kandilNights) {
          const dates = kairos.holidayEngine.calculate(kandil, year);
          result.push(
            ...dates.map((date: Date) => ({
              date: kairos(date),
              name: kandil.name,
            }))
          );
        }

        return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
      },
    });
  },
} as KairosPlugin;
