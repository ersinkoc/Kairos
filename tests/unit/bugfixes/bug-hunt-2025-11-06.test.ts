/**
 * Bug Hunt Tests - 2025-11-06
 * Tests for bugs found and fixed during comprehensive bug hunt
 */

import { ISOParser } from '../../../src/plugins/parse/iso.js';
import { TimezoneManager } from '../../../src/plugins/timezone/timezone.js';
import { FiscalYearCalculator } from '../../../src/plugins/business/fiscal.js';

describe('Bug Hunt 2025-11-06 - Fixed Bugs', () => {
  describe('Bug #1: ISO Parser - Negative Timezone Offset with Zero Hours', () => {
    test('should correctly parse negative zero hour timezone offset (-00:30)', () => {
      const parser = new ISOParser();
      const negative = parser.parse('2024-01-01T12:00:00-00:30');
      const positive = parser.parse('2024-01-01T12:00:00+00:30');

      expect(negative).not.toBeNull();
      expect(positive).not.toBeNull();

      // -00:30 should be 30 minutes behind UTC
      // +00:30 should be 30 minutes ahead of UTC
      // The difference should be 60 minutes
      const diffMs = negative!.getTime() - positive!.getTime();
      expect(diffMs).toBe(60 * 60 * 1000); // 1 hour difference
    });

    test('should handle various fractional hour offsets', () => {
      const parser = new ISOParser();

      // Test India Standard Time (IST) - UTC+05:30
      const istPositive = parser.parse('2024-01-01T12:00:00+05:30');
      expect(istPositive).not.toBeNull();
      expect(istPositive!.getUTCHours()).toBe(6); // 12:00 +05:30 = 06:30 UTC
      expect(istPositive!.getUTCMinutes()).toBe(30);

      // Test hypothetical UTC-05:30
      const istNegative = parser.parse('2024-01-01T12:00:00-05:30');
      expect(istNegative).not.toBeNull();
      expect(istNegative!.getUTCHours()).toBe(17); // 12:00 -05:30 = 17:30 UTC
      expect(istNegative!.getUTCMinutes()).toBe(30);
    });

    test('should handle edge case of -00:15 and +00:15', () => {
      const parser = new ISOParser();
      const negative = parser.parse('2024-01-01T00:00:00-00:15');
      const positive = parser.parse('2024-01-01T00:00:00+00:15');

      expect(negative).not.toBeNull();
      expect(positive).not.toBeNull();

      // Difference should be 30 minutes
      const diffMs = negative!.getTime() - positive!.getTime();
      expect(diffMs).toBe(30 * 60 * 1000);
    });
  });

  describe('Bug #2: Timezone Offset Calculation Inverted', () => {
    test('should return positive offset for timezones east of UTC', () => {
      const date = new Date('2024-01-01T12:00:00Z');

      // Tokyo is UTC+9
      const tokyoOffset = TimezoneManager.getOffset(date, 'Asia/Tokyo');
      expect(tokyoOffset).toBe(540); // +9 hours = +540 minutes
    });

    test('should return negative offset for timezones west of UTC', () => {
      const date = new Date('2024-01-01T12:00:00Z');

      // New York is UTC-5 in winter
      const nyOffset = TimezoneManager.getOffset(date, 'America/New_York');
      expect(nyOffset).toBe(-300); // -5 hours = -300 minutes
    });

    test('should return zero offset for UTC', () => {
      const date = new Date('2024-01-01T12:00:00Z');
      const utcOffset = TimezoneManager.getOffset(date, 'UTC');
      expect(utcOffset).toBe(0);
    });

    test('should handle fractional hour offsets correctly', () => {
      const date = new Date('2024-01-01T12:00:00Z');

      // India is UTC+5:30
      const indiaOffset = TimezoneManager.getOffset(date, 'Asia/Kolkata');
      expect(indiaOffset).toBe(330); // +5.5 hours = +330 minutes
    });

    test('should correctly detect DST using offset comparison', () => {
      const date = new Date('2024-06-15T12:00:00Z'); // Summer
      const winter = new Date('2024-01-15T12:00:00Z'); // Winter

      const summerOffset = TimezoneManager.getOffset(date, 'America/New_York');
      const winterOffset = TimezoneManager.getOffset(winter, 'America/New_York');

      // Summer should have less negative offset (EDT is UTC-4)
      // Winter should have more negative offset (EST is UTC-5)
      expect(summerOffset).toBeGreaterThan(winterOffset);
    });
  });

  describe('Bug #3: Fiscal Quarter Year Calculation', () => {
    test('should calculate correct year for quarters in mid-year fiscal year', () => {
      const calc = new FiscalYearCalculator({ start: 7 }); // July fiscal year

      const q1 = calc.getFiscalQuarterStart(2024, 1); // Jul 2024
      expect(q1.getFullYear()).toBe(2024);
      expect(q1.getMonth()).toBe(6); // July (0-indexed)

      const q2 = calc.getFiscalQuarterStart(2024, 2); // Oct 2024
      expect(q2.getFullYear()).toBe(2024);
      expect(q2.getMonth()).toBe(9); // October

      const q3 = calc.getFiscalQuarterStart(2024, 3); // Jan 2025
      expect(q3.getFullYear()).toBe(2025); // Should be next calendar year!
      expect(q3.getMonth()).toBe(0); // January

      const q4 = calc.getFiscalQuarterStart(2024, 4); // Apr 2025
      expect(q4.getFullYear()).toBe(2025);
      expect(q4.getMonth()).toBe(3); // April
    });

    test('should calculate correct quarter end dates for mid-year fiscal year', () => {
      const calc = new FiscalYearCalculator({ start: 7 }); // July fiscal year

      const q1End = calc.getFiscalQuarterEnd(2024, 1); // Sep 30, 2024
      expect(q1End.getFullYear()).toBe(2024);
      expect(q1End.getMonth()).toBe(8); // September (0-indexed)
      expect(q1End.getDate()).toBe(30);

      const q2End = calc.getFiscalQuarterEnd(2024, 2); // Dec 31, 2024
      expect(q2End.getFullYear()).toBe(2024);
      expect(q2End.getMonth()).toBe(11); // December
      expect(q2End.getDate()).toBe(31);

      const q3End = calc.getFiscalQuarterEnd(2024, 3); // Mar 31, 2025
      expect(q3End.getFullYear()).toBe(2025); // Should be next calendar year!
      expect(q3End.getMonth()).toBe(2); // March
      expect(q3End.getDate()).toBe(31);

      const q4End = calc.getFiscalQuarterEnd(2024, 4); // Jun 30, 2025
      expect(q4End.getFullYear()).toBe(2025);
      expect(q4End.getMonth()).toBe(5); // June
      expect(q4End.getDate()).toBe(30);
    });

    test('should work correctly for calendar year fiscal year', () => {
      const calc = new FiscalYearCalculator({ start: 1 }); // January fiscal year

      const q1 = calc.getFiscalQuarterStart(2024, 1); // Jan 2024
      expect(q1.getFullYear()).toBe(2024);
      expect(q1.getMonth()).toBe(0);

      const q2 = calc.getFiscalQuarterStart(2024, 2); // Apr 2024
      expect(q2.getFullYear()).toBe(2024);
      expect(q2.getMonth()).toBe(3);

      const q3 = calc.getFiscalQuarterStart(2024, 3); // Jul 2024
      expect(q3.getFullYear()).toBe(2024);
      expect(q3.getMonth()).toBe(6);

      const q4 = calc.getFiscalQuarterStart(2024, 4); // Oct 2024
      expect(q4.getFullYear()).toBe(2024);
      expect(q4.getMonth()).toBe(9);
    });

    test('should work correctly for April fiscal year (UK, India, Japan)', () => {
      const calc = new FiscalYearCalculator({ start: 4 }); // April fiscal year

      const q1 = calc.getFiscalQuarterStart(2024, 1); // Apr 2024
      expect(q1.getFullYear()).toBe(2024);
      expect(q1.getMonth()).toBe(3);

      const q2 = calc.getFiscalQuarterStart(2024, 2); // Jul 2024
      expect(q2.getFullYear()).toBe(2024);
      expect(q2.getMonth()).toBe(6);

      const q3 = calc.getFiscalQuarterStart(2024, 3); // Oct 2024
      expect(q3.getFullYear()).toBe(2024);
      expect(q3.getMonth()).toBe(9);

      const q4 = calc.getFiscalQuarterStart(2024, 4); // Jan 2025
      expect(q4.getFullYear()).toBe(2025); // Should be next calendar year!
      expect(q4.getMonth()).toBe(0);
    });

    test('should work correctly for October fiscal year (US Federal)', () => {
      const calc = new FiscalYearCalculator({ start: 10 }); // October fiscal year

      const q1 = calc.getFiscalQuarterStart(2024, 1); // Oct 2024
      expect(q1.getFullYear()).toBe(2024);
      expect(q1.getMonth()).toBe(9);

      const q2 = calc.getFiscalQuarterStart(2024, 2); // Jan 2025
      expect(q2.getFullYear()).toBe(2025);
      expect(q2.getMonth()).toBe(0);

      const q3 = calc.getFiscalQuarterStart(2024, 3); // Apr 2025
      expect(q3.getFullYear()).toBe(2025);
      expect(q3.getMonth()).toBe(3);

      const q4 = calc.getFiscalQuarterStart(2024, 4); // Jul 2025
      expect(q4.getFullYear()).toBe(2025);
      expect(q4.getMonth()).toBe(6);
    });
  });
});
