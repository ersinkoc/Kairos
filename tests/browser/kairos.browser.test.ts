import { test, expect } from '@playwright/test';

test.describe('Kairos Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Create a simple HTML page with Kairos loaded
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kairos Browser Test</title>
        <script src="/dist/kairos.umd.min.js"></script>
      </head>
      <body>
        <div id="output"></div>
        <script>
          window.testResults = {};
        </script>
      </body>
      </html>
    `);
  });

  test('should load Kairos in browser', async ({ page }) => {
    const hasKairos = await page.evaluate(() => {
      return typeof window.kairos !== 'undefined';
    });
    expect(hasKairos).toBe(true);
  });

  test('should create and format dates', async ({ page }) => {
    const result = await page.evaluate(() => {
      const date = window.kairos('2024-03-15');
      return {
        formatted: date.format('YYYY-MM-DD'),
        year: date.year(),
        month: date.month(),
        day: date.day(),
        isValid: date.isValid(),
      };
    });

    expect(result.formatted).toBe('2024-03-15');
    expect(result.year).toBe(2024);
    expect(result.month).toBe(3);
    expect(result.day).toBe(15);
    expect(result.isValid).toBe(true);
  });

  test('should handle date arithmetic', async ({ page }) => {
    const result = await page.evaluate(() => {
      const date = window.kairos('2024-03-15');
      const added = date.add(10, 'days');
      const subtracted = date.subtract(5, 'days');
      
      return {
        original: date.format('YYYY-MM-DD'),
        added: added.format('YYYY-MM-DD'),
        subtracted: subtracted.format('YYYY-MM-DD'),
      };
    });

    expect(result.original).toBe('2024-03-15');
    expect(result.added).toBe('2024-03-25');
    expect(result.subtracted).toBe('2024-03-10');
  });

  test('should parse various date formats', async ({ page }) => {
    const result = await page.evaluate(() => {
      const formats = [
        '2024-03-15',
        '2024/03/15',
        '03-15-2024',
        '03/15/2024',
        '2024-03-15T10:30:45',
        '2024-03-15T10:30:45Z',
        'March 15, 2024',
      ];

      return formats.map(format => ({
        input: format,
        parsed: window.kairos(format).format('YYYY-MM-DD'),
        isValid: window.kairos(format).isValid(),
      }));
    });

    result.forEach(item => {
      expect(item.isValid).toBe(true);
      expect(item.parsed).toBe('2024-03-15');
    });
  });

  test('should handle timezones', async ({ page }) => {
    const result = await page.evaluate(() => {
      const utc = window.kairos.utc('2024-03-15 12:00:00');
      const local = utc.local();
      
      return {
        utcFormatted: utc.format('YYYY-MM-DD HH:mm:ss'),
        utcOffset: utc.utcOffset(),
        localOffset: local.utcOffset(),
        isUTC: utc.isUTC(),
        timestamp: utc.valueOf(),
      };
    });

    expect(result.utcFormatted).toBe('2024-03-15 12:00:00');
    expect(result.utcOffset).toBe(0);
    expect(result.isUTC).toBe(true);
    expect(result.timestamp).toBeTruthy();
  });

  test('should handle locales', async ({ page }) => {
    const result = await page.evaluate(() => {
      const locales = ['en-US', 'de-DE', 'ja-JP', 'tr-TR'];
      const results = {};
      
      locales.forEach(locale => {
        window.kairos.locale(locale);
        const date = window.kairos('2024-07-04');
        results[locale] = {
          locale: window.kairos.locale(),
          isHoliday: date.isHoliday(),
          holidays: window.kairos().getHolidays().length,
        };
      });
      
      return results;
    });

    expect(result['en-US'].locale).toBe('en-US');
    expect(result['en-US'].isHoliday).toBe(true); // July 4th is US holiday
    expect(result['de-DE'].isHoliday).toBe(false); // Not a German holiday
  });

  test('should handle invalid dates', async ({ page }) => {
    const result = await page.evaluate(() => {
      const invalid1 = window.kairos('invalid');
      const invalid2 = window.kairos('2024-13-45');
      const invalid3 = window.kairos(NaN);
      
      return {
        invalid1: {
          isValid: invalid1.isValid(),
          formatted: invalid1.format(),
        },
        invalid2: {
          isValid: invalid2.isValid(),
          formatted: invalid2.format(),
        },
        invalid3: {
          isValid: invalid3.isValid(),
          formatted: invalid3.format(),
        },
      };
    });

    expect(result.invalid1.isValid).toBe(false);
    expect(result.invalid1.formatted).toBe('Invalid Date');
    expect(result.invalid2.isValid).toBe(false);
    expect(result.invalid3.isValid).toBe(false);
  });

  test('should handle business days', async ({ page }) => {
    const result = await page.evaluate(() => {
      const friday = window.kairos('2024-03-15'); // Friday
      const saturday = window.kairos('2024-03-16'); // Saturday
      const sunday = window.kairos('2024-03-17'); // Sunday
      const monday = window.kairos('2024-03-18'); // Monday
      
      return {
        friday: {
          isBusinessDay: friday.isBusinessDay(),
          nextBusinessDay: friday.nextBusinessDay().format('YYYY-MM-DD'),
        },
        saturday: {
          isBusinessDay: saturday.isBusinessDay(),
          nextBusinessDay: saturday.nextBusinessDay().format('YYYY-MM-DD'),
        },
        sunday: {
          isBusinessDay: sunday.isBusinessDay(),
          nextBusinessDay: sunday.nextBusinessDay().format('YYYY-MM-DD'),
        },
        monday: {
          isBusinessDay: monday.isBusinessDay(),
        },
      };
    });

    expect(result.friday.isBusinessDay).toBe(true);
    expect(result.saturday.isBusinessDay).toBe(false);
    expect(result.sunday.isBusinessDay).toBe(false);
    expect(result.monday.isBusinessDay).toBe(true);
    expect(result.saturday.nextBusinessDay).toBe('2024-03-18');
  });

  test('should handle date comparisons', async ({ page }) => {
    const result = await page.evaluate(() => {
      const date1 = window.kairos('2024-03-15');
      const date2 = window.kairos('2024-03-20');
      const date3 = window.kairos('2024-03-15');
      
      return {
        isBefore: date1.isBefore(date2),
        isAfter: date2.isAfter(date1),
        isSame: date1.isSame(date3),
        isSameOrBefore: date1.isSameOrBefore(date2),
        isSameOrAfter: date2.isSameOrAfter(date1),
        isBetween: date1.isBetween('2024-03-10', '2024-03-20'),
      };
    });

    expect(result.isBefore).toBe(true);
    expect(result.isAfter).toBe(true);
    expect(result.isSame).toBe(true);
    expect(result.isSameOrBefore).toBe(true);
    expect(result.isSameOrAfter).toBe(true);
    expect(result.isBetween).toBe(true);
  });

  test('should handle duration calculations', async ({ page }) => {
    const result = await page.evaluate(() => {
      const start = window.kairos('2024-03-15');
      const end = window.kairos('2024-03-25');
      
      return {
        days: end.diff(start, 'days'),
        hours: end.diff(start, 'hours'),
        minutes: end.diff(start, 'minutes'),
        weeks: end.diff(start, 'weeks'),
        months: end.diff(start, 'months'),
      };
    });

    expect(result.days).toBe(10);
    expect(result.hours).toBe(240);
    expect(result.minutes).toBe(14400);
    expect(result.weeks).toBeCloseTo(1.43, 1);
    expect(result.months).toBeCloseTo(0.33, 1);
  });

  test('should handle leap years', async ({ page }) => {
    const result = await page.evaluate(() => {
      const leap2024 = window.kairos('2024-02-29');
      const leap2020 = window.kairos('2020-02-29');
      const notLeap2023 = window.kairos('2023-02-29');
      const notLeap2100 = window.kairos('2100-02-29');
      
      return {
        is2024Leap: leap2024.isValid() && leap2024.isLeapYear(),
        is2020Leap: leap2020.isValid() && leap2020.isLeapYear(),
        is2023Valid: notLeap2023.isValid(),
        is2100Valid: notLeap2100.isValid(),
      };
    });

    expect(result.is2024Leap).toBe(true);
    expect(result.is2020Leap).toBe(true);
    expect(result.is2023Valid).toBe(false);
    expect(result.is2100Valid).toBe(false);
  });

  test('should handle start/end of units', async ({ page }) => {
    const result = await page.evaluate(() => {
      const date = window.kairos('2024-03-15 14:30:45.123');
      
      return {
        startOfDay: date.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endOfDay: date.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        startOfMonth: date.startOf('month').format('YYYY-MM-DD'),
        endOfMonth: date.endOf('month').format('YYYY-MM-DD'),
        startOfYear: date.startOf('year').format('YYYY-MM-DD'),
        endOfYear: date.endOf('year').format('YYYY-MM-DD'),
      };
    });

    expect(result.startOfDay).toBe('2024-03-15 00:00:00');
    expect(result.endOfDay).toBe('2024-03-15 23:59:59');
    expect(result.startOfMonth).toBe('2024-03-01');
    expect(result.endOfMonth).toBe('2024-03-31');
    expect(result.startOfYear).toBe('2024-01-01');
    expect(result.endOfYear).toBe('2024-12-31');
  });

  test('should handle chaining operations', async ({ page }) => {
    const result = await page.evaluate(() => {
      const date = window.kairos('2024-03-15')
        .add(1, 'month')
        .subtract(5, 'days')
        .startOf('day')
        .add(10, 'hours')
        .add(30, 'minutes');
      
      return date.format('YYYY-MM-DD HH:mm:ss');
    });

    expect(result).toBe('2024-04-10 10:30:00');
  });

  test('should handle memory efficiently', async ({ page }) => {
    const memoryUsage = await page.evaluate(() => {
      const dates = [];
      const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      // Create many date instances
      for (let i = 0; i < 10000; i++) {
        dates.push(window.kairos('2024-03-15').add(i, 'days'));
      }
      
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryUsed = (endMemory - startMemory) / 1024 / 1024;
      
      return {
        instanceCount: dates.length,
        memoryUsedMB: memoryUsed,
        hasMemoryAPI: !!performance.memory,
      };
    });

    expect(memoryUsage.instanceCount).toBe(10000);
    
    // Only check memory if API is available (Chrome)
    if (memoryUsage.hasMemoryAPI) {
      expect(memoryUsage.memoryUsedMB).toBeLessThan(50); // Should use < 50MB
    }
  });

  test('should handle concurrent operations', async ({ page }) => {
    const result = await page.evaluate(async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          new Promise(resolve => {
            setTimeout(() => {
              const date = window.kairos('2024-03-15').add(i, 'days');
              resolve(date.format('YYYY-MM-DD'));
            }, Math.random() * 10);
          })
        );
      }
      
      const results = await Promise.all(promises);
      return {
        count: results.length,
        first: results[0],
        last: results[99],
      };
    });

    expect(result.count).toBe(100);
    expect(result.first).toBe('2024-03-15');
    expect(result.last).toBe('2024-06-22');
  });
});