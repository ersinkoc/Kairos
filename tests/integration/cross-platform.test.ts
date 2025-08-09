import kairos from '../setup/cross-platform';
import {
  getPlatformInfo,
  isWindows,
  isMacOS,
  isLinux,
  skipOnWindows,
  runOnlyOn,
  withTimezone,
  getSystemTimezone,
  normalizePath,
  normalizeLineEndings,
  normalizeErrorMessage,
  generateTestDates,
  logTestEnvironment,
} from '../utils/platform';

describe('Cross-Platform Compatibility', () => {
  beforeAll(() => {
    logTestEnvironment();
  });

  describe('Platform Detection', () => {
    test('should detect current platform', () => {
      const info = getPlatformInfo();
      expect(['windows', 'macos', 'linux', 'unknown']).toContain(info.os);
      expect(info.node).toMatch(/^v\d+\.\d+\.\d+/);
      expect(info.timezone).toBeTruthy();
      expect(info.locale).toBeTruthy();
    });

    test('should have consistent platform checks', () => {
      const platformCount = [isWindows(), isMacOS(), isLinux()].filter(Boolean).length;
      expect(platformCount).toBeLessThanOrEqual(1);
    });
  });

  describe('Date Creation Across Platforms', () => {
    test('should create dates consistently', () => {
      const date1 = kairos('2024-03-15');
      const date2 = kairos(new Date(2024, 2, 15));
      const date3 = kairos({ year: 2024, month: 3, day: 15 });

      expect(date1.format('YYYY-MM-DD')).toBe('2024-03-15');
      expect(date2.format('YYYY-MM-DD')).toBe('2024-03-15');
      expect(date3.format('YYYY-MM-DD')).toBe('2024-03-15');
    });

    test('should handle ISO strings consistently', () => {
      const isoString = '2024-03-15T10:30:45.123Z';
      const date = kairos(isoString);

      expect(date.toISOString()).toBe(isoString);
      expect(date.year()).toBe(2024);
      expect(date.month()).toBe(3);
      expect(date.date()).toBe(15); // date() returns day of month, day() returns day of week
    });

    test('should handle timestamps consistently', () => {
      const timestamp = 1710500000000; // Fixed timestamp
      const date = kairos(timestamp);

      expect(date.valueOf()).toBe(timestamp);
      expect(date.toDate().getTime()).toBe(timestamp);
    });
  });

  describe('Timezone Handling', () => {
    test('should get system timezone', () => {
      const tz = getSystemTimezone();
      expect(tz).toBeTruthy();
      console.log(`System timezone: ${tz}`);
    });

    test('should handle UTC consistently', () => {
      const date = kairos.utc('2024-03-15 12:00:00');

      expect(date.format('YYYY-MM-DD HH:mm:ss')).toBe('2024-03-15 12:00:00');
      expect(date.isUTC()).toBe(true);
      expect(date.offset()).toBe(0);
    });

    test('should convert between UTC and local time', () => {
      const utcDate = kairos.utc('2024-03-15 12:00:00');
      const localDate = utcDate.local();

      // The dates represent the same moment in time
      expect(utcDate.valueOf()).toBe(localDate.valueOf());

      // But may have different string representations
      if (localDate.offset() !== 0) {
        expect(localDate.format('HH:mm:ss')).not.toBe('12:00:00');
      }
    });

    skipOnWindows(() => {
      test('should respect TZ environment variable', () => {
        const originalTZ = process.env.TZ;

        process.env.TZ = 'America/New_York';
        const nyDate = kairos('2024-03-15 12:00:00');

        process.env.TZ = 'Europe/London';
        const londonDate = kairos('2024-03-15 12:00:00');

        // Restore original
        if (originalTZ) {
          process.env.TZ = originalTZ;
        } else {
          delete process.env.TZ;
        }

        // Different TZ should result in different UTC times
        expect(nyDate.utc().format('HH')).not.toBe(londonDate.utc().format('HH'));
      });
    });
  });

  describe('Locale Handling', () => {
    test('should handle different locales', () => {
      const date = kairos('2024-03-15');

      // Test different locales
      kairos.locale('en-US');
      expect(kairos.locale()).toBe('en-US');

      kairos.locale('de-DE');
      expect(kairos.locale()).toBe('de-DE');

      kairos.locale('ja-JP');
      expect(kairos.locale()).toBe('ja-JP');

      // Reset to default
      kairos.locale('en-US');
    });

    test('should have locale-specific holidays', () => {
      const date = kairos('2024-07-04'); // US Independence Day

      kairos.locale('en-US');
      expect(date.isHoliday()).toBe(true);

      kairos.locale('de-DE');
      expect(date.isHoliday()).toBe(false);

      // Reset
      kairos.locale('en-US');
    });
  });

  describe('File Path Handling', () => {
    test('should normalize paths correctly', () => {
      const unixPath = '/usr/local/bin/kairos';
      const windowsPath = 'C:\\Users\\Test\\kairos';

      const normalized = normalizePath(unixPath);

      if (isWindows()) {
        expect(normalized).toContain('\\');
      } else {
        expect(normalized).toContain('/');
      }
    });
  });

  describe('Line Ending Handling', () => {
    test('should normalize line endings', () => {
      const windowsText = 'Line 1\r\nLine 2\r\nLine 3';
      const unixText = 'Line 1\nLine 2\nLine 3';
      const macText = 'Line 1\rLine 2\rLine 3';

      const normalized1 = normalizeLineEndings(windowsText);
      const normalized2 = normalizeLineEndings(unixText);
      const normalized3 = normalizeLineEndings(macText);

      expect(normalized1).toBe('Line 1\nLine 2\nLine 3');
      expect(normalized2).toBe('Line 1\nLine 2\nLine 3');
      expect(normalized3).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Date String Formats', () => {
    test('should parse various date formats', () => {
      const formats = [
        '2024-03-15',
        '2024/03/15',
        '03-15-2024',
        '03/15/2024',
        '15.03.2024',
        '15-Mar-2024',
        'March 15, 2024',
        '2024-03-15T10:30:45',
        '2024-03-15T10:30:45Z',
        '2024-03-15T10:30:45+00:00',
      ];

      formats.forEach((format) => {
        const date = kairos(format);
        expect(date.isValid()).toBe(true);
        expect(date.year()).toBe(2024);
        expect(date.month()).toBe(3);
        expect(date.date()).toBe(15); // date() returns day of month, day() returns day of week
      });
    });
  });

  describe('Number Precision', () => {
    test('should handle floating point precision', () => {
      const date = kairos('2024-03-15 10:30:45.123');

      expect(date.millisecond()).toBe(123);

      // Add fractional days
      const added = date.add(0.5, 'days');
      expect(added.hour()).toBe(22); // 10 + 12 hours
    });

    test('should handle large numbers', () => {
      const maxTimestamp = 8640000000000000; // Max JS date
      const minTimestamp = -8640000000000000; // Min JS date

      const maxDate = kairos(maxTimestamp);
      const minDate = kairos(minTimestamp);

      expect(maxDate.isValid()).toBe(true);
      expect(minDate.isValid()).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid dates consistently', () => {
      const invalid1 = kairos('invalid');
      const invalid2 = kairos('2024-13-45'); // Invalid month/day
      const invalid3 = kairos(NaN);

      expect(invalid1.isValid()).toBe(false);
      expect(invalid2.isValid()).toBe(false);
      expect(invalid3.isValid()).toBe(false);

      // Invalid operations should return invalid dates
      expect(invalid1.add(1, 'day').isValid()).toBe(false);
      expect(invalid1.format()).toBe('Invalid Date');
    });

    test('should normalize error messages', () => {
      const error1 = 'Error on line 1\r\nDetails here';
      const error2 = 'Error on line 1\nDetails here';

      const normalized1 = normalizeErrorMessage(error1);
      const normalized2 = normalizeErrorMessage(error2);

      expect(normalized1).toBe(normalized2);
    });
  });

  describe('Memory Management', () => {
    test('should not leak memory with many instances', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const dates: any[] = [];

      // Create many instances
      for (let i = 0; i < 10000; i++) {
        dates.push(kairos('2024-03-15'));
      }

      const afterCreation = process.memoryUsage().heapUsed;
      const memoryUsed = (afterCreation - initialMemory) / 1024 / 1024;

      // Should use reasonable amount of memory (< 50MB for 10k instances)
      expect(memoryUsed).toBeLessThan(50);

      // Clear references
      dates.length = 0;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    });
  });

  describe('Performance Consistency', () => {
    test('should have consistent performance across operations', () => {
      const iterations = 1000;
      const operations = {
        create: () => kairos('2024-03-15'),
        parse: () => kairos('2024-03-15T10:30:45.123Z'),
        format: () => kairos().format('YYYY-MM-DD HH:mm:ss'),
        add: () => kairos().add(1, 'day'),
        diff: () => {
          const now = kairos();
          const start = kairos('2024-01-01');
          return Math.floor((now.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24));
        },
      };

      const timings: Record<string, number> = {};

      Object.entries(operations).forEach(([name, operation]) => {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
          operation();
        }
        const end = performance.now();
        timings[name] = end - start;

        // All operations should complete in reasonable time
        expect(timings[name]).toBeLessThan(1000); // < 1 second for 1000 ops
      });

      console.log('Performance timings (ms):', timings);
    });
  });

  describe('Platform-Specific Features', () => {
    runOnlyOn('windows', () => {
      test('should handle Windows-specific date formats', () => {
        const date = kairos('03/15/2024');
        expect(date.format('MM/DD/YYYY')).toBe('03/15/2024');
      });
    });

    runOnlyOn('macos', () => {
      test('should handle macOS-specific features', () => {
        const date = kairos('2024-03-15');
        expect(date.isValid()).toBe(true);
      });
    });

    runOnlyOn('linux', () => {
      test('should handle Linux-specific features', () => {
        const date = kairos('2024-03-15');
        expect(date.isValid()).toBe(true);
      });
    });
  });

  describe('Binary/Endianness', () => {
    test('should handle binary data correctly', () => {
      const date = kairos('2024-03-15');
      const timestamp = date.valueOf();

      // Convert to buffer and back
      const buffer = Buffer.allocUnsafe(8);
      buffer.writeBigInt64BE(BigInt(timestamp), 0);
      const recovered = Number(buffer.readBigInt64BE(0));

      expect(recovered).toBe(timestamp);
    });
  });

  describe('Concurrent Operations', () => {
    test('should handle concurrent date operations', async () => {
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise((resolve) => {
            const date = kairos('2024-03-15').add(i, 'days');
            resolve(date.format('YYYY-MM-DD'));
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
      expect(results[0]).toBe('2024-03-15');
      expect(results[99]).toBe('2024-06-22');
    });
  });

  describe('Edge Cases', () => {
    test('should handle year boundaries', () => {
      const endOfYear = kairos('2024-12-31 23:59:59');
      const nextYear = endOfYear.add(1, 'second');

      expect(nextYear.format('YYYY-MM-DD HH:mm:ss')).toBe('2025-01-01 00:00:00');
      expect(nextYear.year()).toBe(2025);
    });

    test('should handle leap years', () => {
      const leapDay2024 = kairos('2024-02-29');
      const leapDay2020 = kairos('2020-02-29');
      const notLeap2023 = kairos('2023-02-29');

      expect(leapDay2024.isValid()).toBe(true);
      expect(leapDay2020.isValid()).toBe(true);
      expect(notLeap2023.isValid()).toBe(false);
    });

    test('should handle century boundaries', () => {
      const year2000 = kairos('2000-02-29'); // Leap year
      const year1900 = kairos('1900-02-29'); // Not a leap year
      const year2100 = kairos('2100-02-29'); // Not a leap year

      expect(year2000.isValid()).toBe(true);
      expect(year1900.isValid()).toBe(false);
      expect(year2100.isValid()).toBe(false);
    });
  });
});
