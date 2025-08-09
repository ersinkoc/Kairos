import kairos from '../../../src/core/plugin-system.js';
import { testDates, testHelpers } from '../../setup.js';
import type { KairosPlugin } from '../../../src/core/types/plugin.js';

describe('Core Plugin System', () => {
  describe('Basic Functionality', () => {
    test('should create kairos instance', () => {
      const instance = kairos();
      expect(instance).toBeDefined();
      expect(typeof instance.valueOf).toBe('function');
      expect(typeof instance.format).toBe('function');
    });

    test('should parse different input types', () => {
      const date = new Date(2024, 0, 1);

      // Date object
      expect(kairos(date).valueOf()).toBe(date.getTime());

      // Number (timestamp)
      expect(kairos(date.getTime()).valueOf()).toBe(date.getTime());

      // String
      expect(kairos('2024-01-01').year()).toBe(2024);
      expect(kairos('2024-01-01').month()).toBe(1);
      expect(kairos('2024-01-01').date()).toBe(1);

      // Undefined (current time)
      const now = kairos();
      expect(now.valueOf()).toBeCloseTo(Date.now(), -3);
    });

    test('should handle invalid dates gracefully', () => {
      // Invalid string should not throw in non-strict mode
      expect(() => kairos('invalid-date')).not.toThrow();

      // Should still be a valid kairos instance
      const instance = kairos('invalid-date');
      expect(typeof instance.format).toBe('function');
    });
  });

  describe('Date Manipulation', () => {
    test('should add time units correctly', () => {
      const base = kairos('2024-01-01');

      expect(base.add(1, 'year').year()).toBe(2025);
      expect(base.add(1, 'month').month()).toBe(2);
      expect(base.add(1, 'day').date()).toBe(2);
      expect(base.add(1, 'hour').hour()).toBe(1);
      expect(base.add(1, 'minute').minute()).toBe(1);
      expect(base.add(1, 'second').second()).toBe(1);
    });

    test('should subtract time units correctly', () => {
      const base = kairos('2024-01-01');

      expect(base.subtract(1, 'year').year()).toBe(2023);
      expect(base.subtract(1, 'month').month()).toBe(12);
      expect(base.subtract(1, 'day').date()).toBe(31);
    });

    test('should handle unit aliases', () => {
      const base = kairos('2024-01-01');

      expect(base.add(1, 'y').year()).toBe(2025);
      expect(base.add(1, 'M').month()).toBe(2);
      expect(base.add(1, 'd').date()).toBe(2);
      expect(base.add(1, 'h').hour()).toBe(1);
      expect(base.add(1, 'm').minute()).toBe(1);
      expect(base.add(1, 's').second()).toBe(1);
    });
  });

  describe('Date Comparison', () => {
    test('should compare dates correctly', () => {
      const date1 = kairos('2024-01-01');
      const date2 = kairos('2024-01-02');
      const date3 = kairos('2024-01-01');

      expect(date1.isBefore(date2)).toBe(true);
      expect(date2.isBefore(date1)).toBe(false);

      expect(date1.isAfter(date2)).toBe(false);
      expect(date2.isAfter(date1)).toBe(true);

      expect(date1.isSame(date3)).toBe(true);
      expect(date1.isSame(date2)).toBe(false);
    });
  });

  describe('Date Formatting', () => {
    test('should format dates with default template', () => {
      const date = kairos('2024-01-01');
      expect(date.format()).toBe('2024-01-01');
    });

    test('should format dates with custom template', () => {
      const date = kairos('2024-01-01 15:30:45');

      expect(date.format('YYYY')).toBe('2024');
      expect(date.format('MM')).toBe('01');
      expect(date.format('DD')).toBe('01');
      expect(date.format('HH')).toBe('15');
      expect(date.format('mm')).toBe('30');
      expect(date.format('ss')).toBe('45');
      expect(date.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-01-01 15:30:45');
    });
  });

  describe('Getters and Setters', () => {
    test('should get date components', () => {
      const date = kairos('2024-03-15 14:30:45.123');

      expect(date.year()).toBe(2024);
      expect(date.month()).toBe(3);
      expect(date.date()).toBe(15);
      expect(date.day()).toBe(5); // Friday
      expect(date.hour()).toBe(14);
      expect(date.minute()).toBe(30);
      expect(date.second()).toBe(45);
      expect(date.millisecond()).toBe(123);
    });

    test('should set date components', () => {
      const date = kairos('2024-01-01');

      expect(date.year(2025).year()).toBe(2025);
      expect(date.month(6).month()).toBe(6);
      expect(date.date(15).date()).toBe(15);
      expect(date.hour(12).hour()).toBe(12);
      expect(date.minute(30).minute()).toBe(30);
      expect(date.second(45).second()).toBe(45);
      expect(date.millisecond(123).millisecond()).toBe(123);
    });

    test('should return immutable instances', () => {
      const original = kairos('2024-01-01');
      const modified = original.year(2025);

      expect(original.year()).toBe(2024);
      expect(modified.year()).toBe(2025);
      expect(original).not.toBe(modified);
    });
  });

  describe('Cloning and Conversion', () => {
    test('should clone instances correctly', () => {
      const original = kairos('2024-01-01');
      const cloned = original.clone();

      expect(cloned.valueOf()).toBe(original.valueOf());
      expect(cloned).not.toBe(original);
    });

    test('should convert to different formats', () => {
      const date = kairos('2024-01-01T12:00:00.000Z');

      expect(date.toDate()).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe('2024-01-01T12:00:00.000Z');
      expect(typeof date.toString()).toBe('string');
      expect(typeof date.valueOf()).toBe('number');
    });
  });

  describe('Plugin System', () => {
    test('should register and use plugins', () => {
      const testPlugin: KairosPlugin = {
        name: 'test-plugin',
        install(kairos) {
          kairos.extend({
            testMethod() {
              return 'test-result';
            },
          });
        },
      };

      kairos.use(testPlugin);

      const instance = kairos();
      expect((instance as any).testMethod()).toBe('test-result');
    });

    test('should handle plugin dependencies', () => {
      const dependentPlugin: KairosPlugin = {
        name: 'dependent-plugin',
        dependencies: ['test-plugin'],
        install(kairos) {
          kairos.extend({
            dependentMethod() {
              return 'dependent-result';
            },
          });
        },
      };

      // This should work since test-plugin was already installed
      expect(() => kairos.use(dependentPlugin)).not.toThrow();
    });

    test('should throw error for missing dependencies', () => {
      const missingDepPlugin: KairosPlugin = {
        name: 'missing-dep-plugin',
        dependencies: ['non-existent-plugin'],
        install(kairos) {
          // Empty install
        },
      };

      expect(() => kairos.use(missingDepPlugin)).toThrow();
    });

    test('should not install same plugin twice', () => {
      const countPlugin: KairosPlugin = {
        name: 'count-plugin',
        install(kairos) {
          kairos.installCount = (kairos.installCount || 0) + 1;
        },
      };

      kairos.use(countPlugin);
      kairos.use(countPlugin);

      expect((kairos as any).installCount).toBe(1);
    });
  });

  describe('Static Methods', () => {
    test('should have static methods', () => {
      expect(typeof kairos.use).toBe('function');
      expect(typeof kairos.extend).toBe('function');
      expect(typeof kairos.utc).toBe('function');
      expect(typeof kairos.unix).toBe('function');
    });

    test('should create UTC instances', () => {
      const utc = kairos.utc('2024-01-01');
      expect(utc).toBeDefined();
      expect(utc.year()).toBe(2024);
    });

    test('should create instances from unix timestamp', () => {
      const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC
      const instance = kairos.unix(timestamp);
      expect(instance.year()).toBe(2024);
      expect(instance.month()).toBe(1);
      expect(instance.date()).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle leap years correctly', () => {
      const leapYear = kairos('2024-02-29');
      expect(leapYear.year()).toBe(2024);
      expect(leapYear.month()).toBe(2);
      expect(leapYear.date()).toBe(29);
    });

    test('should handle month boundaries', () => {
      const endOfMonth = kairos('2024-01-31');
      const nextMonth = endOfMonth.add(1, 'month');

      // Should handle different month lengths
      expect(nextMonth.month()).toBe(2);
      expect(nextMonth.date()).toBeLessThanOrEqual(29);
    });

    test('should handle year boundaries', () => {
      const endOfYear = kairos('2024-12-31');
      const nextYear = endOfYear.add(1, 'day');

      expect(nextYear.year()).toBe(2025);
      expect(nextYear.month()).toBe(1);
      expect(nextYear.date()).toBe(1);
    });
  });

  describe('Performance', () => {
    test('should create instances quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        kairos('2024-01-01');
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(100); // Should be fast
    });

    test('should handle many operations efficiently', () => {
      const instance = kairos('2024-01-01');

      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        instance.add(1, 'day').subtract(1, 'day').format();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(200); // Should be reasonably fast
    });
  });
});
