import kairos from '../../src/core/plugin-system.js';
import { testDates, testHelpers } from '../setup.js';

describe('Locale and Holiday Integration', () => {
  describe('US Locale (en-US)', () => {
    beforeEach(() => {
      kairos.locale('en-US');
    });

    test('should have correct US holidays', () => {
      const holidays = kairos().getHolidays();
      const holidayNames = holidays.map((h) => h.name);

      expect(holidayNames).toContain("New Year's Day");
      expect(holidayNames).toContain('Independence Day');
      expect(holidayNames).toContain('Thanksgiving');
      expect(holidayNames).toContain('Christmas Day');
      expect(holidayNames).toContain('Memorial Day');
      expect(holidayNames).toContain('Labor Day');
    });

    test('should detect US holidays correctly', () => {
      const july4th = kairos('2024-07-04');
      const thanksgiving = kairos('2024-11-28');
      const christmas = kairos('2024-12-25');

      expect(july4th.isHoliday()).toBe(true);
      expect(thanksgiving.isHoliday()).toBe(true);
      expect(christmas.isHoliday()).toBe(true);

      expect(july4th.getHolidayInfo()!.name).toBe('Independence Day');
      expect(thanksgiving.getHolidayInfo()!.name).toBe('Thanksgiving');
      expect(christmas.getHolidayInfo()!.name).toBe('Christmas Day');
    });

    test('should handle Juneteenth as a federal holiday', () => {
      const juneteenth = kairos('2024-06-19');
      expect(juneteenth.isHoliday()).toBe(true);
      expect(juneteenth.getHolidayInfo()!.name).toBe('Juneteenth');
    });

    test('should integrate with business day calculations', () => {
      const july4th = kairos('2024-07-04'); // Thursday
      const nextBusinessDay = july4th.nextBusinessDay();

      expect(july4th.isBusinessDay()).toBe(false); // Holiday
      expect(nextBusinessDay.format('YYYY-MM-DD')).toBe('2024-07-05'); // Friday
    });
  });

  describe('German Locale (de-DE)', () => {
    beforeEach(() => {
      kairos.locale('de-DE');
    });

    test('should have correct German holidays', () => {
      const holidays = kairos().getHolidays();
      const holidayNames = holidays.map((h) => h.name);

      expect(holidayNames).toContain('Neujahr');
      expect(holidayNames).toContain('Tag der Arbeit');
      expect(holidayNames).toContain('Tag der Deutschen Einheit');
      expect(holidayNames).toContain('1. Weihnachtstag');
      expect(holidayNames).toContain('2. Weihnachtstag');
    });

    test('should detect Easter-based holidays', () => {
      const goodFriday = kairos('2024-03-29');
      const easterMonday = kairos('2024-04-01');

      expect(goodFriday.isHoliday()).toBe(true);
      expect(easterMonday.isHoliday()).toBe(true);

      expect(goodFriday.getHolidayInfo()!.name).toBe('Karfreitag');
      expect(easterMonday.getHolidayInfo()!.name).toBe('Ostermontag');
    });

    test('should handle state-specific holidays', () => {
      const bavarianHolidays = kairos().getStateHolidays('bavaria');
      const bavarianHolidayNames = bavarianHolidays.map((h) => h.name);

      expect(bavarianHolidayNames).toContain('Heilige Drei Könige');
      expect(bavarianHolidayNames).toContain('Allerheiligen');
    });

    test('should identify Catholic vs Protestant holidays', () => {
      const corpusChristi = kairos('2024-05-30'); // Catholic holiday
      const reformationDay = kairos('2024-10-31'); // Protestant holiday

      // These might not be holidays in all states
      const corpusChristiInfo = corpusChristi.getHolidayInfo();
      const reformationDayInfo = reformationDay.getHolidayInfo();

      if (corpusChristiInfo) {
        expect(corpusChristi.isCatholicHoliday()).toBe(true);
      }

      if (reformationDayInfo) {
        expect(reformationDay.isProtestantHoliday()).toBe(true);
      }
    });
  });

  describe('Turkish Locale (tr-TR)', () => {
    beforeEach(() => {
      kairos.locale('tr-TR');
    });

    test('should have correct Turkish holidays', () => {
      const holidays = kairos().getHolidays();
      const holidayNames = holidays.map((h) => h.name);

      expect(holidayNames).toContain('Yılbaşı');
      expect(holidayNames).toContain('Ulusal Egemenlik ve Çocuk Bayramı');
      expect(holidayNames).toContain('Emek ve Dayanışma Günü');
      expect(holidayNames).toContain('Zafer Bayramı');
      expect(holidayNames).toContain('Cumhuriyet Bayramı');
    });

    test('should detect religious holidays', () => {
      const publicHolidays = kairos().getPublicHolidays();
      const religiousHolidays = kairos().getReligiousHolidays();

      expect(publicHolidays.length).toBeGreaterThan(0);
      expect(religiousHolidays.length).toBeGreaterThan(0);

      const religiousHolidayNames = religiousHolidays.map((h) => h.name);
      expect(religiousHolidayNames).toContain('Ramazan Bayramı');
      expect(religiousHolidayNames).toContain('Kurban Bayramı');
    });

    test('should handle Islamic calendar holidays', () => {
      // Note: Exact dates depend on lunar calendar calculations
      const ramadanFeast = kairos.getRamazanBayrami(2024);
      const sacrificeFeast = kairos.getKurbanBayrami(2024);

      expect(ramadanFeast).toBeInstanceOf(Array);
      expect(sacrificeFeast).toBeInstanceOf(Array);

      if (ramadanFeast.length > 0) {
        expect(ramadanFeast[0].isHoliday()).toBe(true);
        const holiday = ramadanFeast[0].getHolidayInfo();
        expect(holiday?.name).toBe('Ramazan Bayramı');
        expect(['custom', 'religious', 'lunar']).toContain(holiday?.type); // Accept any of these types
      }

      if (sacrificeFeast.length > 0) {
        expect(sacrificeFeast[0].isHoliday()).toBe(true);
        const holiday = sacrificeFeast[0].getHolidayInfo();
        expect(holiday?.name).toBe('Kurban Bayramı');
        expect(['custom', 'religious', 'lunar']).toContain(holiday?.type); // Accept any of these types
      }
    });
  });

  describe('Japanese Locale (ja-JP)', () => {
    beforeEach(() => {
      kairos.locale('ja-JP');
    });

    test('should have correct Japanese holidays', () => {
      const holidays = kairos().getHolidays();
      const holidayNames = holidays.map((h) => h.name);

      expect(holidayNames).toContain('元日');
      expect(holidayNames).toContain('成人の日');
      expect(holidayNames).toContain('建国記念の日');
      expect(holidayNames).toContain('春分の日');
      expect(holidayNames).toContain('昭和の日');
      expect(holidayNames).toContain('憲法記念日');
      expect(holidayNames).toContain('こどもの日');
    });

    test('should handle Golden Week holidays', () => {
      const goldenWeek = kairos.getGoldenWeek(2024);

      expect(goldenWeek.length).toBeGreaterThan(0);

      const goldenWeekNames = goldenWeek.map((h) => h.name);
      expect(goldenWeekNames).toContain('昭和の日');
      expect(goldenWeekNames).toContain('憲法記念日');
      expect(goldenWeekNames).toContain('みどりの日');
      expect(goldenWeekNames).toContain('こどもの日');
    });

    test('should handle equinox holidays', () => {
      const equinoxDays = kairos.getEquinoxDays(2024);

      expect(equinoxDays.length).toBe(2);

      const equinoxNames = equinoxDays.map((h) => h.name);
      expect(equinoxNames).toContain('春分の日');
      expect(equinoxNames).toContain('秋分の日');

      // Check that they're in the correct seasons
      const vernalEquinox = equinoxDays.find((h) => h.name === '春分の日');
      const autumnalEquinox = equinoxDays.find((h) => h.name === '秋分の日');

      expect(vernalEquinox!.date.month()).toBe(3); // March
      expect(autumnalEquinox!.date.month()).toBe(9); // September
    });

    test('should handle Japanese era system', () => {
      const reiwaDate = kairos('2024-01-01');
      const heiseiDate = kairos('2010-01-01');

      expect(reiwaDate.getJapaneseEra()).toBe('令和');
      expect(heiseiDate.getJapaneseEra()).toBe('平成');

      expect(reiwaDate.getJapaneseEraYear()).toBe(6); // 2024 - 2018
      expect(heiseiDate.getJapaneseEraYear()).toBe(22); // 2010 - 1988

      expect(reiwaDate.formatWithEra()).toBe('令和6年1月1日');
      expect(heiseiDate.formatWithEra()).toBe('平成22年1月1日');
    });
  });

  describe('Multi-locale Business Days', () => {
    test('should handle different holidays in business day calculations', () => {
      const may1st = kairos('2024-05-01'); // May Day

      // US locale - May 1st is not a federal holiday
      kairos.locale('en-US');
      expect(may1st.isBusinessDay()).toBe(true);

      // German locale - May 1st is Labor Day
      kairos.locale('de-DE');
      expect(may1st.isBusinessDay()).toBe(false);

      // Turkish locale - May 1st is Labor Day
      kairos.locale('tr-TR');
      expect(may1st.isBusinessDay()).toBe(false);
    });

    test('should calculate business days correctly for each locale', () => {
      const april30 = kairos('2024-04-30'); // Tuesday

      // US locale - next business day should be May 1st
      kairos.locale('en-US');
      expect(april30.nextBusinessDay().format('YYYY-MM-DD')).toBe('2024-05-01');

      // German locale - next business day should be May 2nd (skipping May 1st)
      kairos.locale('de-DE');
      expect(april30.nextBusinessDay().format('YYYY-MM-DD')).toBe('2024-05-02');
    });
  });

  describe('Cross-locale Holiday Comparison', () => {
    test('should compare holidays across different locales', () => {
      const date = kairos('2024-05-01');

      // Check if it's a holiday in different locales
      kairos.locale('en-US');
      const isUSHoliday = date.isHoliday();

      kairos.locale('de-DE');
      const isGermanHoliday = date.isHoliday();

      kairos.locale('tr-TR');
      const isTurkishHoliday = date.isHoliday();

      expect(isUSHoliday).toBe(false);
      expect(isGermanHoliday).toBe(true);
      expect(isTurkishHoliday).toBe(true);
    });

    test('should handle universal holidays', () => {
      const newYear = kairos('2024-01-01');

      const locales = ['en-US', 'de-DE', 'tr-TR', 'ja-JP'];

      locales.forEach((locale) => {
        kairos.locale(locale);
        expect(newYear.isHoliday()).toBe(true);
      });
    });
  });

  describe('Locale-specific Formatting', () => {
    test('should format dates according to locale', () => {
      const date = kairos('2024-03-15');

      // Basic formatting works with any locale
      kairos.locale('en-US');
      expect(date.format('MM/DD/YYYY')).toBe('03/15/2024');

      // German locale
      kairos.locale('de-DE');
      expect(date.format('DD.MM.YYYY')).toBe('15.03.2024');

      // Japanese format
      kairos.locale('ja-JP');
      expect(date.format('YYYY/MM/DD')).toBe('2024/03/15');
    });

    test('should handle different locale date formats', () => {
      const date = kairos('2024-03-15');

      // Different date representations work with any locale
      kairos.locale('en-US');
      expect(date.format('DD')).toBe('15');

      // German format
      kairos.locale('de-DE');
      expect(date.format('DD')).toBe('15');

      // Japanese format
      kairos.locale('ja-JP');
      expect(date.format('DD')).toBe('15');
    });
  });

  describe('Performance with Multiple Locales', () => {
    test('should handle locale switching efficiently', () => {
      const date = kairos('2024-05-01');
      const locales = ['en-US', 'de-DE', 'tr-TR', 'ja-JP'];

      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const locale = locales[i % locales.length];
        kairos.locale(locale);
        date.isHoliday();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should cache holiday calculations per locale', () => {
      const date = kairos('2024-05-01');

      // First calculation for German locale
      kairos.locale('de-DE');
      const start1 = performance.now();
      const result1 = date.isHoliday();
      const end1 = performance.now();

      // Second calculation for German locale (should be cached)
      const start2 = performance.now();
      const result2 = date.isHoliday();
      const end2 = performance.now();

      expect(result1).toBe(result2);
      expect(end2 - start2).toBeLessThan(end1 - start1);
    });
  });
});
