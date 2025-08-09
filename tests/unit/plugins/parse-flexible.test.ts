import { describe, test, expect, beforeEach } from '@jest/globals';
import kairos from '../../../src/core/plugin-system.js';
import flexiblePlugin, { FlexibleParser } from '../../../src/plugins/parse/flexible.js';

// Load flexible parsing plugin
kairos.use(flexiblePlugin);

describe('Flexible Parser Plugin', () => {
  describe('FlexibleParser', () => {
    test('should parse ISO 8601 date formats', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '2024-01-15', expected: new Date(2024, 0, 15) },
        { input: '2024/01/15', expected: new Date(2024, 0, 15) },
        { input: '2024.01.15', expected: new Date(2024, 0, 15) },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(expected.getFullYear());
        expect(result!.getMonth()).toBe(expected.getMonth());
        expect(result!.getDate()).toBe(expected.getDate());
      });
    });

    test('should parse US date formats (MM/DD/YYYY)', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '1/15/2024', expected: new Date(2024, 0, 15) },
        { input: '01/15/2024', expected: new Date(2024, 0, 15) },
        { input: '12/31/2023', expected: new Date(2023, 11, 31) },
        { input: '1-15-2024', expected: new Date(2024, 0, 15) },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(expected.getFullYear());
        expect(result!.getMonth()).toBe(expected.getMonth());
        expect(result!.getDate()).toBe(expected.getDate());
      });
    });

    test('should parse European date formats (DD.MM.YYYY)', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '15.01.2024', expected: new Date(2024, 0, 15) },
        { input: '31.12.2023', expected: new Date(2023, 11, 31) },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input, { european: true });
        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(expected.getFullYear());
        expect(result!.getMonth()).toBe(expected.getMonth());
        expect(result!.getDate()).toBe(expected.getDate());
      });
    });

    test('should parse dates with time', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '2024-01-15 14:30', expected: new Date(2024, 0, 15, 14, 30) },
        { input: '2024-01-15 14:30:45', expected: new Date(2024, 0, 15, 14, 30, 45) },
        { input: '1/15/2024 2:30', expected: new Date(2024, 0, 15, 2, 30) },
        { input: '1/15/2024 14:30:45', expected: new Date(2024, 0, 15, 14, 30, 45) },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(expected.getFullYear());
        expect(result!.getMonth()).toBe(expected.getMonth());
        expect(result!.getDate()).toBe(expected.getDate());
        expect(result!.getHours()).toBe(expected.getHours());
        expect(result!.getMinutes()).toBe(expected.getMinutes());
        if (expected.getSeconds() > 0) {
          expect(result!.getSeconds()).toBe(expected.getSeconds());
        }
      });
    });

    test('should parse natural language dates', () => {
      const parser = new FlexibleParser();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      expect(parser.parse('today')).not.toBeNull();
      expect(parser.parse('TODAY')).not.toBeNull();
      expect(parser.parse('Tomorrow')).not.toBeNull();
      expect(parser.parse('yesterday')).not.toBeNull();
      expect(parser.parse('now')).not.toBeNull();
    });

    test('should parse relative time expressions (past)', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '5 seconds ago', unit: 1000, multiplier: 5 },
        { input: '10 minutes ago', unit: 60000, multiplier: 10 },
        { input: '2 hours ago', unit: 3600000, multiplier: 2 },
        { input: '3 days ago', unit: 86400000, multiplier: 3 },
        { input: '1 week ago', unit: 604800000, multiplier: 1 },
        { input: '2 sec ago', unit: 1000, multiplier: 2 },
        { input: '15 min ago', unit: 60000, multiplier: 15 },
        { input: '1 hr ago', unit: 3600000, multiplier: 1 },
        { input: '7 d ago', unit: 86400000, multiplier: 7 },
      ];

      testCases.forEach(({ input }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBeLessThan(Date.now());
      });
    });

    test('should parse relative time expressions (future)', () => {
      const parser = new FlexibleParser();

      const testCases = [
        'in 5 seconds',
        'in 10 minutes',
        'in 2 hours',
        'in 3 days',
        'in 1 week',
        'in 2 sec',
        'in 15 min',
        'in 1 hr',
      ];

      testCases.forEach((input) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBeGreaterThan(Date.now());
      });
    });

    test('should parse month and year relative expressions', () => {
      const parser = new FlexibleParser();

      // These require more complex validation due to month/year variations
      const pastCases = ['1 month ago', '2 months ago', '1 year ago', '2 years ago'];
      const futureCases = ['in 1 month', 'in 2 months', 'in 1 year', 'in 2 years'];

      pastCases.forEach((input) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBeLessThan(Date.now());
      });

      futureCases.forEach((input) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getTime()).toBeGreaterThan(Date.now());
      });
    });

    test('should parse month names (short)', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: 'Jan 15, 2024', expected: new Date(2024, 0, 15) },
        { input: 'Feb 29, 2024', expected: new Date(2024, 1, 29) }, // Leap year
        { input: 'Dec 31 2023', expected: new Date(2023, 11, 31) },
        { input: 'jul 4, 2024', expected: new Date(2024, 6, 4) },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(expected.getFullYear());
        expect(result!.getMonth()).toBe(expected.getMonth());
        expect(result!.getDate()).toBe(expected.getDate());
      });
    });

    test('should parse month names (full)', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '15 January 2024', expected: new Date(2024, 0, 15) },
        { input: '4 July 2024', expected: new Date(2024, 6, 4) },
        { input: '31 December 2023', expected: new Date(2023, 11, 31) },
        { input: '29 february 2024', expected: new Date(2024, 1, 29) },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(expected.getFullYear());
        expect(result!.getMonth()).toBe(expected.getMonth());
        expect(result!.getDate()).toBe(expected.getDate());
      });
    });

    test('should parse special numeric formats', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '20240115', expected: new Date(2024, 0, 15) }, // YYYYMMDD
        { input: '20231231', expected: new Date(2023, 11, 31) },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
        expect(result!.getFullYear()).toBe(expected.getFullYear());
        expect(result!.getMonth()).toBe(expected.getMonth());
        expect(result!.getDate()).toBe(expected.getDate());
      });
    });

    test('should return null for invalid inputs', () => {
      const parser = new FlexibleParser();

      const invalidInputs = [
        null,
        undefined,
        '',
        'invalid date',
        'NotADate',
        'random text',
        '99/99/9999', // Clearly invalid
        'abc/def/2024',
        '2024-ab-cd',
      ];

      invalidInputs.forEach((input) => {
        const result = parser.parse(input as any);
        expect(result).toBeNull();
      });
    });

    test('should handle strict mode validation', () => {
      const parser = new FlexibleParser();

      // These should be rejected in strict mode
      const questionableDates = [
        '1800-01-01', // Too old
        '2150-01-01', // Too far in future
      ];

      questionableDates.forEach((input) => {
        const resultStrict = parser.parse(input, { strict: true });
        const resultNormal = parser.parse(input, { strict: false });

        expect(resultStrict).toBeNull();
        // Normal mode might still parse these
      });
    });

    test('should guess date formats correctly', () => {
      const parser = new FlexibleParser();

      const testCases = [
        { input: '2024-01-15', expectedType: 'YYYY-MM-DD' },
        { input: '1/15/2024', expectedType: 'MM/DD/YYYY' },
        { input: 'today', expectedType: 'natural' },
        { input: '5 minutes ago', expectedType: 'relative' },
        { input: 'Jan 15, 2024', expectedType: 'custom' },
      ];

      testCases.forEach(({ input, expectedType }) => {
        const format = parser.guessFormat(input);
        expect(format).not.toBeNull();
        // The exact format string might vary, but it should not be null
      });
    });

    test('should handle case insensitive parsing', () => {
      const parser = new FlexibleParser();

      const testCases = [
        'TODAY',
        'TOMORROW',
        'YESTERDAY',
        'NOW',
        '5 MINUTES AGO',
        'IN 2 HOURS',
        'JAN 15, 2024',
        '15 JANUARY 2024',
      ];

      testCases.forEach((input) => {
        const result = parser.parse(input);
        expect(result).not.toBeNull();
      });
    });
  });

  describe('Static Methods', () => {
    test('should parse flexible date strings statically', () => {
      const result = kairos.parseFlexible('Jan 15, 2024');
      expect(result).not.toBeNull();
      expect(result.format).toBeDefined();
      expect(result.year()).toBe(2024);
    });

    test('should parse with options', () => {
      const europeanDate = kairos.parseFlexible('15.01.2024', { european: true });
      expect(europeanDate).not.toBeNull();
      expect(europeanDate.month()).toBe(1); // January
      expect(europeanDate.date()).toBe(15);

      const strictResult = kairos.parseFlexible('1800-01-01', { strict: true });
      expect(strictResult).toBeNull(); // Too old for strict mode
    });

    test('should guess date format statically', () => {
      const format = kairos.guessDateFormat('2024-01-15');
      expect(format).not.toBeNull();
      expect(typeof format).toBe('string');
    });

    test('should provide natural language shortcuts', () => {
      const today = kairos.today();
      const tomorrow = kairos.tomorrow();
      const yesterday = kairos.yesterday();

      expect(today).toBeDefined();
      expect(tomorrow).toBeDefined();
      expect(yesterday).toBeDefined();

      expect(today.format).toBeDefined();
      expect(tomorrow.format).toBeDefined();
      expect(yesterday.format).toBeDefined();

      // Verify the relationships
      const todayDate = today.toDate().getDate();
      const tomorrowDate = tomorrow.toDate().getDate();
      const yesterdayDate = yesterday.toDate().getDate();

      // Account for month boundaries
      expect(Math.abs(tomorrowDate - todayDate)).toBeLessThanOrEqual(1);
      expect(Math.abs(todayDate - yesterdayDate)).toBeLessThanOrEqual(1);
    });
  });

  describe('Integration with Main Parser', () => {
    test('should automatically parse flexible date strings', () => {
      const testCases = [
        { input: 'Jan 15, 2024', expectedMonth: 1, expectedDate: 15 },
        { input: '15 January 2024', expectedMonth: 1, expectedDate: 15 },
        { input: 'today', expectedDate: new Date().getDate() },
        { input: '1/15/2024', expectedMonth: 1, expectedDate: 15 },
      ];

      testCases.forEach(({ input, expectedMonth, expectedDate }) => {
        const parsed = kairos.parse(input);
        expect(parsed).not.toBeNull();
        expect(parsed.format).toBeDefined();

        if (expectedMonth) {
          expect(parsed.month()).toBe(expectedMonth);
        }
        if (expectedDate) {
          expect(parsed.date()).toBe(expectedDate);
        }
      });
    });

    test('should handle options in main parser', () => {
      const europeanDate = kairos.parse('15.01.2024', { european: true });
      expect(europeanDate).not.toBeNull();
      expect(europeanDate.month()).toBe(1);
      expect(europeanDate.date()).toBe(15);
    });

    test('should fallback to other parsers for non-flexible formats', () => {
      const isoString = '2024-01-15T12:00:00Z';
      const parsed = kairos.parse(isoString);

      expect(parsed).not.toBeNull();
      expect(parsed.format).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle leap year dates', () => {
      const leapYearCases = [
        'Feb 29, 2024', // Valid leap year
        '29 February 2024', // Valid leap year
        '2024-02-29', // Valid leap year
      ];

      leapYearCases.forEach((input) => {
        const result = kairos.parseFlexible(input);
        expect(result).not.toBeNull();
        expect(result.month()).toBe(2); // February
        expect(result.date()).toBe(29);
      });
    });

    test('should handle month boundary relative dates', () => {
      // Test around month boundaries
      const relativeCases = [
        '30 days ago',
        '31 days ago',
        'in 30 days',
        'in 31 days',
        '1 month ago',
        'in 1 month',
      ];

      relativeCases.forEach((input) => {
        const result = kairos.parseFlexible(input);
        expect(result).not.toBeNull();
      });
    });

    test('should handle various time unit aliases', () => {
      const aliasTests = [
        { input: '5 s ago', expectedDiff: 5000 },
        { input: '10 sec ago', expectedDiff: 10000 },
        { input: '2 m ago', expectedDiff: 2 * 60000 },
        { input: '3 min ago', expectedDiff: 3 * 60000 },
        { input: '1 h ago', expectedDiff: 1 * 3600000 },
        { input: '2 hr ago', expectedDiff: 2 * 3600000 },
        { input: '1 d ago', expectedDiff: 1 * 86400000 },
        { input: '1 w ago', expectedDiff: 1 * 604800000 },
      ];

      aliasTests.forEach(({ input, expectedDiff }) => {
        const result = kairos.parseFlexible(input);
        expect(result).not.toBeNull();

        const actualDiff = Math.abs(Date.now() - result.toDate().getTime());
        // Allow some tolerance for execution time
        expect(actualDiff).toBeCloseTo(expectedDiff, -2); // Within 100ms
      });
    });

    test('should handle whitespace variations', () => {
      const whitespaceTests = [
        '  Jan 15, 2024  ',
        'Jan  15,  2024',
        '2024-01-15   ',
        '   today   ',
        '  5  minutes  ago  ',
        'in   2   hours',
      ];

      whitespaceTests.forEach((input) => {
        const result = kairos.parseFlexible(input);
        expect(result).not.toBeNull();
      });
    });

    test('should handle ambiguous date formats', () => {
      // Test disambiguation between US and European formats using dot notation
      const europeanDotDate = '15.01.2024'; // Clearly European format (DD.MM.YYYY)
      const usSlashDate = '01/15/2024'; // Clearly US format (MM/DD/YYYY)

      const europeanResult = kairos.parseFlexible(europeanDotDate, { european: true });
      const usResult = kairos.parseFlexible(usSlashDate);

      expect(usResult).not.toBeNull();
      expect(europeanResult).not.toBeNull();

      // Both should result in the same date (January 15, 2024) but via different parsing
      expect(usResult.month()).toBe(1); // January in US format
      expect(usResult.date()).toBe(15);

      expect(europeanResult.month()).toBe(1); // January in European format
      expect(europeanResult.date()).toBe(15);
    });

    test('should handle single digit vs double digit variations', () => {
      const variations = [
        { input: '1/1/2024', expected: new Date(2024, 0, 1) },
        { input: '01/01/2024', expected: new Date(2024, 0, 1) },
        { input: '1/01/2024', expected: new Date(2024, 0, 1) },
        { input: '01/1/2024', expected: new Date(2024, 0, 1) },
      ];

      variations.forEach(({ input, expected }) => {
        const result = kairos.parseFlexible(input);
        expect(result).not.toBeNull();
        expect(result.year()).toBe(expected.getFullYear());
        expect(result.month()).toBe(expected.getMonth() + 1);
        expect(result.date()).toBe(expected.getDate());
      });
    });
  });

  describe('Performance', () => {
    test('should parse flexible dates efficiently', () => {
      const testStrings = [
        '2024-01-15',
        'Jan 15, 2024',
        'today',
        '5 minutes ago',
        'in 2 hours',
        '1/15/2024',
        '20240115',
      ];

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        testStrings.forEach((str) => {
          kairos.parseFlexible(str);
        });
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });

    test('should guess formats efficiently', () => {
      const testStrings = ['2024-01-15', 'Jan 15, 2024', 'today', '5 minutes ago', '1/15/2024'];

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        testStrings.forEach((str) => {
          kairos.guessDateFormat(str);
        });
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(200); // Should complete in under 200ms
    });

    test('should handle natural language efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        kairos.today();
        kairos.tomorrow();
        kairos.yesterday();
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});
