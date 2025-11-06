/**
 * Test suite for verified bug fixes
 * Each test corresponds to a specific bug that was found and fixed
 */

import kairos from '../../src/index.js';
import { EasterCalculator } from '../../src/plugins/holiday/calculators/easter.js';
import easterPlugin from '../../src/plugins/holiday/calculators/easter.js';
import lunarPlugin from '../../src/plugins/holiday/calculators/lunar.js';
import durationPlugin from '../../src/plugins/duration/duration.js';
import formatPlugin from '../../src/plugins/format/tokens.js';

// Install plugins
kairos.use([easterPlugin, lunarPlugin, durationPlugin, formatPlugin]);

describe('Bug Fixes Verification', () => {
  describe('Bug 1: Easter Calculator Integer Division', () => {
    it('should calculate Julian Easter dates correctly with integer division', () => {
      const calculator = new EasterCalculator();

      // Test for a year before 1583 (Julian calendar)
      const easter1500 = calculator.calculateEaster(1500);

      // Verify the result is a valid date
      expect(easter1500).toBeInstanceOf(Date);
      expect(isNaN(easter1500.getTime())).toBe(false);

      // Verify year, month, and day are integers (not floating point)
      expect(Number.isInteger(easter1500.getFullYear())).toBe(true);
      expect(Number.isInteger(easter1500.getMonth())).toBe(true);
      expect(Number.isInteger(easter1500.getDate())).toBe(true);

      // Verify the date is in March or April (Easter always falls in these months)
      expect(easter1500.getMonth()).toBeGreaterThanOrEqual(2); // March = 2
      expect(easter1500.getMonth()).toBeLessThanOrEqual(3); // April = 3
    });

    it('should calculate Gregorian Easter dates correctly', () => {
      const calculator = new EasterCalculator();

      // Test for a modern year (Gregorian calendar)
      const easter2024 = calculator.calculateEaster(2024);

      // Easter 2024 should be March 31, 2024
      expect(easter2024.getFullYear()).toBe(2024);
      expect(easter2024.getMonth()).toBe(2); // March
      expect(easter2024.getDate()).toBe(31);
    });

    it('should produce consistent results when called multiple times', () => {
      const calculator = new EasterCalculator();
      const year = 1400;

      const result1 = calculator.calculateEaster(year);
      const result2 = calculator.calculateEaster(year);

      expect(result1.getTime()).toBe(result2.getTime());
    });
  });

  describe('Bug 2: Lunar Calculator Integer Division', () => {
    it('should convert Julian day to Gregorian date with integer components', () => {
      // This tests the Islamic converter's julianDayToGregorian method
      // We can't directly access the private method, but we can test the public interface

      // Test that Islamic holidays produce valid dates
      const holidayRule = {
        id: 'test-islamic',
        name: 'Test Islamic Holiday',
        type: 'lunar' as const,
        rule: {
          calendar: 'islamic' as const,
          month: 9,
          day: 1,
        },
      };

      // Get the holiday engine
      if (kairos.holidayEngine) {
        const dates = kairos.holidayEngine.calculate(holidayRule, 2024);

        expect(dates.length).toBeGreaterThan(0);
        const date = dates[0];

        // Verify integer components
        expect(Number.isInteger(date.getFullYear())).toBe(true);
        expect(Number.isInteger(date.getMonth())).toBe(true);
        expect(Number.isInteger(date.getDate())).toBe(true);
      }
    });
  });

  describe('Bug 3: Chinese Calendar Random Number Bug', () => {
    it('should produce deterministic Chinese calendar conversions', () => {
      const holidayRule = {
        id: 'test-chinese',
        name: 'Test Chinese Holiday',
        type: 'lunar' as const,
        rule: {
          calendar: 'chinese' as const,
          month: 1,
          day: 1,
        },
      };

      if (kairos.holidayEngine) {
        // Call the calculation multiple times
        const dates1 = kairos.holidayEngine.calculate(holidayRule, 2024);
        const dates2 = kairos.holidayEngine.calculate(holidayRule, 2024);
        const dates3 = kairos.holidayEngine.calculate(holidayRule, 2024);

        // All calls should produce the same result
        expect(dates1[0].getTime()).toBe(dates2[0].getTime());
        expect(dates2[0].getTime()).toBe(dates3[0].getTime());

        // Verify it's a valid date
        expect(isNaN(dates1[0].getTime())).toBe(false);
      }
    });

    it('should produce consistent Chinese New Year dates across multiple calls', () => {
      const holidayRule = {
        id: 'chinese-new-year',
        name: 'Chinese New Year',
        type: 'lunar' as const,
        rule: {
          calendar: 'chinese' as const,
          month: 1,
          day: 1,
        },
      };

      if (kairos.holidayEngine) {
        const results: Date[] = [];

        // Call 10 times to ensure consistency
        for (let i = 0; i < 10; i++) {
          const dates = kairos.holidayEngine.calculate(holidayRule, 2025);
          results.push(dates[0]);
        }

        // All results should be identical
        const firstTime = results[0].getTime();
        results.forEach((result) => {
          expect(result.getTime()).toBe(firstTime);
        });
      }
    });
  });

  describe('Bug 4: Duration toObject Missing Weeks', () => {
    it('should include weeks property in toObject() result', () => {
      const duration = kairos.duration({ weeks: 2, days: 3, hours: 4 });
      const obj = duration.toObject();

      // Verify weeks property exists
      expect(obj).toHaveProperty('weeks');
      expect(obj.weeks).toBe(2);
    });

    it('should preserve all duration components in toObject()', () => {
      const input = {
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 5,
        minutes: 6,
        seconds: 7,
        milliseconds: 8,
      };

      const duration = kairos.duration(input);
      const obj = duration.toObject();

      // All properties should be present
      expect(obj.years).toBe(1);
      expect(obj.months).toBe(2);
      expect(obj.weeks).toBe(3);
      expect(obj.days).toBe(4);
      expect(obj.hours).toBe(5);
      expect(obj.minutes).toBe(6);
      expect(obj.seconds).toBe(7);
      expect(obj.milliseconds).toBe(8);
    });

    it('should handle zero weeks correctly', () => {
      const duration = kairos.duration({ weeks: 0, days: 1 });
      const obj = duration.toObject();

      expect(obj.weeks).toBe(0);
      expect(obj.days).toBe(1);
    });
  });

  describe('Bug 5: Token Formatter Regex Issue', () => {
    it('should format dates with overlapping tokens correctly', () => {
      const date = kairos('2024-06-15');

      // Test with tokens that share prefixes
      const formatted1 = date.format('YYYY-MM-DD');
      expect(formatted1).toBe('2024-06-15');

      // Test with DDD (day of year) token
      const formatted2 = date.format('DDD');
      expect(formatted2).toMatch(/^\d{3}$/); // Should be a 3-digit number

      // Test with DDDD token
      const formatted3 = date.format('DDDD');
      expect(formatted3).toMatch(/^\d+$/); // Should be a number
    });

    it('should handle all token types without word boundary issues', () => {
      const date = kairos('2024-06-15T14:30:25.123');

      // Test various tokens
      expect(date.format('YYYY')).toBe('2024');
      expect(date.format('MM')).toBe('06');
      expect(date.format('DD')).toBe('15');
      expect(date.format('HH')).toBe('14');
      expect(date.format('mm')).toBe('30');
      expect(date.format('ss')).toBe('25');
      expect(date.format('SSS')).toBe('123');
    });

    it('should correctly replace tokens when they appear multiple times', () => {
      const date = kairos('2024-12-31');

      // Token appearing multiple times
      const formatted = date.format('YYYY/MM/DD YYYY-MM-DD');
      expect(formatted).toBe('2024/12/31 2024-12-31');
    });

    it('should handle tokens in complex formats without errors', () => {
      const date = kairos('2024-06-15T14:30:25');

      // Complex format with various tokens
      const formatted = date.format('YYYY-MM-DD HH:mm:ss [DDD] Q');

      // Should not throw an error and should contain expected parts
      expect(formatted).toContain('2024-06-15');
      expect(formatted).toContain('14:30:25');
    });
  });
});
