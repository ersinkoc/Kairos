// Global test setup for Kairos
import kairos from '../src/core/plugin-system';
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
(global as any).kairos = kairos;

// Common test dates
export const testDates = {
  // Known holidays for testing
  newYear2024: new Date(2024, 0, 1),
  christmas2024: new Date(2024, 11, 25),
  thanksgiving2024: new Date(2024, 10, 28), // 4th Thursday of November
  mothersDay2024: new Date(2024, 4, 12), // 2nd Sunday of May
  memorialDay2024: new Date(2024, 4, 27), // Last Monday of May
  independenceDay2024: new Date(2024, 6, 4),
  laborDay2024: new Date(2024, 8, 2), // 1st Monday of September

  // German holidays
  germanUnity2024: new Date(2024, 9, 3),
  easter2024: new Date(2024, 2, 31), // March 31, 2024
  goodFriday2024: new Date(2024, 2, 29), // March 29, 2024

  // Japanese holidays
  japanNewYear2024: new Date(2024, 0, 1),
  comingOfAge2024: new Date(2024, 0, 8), // 2nd Monday of January
  vernalEquinox2024: new Date(2024, 2, 20), // Approximate

  // Turkish holidays
  turkishNewYear2024: new Date(2024, 0, 1),
  turkishLabor2024: new Date(2024, 4, 1),
  ataturkDay2024: new Date(2024, 4, 19),

  // Business days
  monday2024: new Date(2024, 0, 8), // Monday
  tuesday2024: new Date(2024, 0, 9), // Tuesday
  wednesday2024: new Date(2024, 0, 10), // Wednesday
  thursday2024: new Date(2024, 0, 11), // Thursday
  friday2024: new Date(2024, 0, 12), // Friday
  saturday2024: new Date(2024, 0, 13), // Saturday
  sunday2024: new Date(2024, 0, 14), // Sunday

  // Edge cases
  leapDay2024: new Date(2024, 1, 29), // February 29, 2024 (leap year)
  leapDay2023: new Date(2023, 1, 28), // February 28, 2023 (not leap year)

  // Different years for testing
  year2020: new Date(2020, 0, 1),
  year2021: new Date(2021, 0, 1),
  year2022: new Date(2022, 0, 1),
  year2023: new Date(2023, 0, 1),
  year2024: new Date(2024, 0, 1),
  year2025: new Date(2025, 0, 1),
};

// Test helper functions
export const testHelpers = {
  // Create date ranges for testing
  createDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  },

  // Get all dates in a month
  getDatesInMonth(year: number, month: number): Date[] {
    const dates: Date[] = [];
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    return this.createDateRange(start, end);
  },

  // Check if two dates are the same day
  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  },

  // Get weekday name
  getWeekdayName(weekday: number): string {
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[weekday];
  },

  // Get month name
  getMonthName(month: number): string {
    const names = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return names[month];
  },

  // Generate test years
  generateTestYears(start: number = 2020, end: number = 2030): number[] {
    const years: number[] = [];
    for (let year = start; year <= end; year++) {
      years.push(year);
    }
    return years;
  },

  // Check if year is leap year
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },

  // Get Easter date for testing
  getEasterDate(year: number): Date {
    const calculator = kairos.holidayEngine.calculators.get('easter-based');
    if (calculator) {
      return calculator.calculate(
        {
          name: 'Easter',
          type: 'easter-based',
          rule: { offset: 0 },
        } as any,
        year
      )[0];
    }
    throw new Error('Easter calculator not available');
  },

  // Performance timing utility
  timeFunction<T>(fn: () => T, name: string): { result: T; duration: number } {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  },

  // Memory usage tracking
  measureMemory<T>(fn: () => T): { result: T; memoryUsed: number } {
    const before = process.memoryUsage().heapUsed / 1024 / 1024;
    const result = fn();
    const after = process.memoryUsage().heapUsed / 1024 / 1024;

    return {
      result,
      memoryUsed: after - before,
    };
  },
};

// Property-based testing generators
export const generators = {
  // Generate random year
  randomYear(min: number = 1900, max: number = 2100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate random month
  randomMonth(): number {
    return Math.floor(Math.random() * 12) + 1;
  },

  // Generate random day
  randomDay(year: number, month: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Math.floor(Math.random() * daysInMonth) + 1;
  },

  // Generate random date
  randomDate(minYear: number = 1900, maxYear: number = 2100): Date {
    const year = this.randomYear(minYear, maxYear);
    const month = this.randomMonth();
    const day = this.randomDay(year, month);
    return new Date(year, month - 1, day);
  },

  // Generate random weekday
  randomWeekday(): number {
    return Math.floor(Math.random() * 7);
  },

  // Generate random nth value
  randomNth(): number {
    const values = [1, 2, 3, 4, 5, -1];
    return values[Math.floor(Math.random() * values.length)];
  },

  // Generate random business day
  randomBusinessDay(year: number = 2024): Date {
    let date: Date;
    do {
      date = this.randomDate(year, year);
    } while (date.getDay() === 0 || date.getDay() === 6);

    return date;
  },

  // Generate random weekend day
  randomWeekendDay(year: number = 2024): Date {
    let date: Date;
    do {
      date = this.randomDate(year, year);
    } while (date.getDay() !== 0 && date.getDay() !== 6);

    return date;
  },
};

// Set up global error handling for tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Mock console.warn for deprecation warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (args[0] && args[0].includes('deprecated')) {
    return; // Suppress deprecation warnings in tests
  }
  originalWarn(...args);
};

export default kairos;
