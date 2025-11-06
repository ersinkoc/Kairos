/**
 * Additional Bug Fixes Test Suite
 * Tests for Bugs 22-25 found in comprehensive bug hunt
 */

import kairos from '../../src/index.js';
import durationPlugin from '../../src/plugins/duration/duration.js';
import isoPlugin from '../../src/plugins/parse/iso.js';
import fiscalPlugin from '../../src/plugins/fiscal/fiscal.js';
import workdayPlugin from '../../src/plugins/business/workday.js';
import calendarPlugin from '../../src/plugins/calendar/calendar.js';
import { BusinessDayCalculator } from '../../src/plugins/business/workday.js';

// Install plugins
kairos.use([durationPlugin, isoPlugin, fiscalPlugin, workdayPlugin, calendarPlugin]);

describe('Additional Bug Fixes', () => {
  describe('Bug 22: Duration.divide() Division by Zero', () => {
    it('should throw error when dividing by zero', () => {
      const duration = kairos.duration({ hours: 2 });
      expect(() => {
        duration.divide(0);
      }).toThrow();
    });

    it('should throw error with descriptive message for division by zero', () => {
      const duration = kairos.duration(1000);
      expect(() => {
        duration.divide(0);
      }).toThrow(/divide.*zero/i);
    });

    it('should work correctly for valid divisors', () => {
      const duration = kairos.duration({ hours: 4 });
      const result = duration.divide(2);
      expect(result.asHours()).toBe(2);
    });

    it('should handle negative divisors', () => {
      const duration = kairos.duration({ hours: 4 });
      const result = duration.divide(-2);
      expect(result.asHours()).toBe(-2);
    });

    it('should handle fractional divisors', () => {
      const duration = kairos.duration({ hours: 3 });
      const result = duration.divide(0.5);
      expect(result.asHours()).toBe(6);
    });
  });

  describe('Bug 23: ISO Parser Milliseconds Regex Too Strict', () => {
    it('should parse ISO strings with 1-digit milliseconds', () => {
      const date = kairos.parseISO('2024-01-15T14:30:25.1Z');
      expect(date).not.toBeNull();
      if (date) {
        expect(date.toDate().getUTCMilliseconds()).toBe(100);
      }
    });

    it('should parse ISO strings with 2-digit milliseconds', () => {
      const date = kairos.parseISO('2024-01-15T14:30:25.12Z');
      expect(date).not.toBeNull();
      if (date) {
        expect(date.toDate().getUTCMilliseconds()).toBe(120);
      }
    });

    it('should parse ISO strings with 3-digit milliseconds', () => {
      const date = kairos.parseISO('2024-01-15T14:30:25.123Z');
      expect(date).not.toBeNull();
      if (date) {
        expect(date.toDate().getUTCMilliseconds()).toBe(123);
      }
    });

    it('should parse ISO strings with milliseconds and timezone offset', () => {
      const date1 = kairos.parseISO('2024-01-15T14:30:25.5+05:30');
      expect(date1).not.toBeNull();
      if (date1) {
        expect(date1.toDate().getUTCMilliseconds()).toBe(500);
      }

      const date2 = kairos.parseISO('2024-01-15T14:30:25.12-03:00');
      expect(date2).not.toBeNull();
      if (date2) {
        expect(date2.toDate().getUTCMilliseconds()).toBe(120);
      }
    });

    it('should validate ISO strings with variable milliseconds correctly', () => {
      expect(kairos.isValidISO('2024-01-15T14:30:25.1Z')).toBe(true);
      expect(kairos.isValidISO('2024-01-15T14:30:25.12Z')).toBe(true);
      expect(kairos.isValidISO('2024-01-15T14:30:25.123Z')).toBe(true);
    });
  });

  describe('Bug 24: Fiscal Quarter End Date Month Indexing', () => {
    it('should calculate fiscal quarter end correctly with startMonth=1', () => {
      // Q1 (Jan-Mar) should end on March 31
      const date = kairos('2024-02-15');
      const quarterEnd = date.endOfFiscalQuarter({ startMonth: 1 });

      expect(quarterEnd.year()).toBe(2024);
      expect(quarterEnd.month()).toBe(3); // March
      expect(quarterEnd.date()).toBe(31); // Last day of March
    });

    it('should calculate fiscal quarter end correctly with startMonth=4', () => {
      // Date in Q1 (Apr-Jun) should end on June 30
      const date = kairos('2024-05-15');
      const quarterEnd = date.endOfFiscalQuarter({ startMonth: 4 });

      expect(quarterEnd.year()).toBe(2024);
      expect(quarterEnd.month()).toBe(6); // June
      expect(quarterEnd.date()).toBe(30); // Last day of June
    });

    it('should calculate fiscal quarter end correctly with startMonth=7', () => {
      // Date in Q2 (Oct-Dec) should end on Dec 31
      const date = kairos('2024-11-15');
      const quarterEnd = date.endOfFiscalQuarter({ startMonth: 7 });

      expect(quarterEnd.year()).toBe(2024);
      expect(quarterEnd.month()).toBe(12); // December
      expect(quarterEnd.date()).toBe(31); // Last day of December
    });

    it('should handle fiscal quarter spanning year boundary', () => {
      // Date in Q4 of fiscal year 2023 (starting Apr 2023): Jan-Mar 2024
      // Feb 15, 2024 is in Q4, which ends March 31, 2024
      const date = kairos('2024-02-15');
      const quarterEnd = date.endOfFiscalQuarter({ startMonth: 4 });

      expect(quarterEnd.year()).toBe(2024);
      expect(quarterEnd.month()).toBe(3); // March
      expect(quarterEnd.date()).toBe(31);
    });

    it('should set time to end of day for quarter end', () => {
      const date = kairos('2024-05-15T10:30:00');
      const quarterEnd = date.endOfFiscalQuarter({ startMonth: 4 });

      expect(quarterEnd.hour()).toBe(23);
      expect(quarterEnd.minute()).toBe(59);
      expect(quarterEnd.second()).toBe(59);
    });
  });

  describe('Bug 25: Business Day Cache Timezone Mismatch', () => {
    it('should cache business day results correctly for dates near timezone boundaries', () => {
      const calc = new BusinessDayCalculator({
        weekends: [0, 6], // Sunday, Saturday
        holidays: [],
      });

      // Create a date near midnight
      const date1 = new Date('2024-01-15T23:59:00'); // Monday, 11:59 PM
      const result1 = calc.isBusinessDay(date1);

      // Same date, different time
      const date2 = new Date('2024-01-15T00:01:00'); // Monday, 12:01 AM
      const result2 = calc.isBusinessDay(date2);

      // Both should give the same result (both are Monday)
      expect(result1).toBe(result2);
      expect(result1).toBe(true); // Monday is a business day
    });

    it('should handle dates consistently regardless of UTC offset', () => {
      const calc = new BusinessDayCalculator({
        weekends: [0, 6],
        holidays: [],
      });

      // Test the same date multiple times
      const date = new Date('2024-01-15T10:00:00'); // Monday morning
      const results: boolean[] = [];

      for (let i = 0; i < 5; i++) {
        results.push(calc.isBusinessDay(date));
      }

      // All results should be the same
      expect(results.every((r) => r === results[0])).toBe(true);
      expect(results[0]).toBe(true); // Monday is a business day
    });

    it('should correctly identify weekend vs weekday near timezone boundaries', () => {
      const calc = new BusinessDayCalculator({
        weekends: [0, 6],
        holidays: [],
      });

      // Friday late evening
      const friday = new Date('2024-01-12T23:00:00'); // Friday
      expect(calc.isBusinessDay(friday)).toBe(true);

      // Saturday early morning
      const saturday = new Date('2024-01-13T01:00:00'); // Saturday
      expect(calc.isBusinessDay(saturday)).toBe(false);
    });

    it('should produce consistent cache keys for same local date', () => {
      const calc = new BusinessDayCalculator({
        weekends: [0, 6],
        holidays: [],
      });

      // Clear cache to start fresh
      calc.clearCache();

      // Create two dates with same local date but different times
      const morning = new Date('2024-01-15T08:00:00');
      const evening = new Date('2024-01-15T20:00:00');

      const result1 = calc.isBusinessDay(morning);
      const result2 = calc.isBusinessDay(evening);

      // Both should use cache and return same result
      expect(result1).toBe(result2);
      expect(result1).toBe(true); // Monday is a business day
    });
  });

  describe('Bug 26: Missing Input Validation in dayOfYear Setter', () => {
    it('should throw error when dayOfYear exceeds days in year', () => {
      const date = kairos('2025-01-15'); // 2025 is not a leap year (365 days)

      expect(() => {
        date.dayOfYear(366); // 366 is invalid for non-leap year
      }).toThrow();
    });

    it('should throw error when dayOfYear is less than 1', () => {
      const date = kairos('2024-06-15');

      expect(() => {
        date.dayOfYear(0);
      }).toThrow();

      expect(() => {
        date.dayOfYear(-1);
      }).toThrow();
    });

    it('should accept valid dayOfYear for non-leap year', () => {
      const date = kairos('2025-01-01');

      // Valid values for non-leap year (1-365)
      const result1 = date.dayOfYear(1);
      expect(result1.dayOfYear()).toBe(1);

      const result365 = date.dayOfYear(365);
      expect(result365.dayOfYear()).toBe(365);
      expect(result365.year()).toBe(2025); // Should stay in same year
    });

    it('should accept valid dayOfYear for leap year', () => {
      const date = kairos('2024-01-01'); // 2024 is a leap year

      // Valid values for leap year (1-366)
      const result1 = date.dayOfYear(1);
      expect(result1.dayOfYear()).toBe(1);

      const result366 = date.dayOfYear(366);
      expect(result366.dayOfYear()).toBe(366);
      expect(result366.year()).toBe(2024); // Should stay in same year
    });

    it('should throw error when setting dayOfYear 366 on non-leap year', () => {
      const date = kairos('2023-06-15'); // 2023 is not a leap year

      expect(() => {
        date.dayOfYear(366);
      }).toThrow(/day of year/i);
    });

    it('should preserve year when setting valid dayOfYear', () => {
      const date = kairos('2024-06-15');

      const result = date.dayOfYear(100);
      expect(result.year()).toBe(2024);
      expect(result.dayOfYear()).toBe(100);
    });
  });
});
