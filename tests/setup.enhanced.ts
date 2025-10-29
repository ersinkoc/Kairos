/**
 * Enhanced Global Test Setup for Kairos
 * Provides comprehensive test utilities, mocking, and configuration
 */

import kairos from '../src/core/plugin-system';

// Import all plugins
import holidayEngine from '../src/plugins/holiday/engine';
import fixedCalculator from '../src/plugins/holiday/calculators/fixed';
import nthWeekdayCalculator from '../src/plugins/holiday/calculators/nth-weekday';
import easterCalculator from '../src/plugins/holiday/calculators/easter';
import lunarCalculator from '../src/plugins/holiday/calculators/lunar';
import relativeCalculator from '../src/plugins/holiday/calculators/relative';
import customCalculator from '../src/plugins/holiday/calculators/custom';
import businessWorkday from '../src/plugins/business/workday';
import businessFiscal from '../src/plugins/business/fiscal';
import localeUS from '../src/plugins/locale/en-US/index';
import localeTR from '../src/plugins/locale/tr-TR/index';
import localeDE from '../src/plugins/locale/de-DE/index';
import localeJP from '../src/plugins/locale/ja-JP/index';

// Load all plugins for testing
kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  lunarCalculator,
  relativeCalculator,
  customCalculator,
  businessWorkday,
  businessFiscal,
  localeUS,
  localeTR,
  localeDE,
  localeJP,
]);

// Set US locale as default for tests after all locales are loaded
kairos.locale('en-US');

// Global test utilities
declare global {
  var kairos: typeof kairos;
  var testUtils: typeof testUtils;
  var testMatchers: typeof testMatchers;
}

(global as any).kairos = kairos;

// Performance tracking utilities
export class PerformanceTracker {
  private measurements: Map<string, number[]> = new Map();

  startMeasurement(name: string): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
  }

  endMeasurement(name: string): number {
    const measurements = this.measurements.get(name);
    if (measurements) {
      const duration = performance.now();
      measurements.push(duration);
      return duration;
    }
    return 0;
  }

  getAverageTime(name: string): number {
    const measurements = this.measurements.get(name);
    if (measurements && measurements.length > 0) {
      return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
    }
    return 0;
  }

  getStatistics(name: string) {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: sorted.reduce((sum, time) => sum + time, 0) / sorted.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  clear(): void {
    this.measurements.clear();
  }

  getAllStatistics() {
    const stats: Record<string, any> = {};
    for (const [name] of this.measurements) {
      stats[name] = this.getStatistics(name);
    }
    return stats;
  }
}

// Memory tracking utilities
export class MemoryTracker {
  private measurements: Array<{timestamp: number; memory: number; operation: string}> = [];

  startMeasurement(operation: string): void {
    this.measurements.push({
      timestamp: Date.now(),
      memory: process.memoryUsage().heapUsed,
      operation
    });
  }

  endMeasurement(operation: string): {used: number; peak: number} {
    const startMeasurement = this.measurements.find(m => m.operation === operation);
    if (!startMeasurement) {
      return { used: 0, peak: 0 };
    }

    const currentMemory = process.memoryUsage().heapUsed;
    const used = currentMemory - startMeasurement.memory;
    const peak = Math.max(...this.measurements.map(m => m.memory));

    return { used, peak };
  }

  getMemoryTrend() {
    return this.measurements.map(m => ({
      timestamp: m.timestamp,
      memory: m.memory / 1024 / 1024, // Convert to MB
      operation: m.operation
    }));
  }

  clear(): void {
    this.measurements = [];
  }
}

// Fuzz testing utilities
export class FuzzTester {
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  static generateRandomDate(minYear: number = 1900, maxYear: number = 2100): Date {
    const year = this.randomInt(minYear, maxYear);
    const month = this.randomInt(0, 11);
    const maxDay = new Date(year, month + 1, 0).getDate();
    const day = this.randomInt(1, maxDay);
    const hour = this.randomInt(0, 23);
    const minute = this.randomInt(0, 59);
    const second = this.randomInt(0, 59);
    const millisecond = this.randomInt(0, 999);

    return new Date(year, month, day, hour, minute, second, millisecond);
  }

  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomLocale(): string {
    const locales = ['en-US', 'tr-TR', 'de-DE', 'ja-JP', 'fr-FR', 'es-ES', 'it-IT', 'pt-BR', 'ru-RU', 'zh-CN'];
    return locales[Math.floor(Math.random() * locales.length)];
  }

  static generateRandomTimezone(): string {
    const timezones = [
      'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo',
      'Australia/Sydney', 'America/Los_Angeles', 'Europe/Paris',
      'Asia/Shanghai', 'America/Chicago', 'Europe/Berlin'
    ];
    return timezones[Math.floor(Math.random() * timezones.length)];
  }

  static generateRandomDateComponents() {
    return {
      year: this.randomInt(1900, 2100),
      month: this.randomInt(1, 12),
      day: this.randomInt(1, 28), // Use 28 to avoid month-specific issues
      hour: this.randomInt(0, 23),
      minute: this.randomInt(0, 59),
      second: this.randomInt(0, 59),
      millisecond: this.randomInt(0, 999)
    };
  }

  static async fuzzTest<T>(
    testFunction: (input: any) => T | Promise<T>,
    generator: () => any,
    iterations: number = 100
  ): Promise<{successes: number; failures: number; errors: Array<{input: any; error: Error}>}> {
    const results = {
      successes: 0,
      failures: 0,
      errors: [] as Array<{input: any; error: Error}>
    };

    for (let i = 0; i < iterations; i++) {
      try {
        const input = generator();
        await testFunction(input);
        results.successes++;
      } catch (error) {
        results.failures++;
        results.errors.push({
          input: generator(),
          error: error as Error
        });
      }
    }

    return results;
  }
}

