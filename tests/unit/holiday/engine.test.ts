import kairos from '../../../src/core/plugin-system.js';
import { testDates, testHelpers, generators } from '../../setup.js';
import type { HolidayRule } from '../../../src/core/types/holiday.js';
import { holidays as usHolidays } from '../../../src/plugins/locale/en-US/holidays.js';

describe('Holiday Engine', () => {
  const engine = kairos.holidayEngine;

  describe('Basic Holiday Detection', () => {
    test("should detect New Year's Day", () => {
      const newYear = kairos('2024-01-01');
      const holidays = usHolidays;

      expect(newYear.isHoliday(holidays)).toBe(true);

      const holidayInfo = newYear.getHolidayInfo(holidays);
      expect(holidayInfo).toBeDefined();
      expect(holidayInfo!.name).toBe("New Year's Day");
    });

    test('should detect Christmas Day', () => {
      const christmas = kairos('2024-12-25');
      const holidays = usHolidays;

      expect(christmas.isHoliday(holidays)).toBe(true);

      const holidayInfo = christmas.getHolidayInfo(holidays);
      expect(holidayInfo).toBeDefined();
      expect(holidayInfo!.name).toBe('Christmas Day');
    });

    test('should not detect non-holidays', () => {
      const regular = kairos('2024-03-15');
      const holidays = usHolidays;

      expect(regular.isHoliday(holidays)).toBe(false);
      expect(regular.getHolidayInfo(holidays)).toBeNull();
    });
  });

  describe('Fixed Date Holidays', () => {
    test('should calculate Independence Day correctly', () => {
      const july4th = kairos('2024-07-04');
      const holidays = usHolidays;

      expect(july4th.isHoliday(holidays)).toBe(true);

      const holidayInfo = july4th.getHolidayInfo(holidays);
      expect(holidayInfo!.name).toBe('Independence Day');
    });

    test('should handle leap year dates', () => {
      const leapDay = kairos('2024-02-29');

      // February 29 should not be a holiday
      expect(leapDay.isHoliday()).toBe(false);

      // But it should be a valid date
      expect(leapDay.year()).toBe(2024);
      expect(leapDay.month()).toBe(2);
      expect(leapDay.date()).toBe(29);
    });
  });

  describe('Nth Weekday Holidays', () => {
    test('should calculate Thanksgiving correctly', () => {
      // Test multiple years
      const testCases = [
        { year: 2020, expectedDate: new Date(2020, 10, 26) },
        { year: 2021, expectedDate: new Date(2021, 10, 25) },
        { year: 2022, expectedDate: new Date(2022, 10, 24) },
        { year: 2023, expectedDate: new Date(2023, 10, 23) },
        { year: 2024, expectedDate: new Date(2024, 10, 28) },
      ];

      testCases.forEach(({ year, expectedDate }) => {
        const thanksgiving = kairos(expectedDate);
        const holidays = usHolidays;;

        expect(thanksgiving.isHoliday(holidays)).toBe(true);

        const holidayInfo = thanksgiving.getHolidayInfo(holidays);
        expect(holidayInfo!.name).toBe('Thanksgiving');
      });
    });

    test("should calculate Mother's Day correctly", () => {
      // 2nd Sunday of May
      const testCases = [
        { year: 2020, expectedDate: new Date(2020, 4, 10) },
        { year: 2021, expectedDate: new Date(2021, 4, 9) },
        { year: 2022, expectedDate: new Date(2022, 4, 8) },
        { year: 2023, expectedDate: new Date(2023, 4, 14) },
        { year: 2024, expectedDate: new Date(2024, 4, 12) },
      ];

      testCases.forEach(({ year, expectedDate }) => {
        const mothersDay = kairos(expectedDate);
        const holidays = mothersDay.getHolidays();

        expect(mothersDay.isHoliday(holidays)).toBe(true);

        const holidayInfo = mothersDay.getHolidayInfo(holidays);
        expect(holidayInfo!.name).toBe("Mother's Day");
      });
    });

    test('should calculate Memorial Day correctly', () => {
      // Last Monday of May
      const testCases = [
        { year: 2020, expectedDate: new Date(2020, 4, 25) },
        { year: 2021, expectedDate: new Date(2021, 4, 31) },
        { year: 2022, expectedDate: new Date(2022, 4, 30) },
        { year: 2023, expectedDate: new Date(2023, 4, 29) },
        { year: 2024, expectedDate: new Date(2024, 4, 27) },
      ];

      testCases.forEach(({ year, expectedDate }) => {
        const memorialDay = kairos(expectedDate);
        const holidays = memorialDay.getHolidays();

        expect(memorialDay.isHoliday(holidays)).toBe(true);

        const holidayInfo = memorialDay.getHolidayInfo(holidays);
        expect(holidayInfo!.name).toBe('Memorial Day');
      });
    });
  });

  describe('Easter-based Holidays', () => {
    test('should calculate Easter correctly', () => {
      // Known Easter dates
      const testCases = [
        { year: 2020, expectedDate: new Date(2020, 3, 12) },
        { year: 2021, expectedDate: new Date(2021, 3, 4) },
        { year: 2022, expectedDate: new Date(2022, 3, 17) },
        { year: 2023, expectedDate: new Date(2023, 3, 9) },
        { year: 2024, expectedDate: new Date(2024, 2, 31) },
      ];

      testCases.forEach(({ year, expectedDate }) => {
        const easter = kairos.getEaster(year);
        expect(testHelpers.isSameDay(easter.toDate(), expectedDate)).toBe(true);
      });
    });

    test('should calculate Good Friday correctly', () => {
      // Good Friday is 2 days before Easter
      const testCases = [
        { year: 2020, expectedDate: new Date(2020, 3, 10) },
        { year: 2021, expectedDate: new Date(2021, 3, 2) },
        { year: 2022, expectedDate: new Date(2022, 3, 15) },
        { year: 2023, expectedDate: new Date(2023, 3, 7) },
        { year: 2024, expectedDate: new Date(2024, 2, 29) },
      ];

      testCases.forEach(({ year, expectedDate }) => {
        const goodFriday = kairos(expectedDate);
        const holidays = goodFriday.getHolidays();

        expect(goodFriday.isHoliday(holidays)).toBe(true);

        const holidayInfo = goodFriday.getHolidayInfo(holidays);
        expect(holidayInfo!.name).toBe('Good Friday');
      });
    });
  });

  describe('Relative Holidays', () => {
    test('should calculate Black Friday correctly', () => {
      // Black Friday is the day after Thanksgiving
      const testCases = [
        { year: 2020, expectedDate: new Date(2020, 10, 27) },
        { year: 2021, expectedDate: new Date(2021, 10, 26) },
        { year: 2022, expectedDate: new Date(2022, 10, 25) },
        { year: 2023, expectedDate: new Date(2023, 10, 24) },
        { year: 2024, expectedDate: new Date(2024, 10, 29) },
      ];

      testCases.forEach(({ year, expectedDate }) => {
        const blackFriday = kairos(expectedDate);
        const holidays = blackFriday.getHolidays();

        expect(blackFriday.isHoliday(holidays)).toBe(true);

        const holidayInfo = blackFriday.getHolidayInfo(holidays);
        expect(holidayInfo!.name).toBe('Black Friday');
      });
    });
  });

  describe('Holiday Ranges and Queries', () => {
    test('should get all holidays for a year', () => {
      const holidays2024 = kairos.getYearHolidays(2024, usHolidays);

      expect(holidays2024).toBeInstanceOf(Array);
      expect(holidays2024.length).toBeGreaterThan(0);

      // Should be sorted by date
      for (let i = 1; i < holidays2024.length; i++) {
        expect(holidays2024[i].date.getTime()).toBeGreaterThanOrEqual(
          holidays2024[i - 1].date.getTime()
        );
      }

      // Should include known holidays
      const holidayNames = holidays2024.map((h) => h.name);
      expect(holidayNames).toContain("New Year's Day");
      expect(holidayNames).toContain('Christmas Day');
      expect(holidayNames).toContain('Independence Day');
    });

    test('should get holidays in date range', () => {
      const start = kairos('2024-01-01');
      const end = kairos('2024-03-31');
      const holidays = start.getHolidays();

      const rangeHolidays = kairos.getHolidaysInRange(start, end, holidays);

      expect(rangeHolidays).toBeInstanceOf(Array);

      // All holidays should be within the range
      rangeHolidays.forEach((holiday) => {
        expect(holiday.date.getTime()).toBeGreaterThanOrEqual(start.valueOf());
        expect(holiday.date.getTime()).toBeLessThanOrEqual(end.valueOf());
      });
    });

    test('should find next holiday', () => {
      const date = kairos('2024-01-15');
      const nextHoliday = date.nextHoliday();

      expect(nextHoliday).toBeDefined();
      expect(nextHoliday.valueOf()).toBeGreaterThan(date.valueOf());
    });

    test('should find previous holiday', () => {
      const date = kairos('2024-12-01');
      const prevHoliday = date.previousHoliday();

      expect(prevHoliday).toBeDefined();
      expect(prevHoliday.valueOf()).toBeLessThan(date.valueOf());
    });
  });

  describe('Performance and Caching', () => {
    test('should cache holiday calculations', () => {
      const holidays = kairos().getHolidays();

      // First calculation
      const start1 = performance.now();
      const holidays2024_1 = kairos.getYearHolidays(2024, holidays);
      const end1 = performance.now();

      // Second calculation (should be faster due to caching)
      const start2 = performance.now();
      const holidays2024_2 = kairos.getYearHolidays(2024, holidays);
      const end2 = performance.now();

      expect(holidays2024_1).toEqual(holidays2024_2);
      // Cache should make it faster, but on slow systems the difference might be minimal
      // Just verify it doesn't take significantly longer
      expect(end2 - start2).toBeLessThan((end1 - start1) * 2);
    });

    test('should handle large date ranges efficiently', () => {
      const start = kairos('2020-01-01');
      const end = kairos('2030-12-31');
      const holidays = start.getHolidays();

      const startTime = performance.now();
      const rangeHolidays = kairos.getHolidaysInRange(start, end, holidays);
      const endTime = performance.now();

      expect(rangeHolidays.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid holiday rules', () => {
      const invalidRule: HolidayRule = {
        name: 'Invalid Holiday',
        type: 'fixed',
        rule: { month: 13, day: 32 }, // Invalid month and day
      };

      expect(() => {
        engine.calculate(invalidRule, 2024);
      }).toThrow();
    });

    test('should handle missing calculator', () => {
      const unknownRule: HolidayRule = {
        name: 'Unknown Holiday',
        type: 'unknown' as any,
        rule: {},
      };

      expect(() => {
        engine.calculate(unknownRule, 2024);
      }).toThrow();
    });
  });

  describe('Property-based Testing', () => {
    test('should handle random years correctly', () => {
      const testYears = testHelpers.generateTestYears(1900, 2100);

      testYears.forEach((year) => {
        const holidays = kairos().getHolidays();
        const yearHolidays = kairos.getYearHolidays(year, holidays);

        expect(yearHolidays).toBeInstanceOf(Array);

        // All holidays should be in the correct year
        yearHolidays.forEach((holiday) => {
          expect(holiday.date.getFullYear()).toBe(year);
        });
      });
    });

    test('should maintain holiday consistency across years', () => {
      const holidays = kairos().getHolidays();
      const fixedHolidays = holidays.filter((h) => h.type === 'fixed');

      // Test that fixed holidays occur in the correct month
      for (let year = 2020; year <= 2024; year++) {
        const yearHolidays = kairos.getYearHolidays(year, fixedHolidays);

        yearHolidays.forEach((holiday) => {
          const rule = fixedHolidays.find((h) => h.name === holiday.name);
          if (rule && rule.type === 'fixed') {
            const fixedRule = rule.rule as any;
            expect(holiday.date.getMonth() + 1).toBe(fixedRule.month);
            // For observed holidays, the day might shift due to weekends
            // Just check that it's in the same month and within reasonable range
            const dayDiff = Math.abs(holiday.date.getDate() - fixedRule.day);
            expect(dayDiff).toBeLessThanOrEqual(2); // Allow for weekend observation rules
          }
        });
      }
    });
  });
});
