/**
 * Unit Test Setup for Kairos
 * Specialized configuration for unit tests with fast execution and comprehensive coverage
 */

// Import the enhanced setup
import './setup.enhanced';

// Unit test specific configuration
import { testUtils } from './setup.enhanced';

// Mock external dependencies that aren't needed for unit tests
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(() => [])
}));

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
  dirname: jest.fn((path) => path.split('/').slice(0, -1).join('/')),
  basename: jest.fn((path) => path.split('/').pop())
}));

// Performance monitoring for unit tests
const unitTestPerformance = new Map<string, number[]>();

beforeEach(() => {
  // Reset performance tracking
  unitTestPerformance.clear();

  // Fast timeout for unit tests
  jest.setTimeout(5000);
});

afterEach(() => {
  // Log slow unit tests
  for (const [testName, times] of unitTestPerformance) {
    if (times.length > 0) {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > 100) { // Log tests taking more than 100ms
        console.warn(`Slow unit test detected: ${testName} (avg: ${avgTime.toFixed(2)}ms)`);
      }
    }
  }
});

// Utility for tracking test performance
export function trackUnitTestPerformance(testName: string, duration: number): void {
  if (!unitTestPerformance.has(testName)) {
    unitTestPerformance.set(testName, []);
  }
  unitTestPerformance.get(testName)!.push(duration);
}

// Mock date utilities for consistent testing
export const mockDates = {
  fixedDate: new Date(2024, 0, 15, 12, 0, 0), // January 15, 2024 12:00 PM
  leapYearDate: new Date(2024, 1, 29), // February 29, 2024
  weekendDate: new Date(2024, 0, 13), // Saturday
  businessDate: new Date(2024, 0, 15), // Monday
  holidayDate: new Date(2024, 0, 1), // New Year's Day
  endOfYearDate: new Date(2024, 11, 31), // December 31, 2024
  startOfYearDate: new Date(2024, 0, 1) // January 1, 2024
};

// Mock locale data for consistent testing
export const mockLocales = {
  'en-US': {
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    holidays: {
      'New Year\'s Day': { month: 1, day: 1 },
      'Christmas Day': { month: 12, day: 25 },
      'Independence Day': { month: 7, day: 4 }
    }
  }
};

// Unit test helper functions
export const unitTestHelpers = {
  // Create predictable date for testing
  createTestDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  },

  // Create test date components
  createTestDateComponents(overrides: any = {}) {
    return {
      year: 2024,
      month: 1,
      day: 15,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      ...overrides
    };
  },

  // Mock performance tracking
  mockPerformanceTracking() {
    const mockPerformance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByName: jest.fn(() => []),
      getEntriesByType: jest.fn(() => [])
    };

    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true
    });

    return mockPerformance;
  },

  // Mock memory tracking
  mockMemoryTracking() {
    const mockMemoryUsage = {
      heapUsed: 50 * 1024 * 1024, // 50MB
      heapTotal: 100 * 1024 * 1024, // 100MB
      external: 10 * 1024 * 1024, // 10MB
      rss: 200 * 1024 * 1024 // 200MB
    };

    jest.spyOn(process, 'memoryUsage').mockReturnValue(mockMemoryUsage);
    return mockMemoryUsage;
  },

  // Reset all mocks
  resetAllMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  }
};

// Setup for fast unit tests
console.log('🧪 Unit test environment initialized');