// Enhanced test utilities
export const testUtils = {
  performance: new PerformanceTracker(),
  memory: new MemoryTracker(),
  fuzz: FuzzTester,

  // Date utilities
  createDate(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date {
    return new Date(year, month - 1, day, hour, minute, second);
  },

  createUTCDate(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month - 1, day));
  },

  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },

  // Date range utilities
  createDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  },

  getDatesInMonth(year: number, month: number): Date[] {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return this.createDateRange(start, end);
  },

  getDatesInYear(year: number): Date[] {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return this.createDateRange(start, end);
  },

  // Date comparison utilities
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  },

  isSameWeek(date1: Date, date2: Date): boolean {
    const startOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    };

    const week1 = startOfWeek(date1);
    const week2 = startOfWeek(date2);

    return this.isSameDay(week1, week2);
  },

  isSameMonth(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  },

  isSameYear(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear();
  },

  // Business day utilities
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  },

  isBusinessDay(date: Date): boolean {
    return !this.isWeekend(date);
  },

  getNextBusinessDay(date: Date): Date {
    let nextDay = this.addDays(date, 1);
    while (this.isWeekend(nextDay)) {
      nextDay = this.addDays(nextDay, 1);
    }
    return nextDay;
  },

  getPreviousBusinessDay(date: Date): Date {
    let prevDay = this.addDays(date, -1);
    while (this.isWeekend(prevDay)) {
      prevDay = this.addDays(prevDay, -1);
    }
    return prevDay;
  },

  // Holiday utilities
  getHolidaysInRange(start: Date, end: Date): Array<{date: Date; name: string; type: string}> {
    const holidays: Array<{date: Date; name: string; type: string}> = [];
    const current = new Date(start);

    while (current <= end) {
      const year = current.getFullYear();
      const yearHolidays = kairos.getHolidays(year);

      for (const holiday of yearHolidays) {
        if (this.isSameDay(holiday.date, current)) {
          holidays.push({
            date: holiday.date,
            name: holiday.name,
            type: holiday.type || 'unknown'
          });
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return holidays;
  },

  // Performance utilities
  async measurePerformance<T>(
    fn: () => T | Promise<T>,
    name: string
  ): Promise<{result: T; duration: number}> {
    this.performance.startMeasurement(name);
    const result = await fn();
    const duration = this.performance.endMeasurement(name);
    return { result, duration };
  },

  async measureMemory<T>(
    fn: () => T | Promise<T>,
    operation: string
  ): Promise<{result: T; memoryUsed: number; peakMemory: number}> {
    this.memory.startMeasurement(operation);
    const result = await fn();
    const { used, peak } = this.memory.endMeasurement(operation);
    return { result, memoryUsed: used, peakMemory: peak };
  },

  // Assertion utilities
  expectDateEqual(actual: Date, expected: Date): void {
    expect(actual.getTime()).toBe(expected.getTime());
  },

  expectDateClose(actual: Date, expected: Date, toleranceMs: number = 1000): void {
    const diff = Math.abs(actual.getTime() - expected.getTime());
    expect(diff).toBeLessThanOrEqual(toleranceMs);
  },

  expectPerformance(duration: number, maxMs: number): void {
    expect(duration).toBeLessThan(maxMs);
  },

  // Test data generators
  generateTestYears(start = 2020, end = 2030): number[] {
    const years: number[] = [];
    for (let year = start; year <= end; year++) {
      years.push(year);
    }
    return years;
  },

  generateLeapYears(start = 2000, end = 2100): number[] {
    const years: number[] = [];
    for (let year = start; year <= end; year++) {
      if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        years.push(year);
      }
    }
    return years;
  },

  // Cleanup utilities
  cleanup(): void {
    this.performance.clear();
    this.memory.clear();
  }
};

// Custom Jest matchers
export const testMatchers = {
  toBeValidDate(received: Date) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    return {
      message: () => `expected ${received} to be a valid Date`,
      pass
    };
  },

  toBeBusinessDay(received: Date) {
    const pass = testUtils.isBusinessDay(received);
    return {
      message: () => `expected ${received} to be a business day`,
      pass
    };
  },

  toBeWeekend(received: Date) {
    const pass = testUtils.isWeekend(received);
    return {
      message: () => `expected ${received} to be a weekend day`,
      pass
    };
  },

  toBeHoliday(received: Date) {
    const year = received.getFullYear();
    const holidays = kairos.getHolidays(year);
    const pass = holidays.some(holiday => testUtils.isSameDay(holiday.date, received));
    return {
      message: () => `expected ${received} to be a holiday`,
      pass
    };
  },

  toBeSameDayAs(received: Date, expected: Date) {
    const pass = testUtils.isSameDay(received, expected);
    return {
      message: () => `expected ${received} to be the same day as ${expected}`,
      pass
    };
  },

  toBeWithinPerformance(received: number, maxMs: number) {
    const pass = received < maxMs;
    return {
      message: () => `expected performance ${received}ms to be less than ${maxMs}ms`,
      pass
    };
  }
};

// Global error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit during tests, let Jest handle it
});

// Console mocking for cleaner test output
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// Enhanced console mocking
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('deprecated')) {
      return; // Suppress deprecation warnings in tests
    }
    originalConsole.warn(...args);
  });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console after each test
  jest.restoreAllMocks();

  // Clean up test utilities
  testUtils.cleanup();
});

// Global test cleanup
afterAll(() => {
  // Clean up any remaining resources
  testUtils.cleanup();
});

// Make utilities globally available
(global as any).testUtils = testUtils;
(global as any).testMatchers = testMatchers;

// Export for use in test files
export default testUtils;