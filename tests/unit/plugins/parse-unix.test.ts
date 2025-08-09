import { describe, test, expect, beforeEach } from '@jest/globals';
import kairos from '../../../src/core/plugin-system.js';
import unixPlugin, { UnixTimestampParser } from '../../../src/plugins/parse/unix.js';

// Load Unix timestamp plugin
kairos.use(unixPlugin);

describe('Unix Timestamp Parser Plugin', () => {
  describe('UnixTimestampParser', () => {
    test('should parse valid Unix timestamps in seconds', () => {
      const parser = new UnixTimestampParser();
      
      const testCases = [
        { input: '1640995200', expected: new Date('2022-01-01T00:00:00Z') }, // Jan 1, 2022
        { input: '1609459200', expected: new Date('2021-01-01T00:00:00Z') }, // Jan 1, 2021
        { input: '946684800', expected: new Date('2000-01-01T00:00:00Z') }, // Y2K
        { input: '0', expected: new Date('1970-01-01T00:00:00Z') }, // Unix epoch
        { input: 1640995200, expected: new Date('2022-01-01T00:00:00Z') } // Number input
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBe(expected.getTime());
      });
    });

    test('should parse valid Unix timestamps in milliseconds', () => {
      const parser = new UnixTimestampParser();
      
      const testCases = [
        { input: '1640995200000', expected: new Date('2022-01-01T00:00:00Z') },
        { input: '1609459200500', expected: new Date('2021-01-01T00:00:00.500Z') },
        { input: 1640995200000, expected: new Date('2022-01-01T00:00:00Z') }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBe(expected.getTime());
      });
    });

    test('should parse valid Unix timestamps in microseconds', () => {
      const parser = new UnixTimestampParser();
      
      const testCases = [
        { input: '1640995200000000', expected: new Date('2022-01-01T00:00:00Z') },
        { input: '1640995200500000', expected: new Date('2022-01-01T00:00:00.500Z') }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBe(expected.getTime());
      });
    });

    test('should parse valid Unix timestamps in nanoseconds', () => {
      const parser = new UnixTimestampParser();
      
      const testCases = [
        { input: '1640995200000000000', expected: new Date('2022-01-01T00:00:00Z') },
        { input: '1640995200500000000', expected: new Date('2022-01-01T00:00:00.500Z') }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBe(expected.getTime());
      });
    });

    test('should return null for invalid inputs', () => {
      const parser = new UnixTimestampParser();
      
      const invalidInputs = [
        null,
        undefined,
        '',
        'invalid',
        '123abc',
        'abc123',
        'not-a-number',
        '12.34', // Decimal not supported
        '-1640995200', // Negative timestamps
        '99999999999999999999' // Too large
      ];

      invalidInputs.forEach(input => {
        const result = parser.parse(input as any);
        expect(result).toBeNull();
      });
    });

    test('should handle edge case timestamps', () => {
      const parser = new UnixTimestampParser();
      
      // Year 2038 problem boundary (32-bit signed integer limit)
      const year2038 = parser.parse('2147483647'); // Jan 19, 2038
      expect(year2038).not.toBeNull();
      expect(year2038!.getFullYear()).toBe(2038);

      // Future dates within reasonable range
      const year2050 = parser.parse('2524608000'); // Jan 1, 2050
      expect(year2050).not.toBeNull();
      expect(year2050!.getFullYear()).toBe(2050);
    });

    test('should reject unreasonable dates', () => {
      const parser = new UnixTimestampParser();
      
      // Dates too far in the past or future
      const tooEarly = parser.parse('0'); // 1970 is valid
      expect(tooEarly).not.toBeNull();

      const tooFarFuture = parser.parse('4102444800'); // Year 2100 (Jan 1, 2100)
      expect(tooFarFuture).toBeNull();
    });

    test('should convert dates to Unix timestamps', () => {
      const parser = new UnixTimestampParser();
      const testDate = new Date('2022-01-01T00:00:00Z');

      expect(parser.toUnix(testDate, 'seconds')).toBe(1640995200);
      expect(parser.toUnix(testDate, 'milliseconds')).toBe(1640995200000);
      expect(parser.toUnix(testDate, 'microseconds')).toBe(1640995200000000);
      expect(parser.toUnix(testDate, 'nanoseconds')).toBe(1640995200000000000);
      expect(parser.toUnix(testDate)).toBe(1640995200); // Default to seconds
    });

    test('should validate Unix timestamp format', () => {
      const parser = new UnixTimestampParser();

      // Valid timestamps
      expect(parser.isUnixTimestamp('1640995200')).toBe(true); // 10 digits
      expect(parser.isUnixTimestamp('1640995200000')).toBe(true); // 13 digits
      expect(parser.isUnixTimestamp('1640995200000000')).toBe(true); // 16 digits
      expect(parser.isUnixTimestamp('1640995200000000000')).toBe(true); // 19 digits
      expect(parser.isUnixTimestamp(1640995200)).toBe(true); // Number

      // Invalid timestamps
      expect(parser.isUnixTimestamp('164099520')).toBe(false); // 9 digits
      expect(parser.isUnixTimestamp('16409952000')).toBe(false); // 11 digits
      expect(parser.isUnixTimestamp('abc123')).toBe(false); // Contains letters
      expect(parser.isUnixTimestamp('123.456')).toBe(false); // Decimal
      expect(parser.isUnixTimestamp('')).toBe(false); // Empty string
    });
  });

  describe('Static Methods', () => {
    test('should parse Unix timestamps statically', () => {
      const result = kairos.unix(1640995200);
      expect(result).not.toBeNull();
      expect(result.format).toBeDefined();
      expect(result.year()).toBe(2022);
    });

    test('should use fromUnix alias', () => {
      const result = kairos.fromUnix('1640995200');
      expect(result).not.toBeNull();
      expect(result.format).toBeDefined();
      expect(result.year()).toBe(2022);
    });

    test('should validate Unix timestamp format statically', () => {
      expect(kairos.isUnixTimestamp('1640995200')).toBe(true);
      expect(kairos.isUnixTimestamp('invalid')).toBe(false);
      expect(kairos.isUnixTimestamp(1640995200)).toBe(true);
    });

    test('should return null for invalid Unix timestamps', () => {
      expect(kairos.unix('invalid')).toBeNull();
      expect(kairos.unix('')).toBeNull();
      expect(kairos.fromUnix('abc123')).toBeNull();
    });
  });

  describe('Instance Methods', () => {
    test('should convert instances to Unix timestamps', () => {
      const date = kairos('2022-01-01T00:00:00Z');
      
      expect(date.unix()).toBe(1640995200); // Default to seconds
      expect(date.unix('seconds')).toBe(1640995200);
      expect(date.unix('milliseconds')).toBe(1640995200000);
      expect(date.unix('microseconds')).toBe(1640995200000000);
      expect(date.unix('nanoseconds')).toBe(1640995200000000000);
    });

    test('should use toUnix alias', () => {
      const date = kairos('2022-01-01T00:00:00Z');
      
      expect(date.toUnix()).toBe(1640995200);
      expect(date.toUnix('milliseconds')).toBe(1640995200000);
    });

    test('should format relative time with fromNow', () => {
      const now = Date.now();
      const pastDate = kairos(new Date(now - 30000)); // 30 seconds ago
      const futureDate = kairos(new Date(now + 30000)); // 30 seconds from now

      expect(pastDate.fromNow()).toMatch(/\d+ seconds ago/);
      expect(futureDate.fromNow()).toMatch(/in \d+ seconds/);
    });

    test('should handle various time units in fromNow', () => {
      const now = Date.now();

      // Minutes
      const minutesAgo = kairos(new Date(now - 5 * 60 * 1000));
      expect(minutesAgo.fromNow()).toMatch(/5 minutes ago/);

      // Hours
      const hoursAgo = kairos(new Date(now - 3 * 60 * 60 * 1000));
      expect(hoursAgo.fromNow()).toMatch(/3 hours ago/);

      // Days
      const daysAgo = kairos(new Date(now - 5 * 24 * 60 * 60 * 1000));
      expect(daysAgo.fromNow()).toMatch(/5 days ago/);

      // Months
      const monthsAgo = kairos(new Date(now - 3 * 30 * 24 * 60 * 60 * 1000));
      expect(monthsAgo.fromNow()).toMatch(/3 months ago/);

      // Years
      const yearsAgo = kairos(new Date(now - 2 * 12 * 30 * 24 * 60 * 60 * 1000));
      expect(yearsAgo.fromNow()).toMatch(/2 years ago/);
    });
  });

  describe('Integration with Main Parser', () => {
    test('should automatically parse Unix timestamps', () => {
      const unixTimestamp = '1640995200';
      const parsed = kairos.parse(unixTimestamp);
      
      expect(parsed).not.toBeNull();
      expect(parsed.format).toBeDefined();
      expect(parsed.year()).toBe(2022);
      expect(parsed.month()).toBe(1); // January
      expect(parsed.date()).toBe(1);
    });

    test('should handle millisecond Unix timestamps in parse', () => {
      const unixTimestamp = '1640995200000';
      const parsed = kairos.parse(unixTimestamp);
      
      expect(parsed).not.toBeNull();
      expect(parsed.year()).toBe(2022);
    });

    test('should fallback to other parsers for non-Unix formats', () => {
      const isoString = '2022-01-01T00:00:00Z';
      const parsed = kairos.parse(isoString);
      
      expect(parsed).not.toBeNull();
      expect(parsed.format).toBeDefined();
    });

    test('should not interfere with other valid date formats', () => {
      const regularDate = '2022-01-01';
      const parsed = kairos.parse(regularDate);
      
      expect(parsed).not.toBeNull();
      expect(parsed.year()).toBe(2022);
    });
  });

  describe('Edge Cases', () => {
    test('should handle Unix epoch correctly', () => {
      const epochSeconds = kairos.unix(0);
      expect(epochSeconds).not.toBeNull();
      expect(epochSeconds.year()).toBe(1970);
      expect(epochSeconds.month()).toBe(1);
      expect(epochSeconds.date()).toBe(1);
    });

    test('should handle leap years in Unix timestamps', () => {
      const leapYearTimestamp = '1582934400'; // 2020-02-29 00:00:00
      const leapDate = kairos.unix(leapYearTimestamp);
      
      expect(leapDate).not.toBeNull();
      expect(leapDate.year()).toBe(2020);
      expect(leapDate.month()).toBe(2);
      expect(leapDate.date()).toBe(29);
    });

    test('should handle DST transitions', () => {
      // Spring forward date
      const springTimestamp = '1647669600'; // 2022-03-19 12:00:00 UTC
      const springDate = kairos.unix(springTimestamp);
      
      expect(springDate).not.toBeNull();
      expect(springDate.year()).toBe(2022);
      expect(springDate.month()).toBe(3);
    });

    test('should maintain precision for millisecond timestamps', () => {
      const timestampWithMs = 1640995200500; // .500 seconds
      const dateWithMs = kairos.unix(timestampWithMs);
      
      expect(dateWithMs).not.toBeNull();
      expect(dateWithMs.toDate().getMilliseconds()).toBe(500);
    });

    test('should handle boundary values correctly', () => {
      // Test 32-bit signed integer boundaries
      const maxInt32 = kairos.unix(2147483647); // 2038-01-19
      expect(maxInt32).not.toBeNull();
      expect(maxInt32.year()).toBe(2038);

      // Test common timestamp formats
      const tenDigits = kairos.unix('1234567890'); // 2009-02-13
      expect(tenDigits).not.toBeNull();
      expect(tenDigits.year()).toBe(2009);
    });
  });

  describe('Performance', () => {
    test('should parse Unix timestamps efficiently', () => {
      const timestamp = '1640995200';
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        kairos.unix(timestamp);
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    test('should convert to Unix timestamps efficiently', () => {
      const date = kairos('2022-01-01T00:00:00Z');
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        date.unix();
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    test('should validate Unix format efficiently', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        kairos.isUnixTimestamp('1640995200');
        kairos.isUnixTimestamp('invalid');
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });
  });
});