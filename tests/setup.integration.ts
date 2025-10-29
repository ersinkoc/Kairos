/**
 * Integration Test Setup for Kairos
 * Specialized configuration for integration tests with real environment simulation
 */

// Import the enhanced setup
import './setup.enhanced';

// Integration test specific imports
import kairos from '../src/core/plugin-system';
import holidayEngine from '../src/plugins/holiday/engine';
import localeUS from '../src/plugins/locale/en-US/index';

// Integration test configuration
jest.setTimeout(30000); // Longer timeout for integration tests

// Real environment simulation
export const integrationTestEnvironment = {
  // Use real plugins instead of mocks
  setupRealPlugins() {
    // Ensure all necessary plugins are loaded
    if (!kairos.isPluginLoaded('holidayEngine')) {
      kairos.use(holidayEngine);
    }
    if (!kairos.isPluginLoaded('locale-en-US')) {
      kairos.use(localeUS);
    }
  },

  // Create test environment with realistic data
  createRealisticTestData() {
    const currentYear = new Date().getFullYear();

    return {
      currentYear,
      testDates: {
        newYear: new Date(currentYear, 0, 1),
        christmas: new Date(currentYear, 11, 25),
        today: new Date(),
        yesterday: new Date(Date.now() - 24 * 60 * 60 * 1000),
        tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000),
        nextWeek: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastWeek: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      testLocales: ['en-US', 'tr-TR', 'de-DE', 'ja-JP', 'fr-FR'],
      testTimezones: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']
    };
  },

  // Setup temporary directories for file-based tests
  setupTempDirectories() {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const tempDir = path.join(os.tmpdir(), 'kairos-integration-test');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    return {
      tempDir,
      createTempFile: (filename: string, content: string) => {
        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, content);
        return filePath;
      },
      cleanup: () => {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      }
    };
  },

  // Mock HTTP requests for integration tests that need network
  setupHttpMocks() {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;
    return mockFetch;
  },

  // Setup file system watchers for integration tests
  setupFileSystemMocks() {
    const chokidar = require('chokidar');
    jest.mock('chokidar');
    const mockWatcher = {
      watch: jest.fn(() => ({
        on: jest.fn(),
        close: jest.fn()
      }))
    };
    chokidar.watch = mockWatcher.watch;
    return mockWatcher;
  }
};

// Integration test utilities
export const integrationTestUtils = {
  // Test real plugin interactions
  async testPluginInteraction(pluginName: string, testFunction: () => Promise<any>) {
    const startTime = performance.now();

    try {
      const result = await testFunction();
      const duration = performance.now() - startTime;

      return {
        success: true,
        result,
        duration,
        plugin: pluginName
      };
    } catch (error) {
      const duration = performance.now() - startTime;

      return {
        success: false,
        error: error as Error,
        duration,
        plugin: pluginName
      };
    }
  },

  // Test locale switching
  async testLocaleSwitching(locales: string[], testFunction: (locale: string) => Promise<any>) {
    const results = [];

    for (const locale of locales) {
      try {
        kairos.locale(locale);
        const result = await testFunction(locale);
        results.push({ locale, success: true, result });
      } catch (error) {
        results.push({ locale, success: false, error: error as Error });
      }
    }

    return results;
  },

  // Test holiday calculations across multiple years
  testHolidayCalculations(years: number[], holidayType: string) {
    const results = [];

    for (const year of years) {
      try {
        const holidays = kairos.getHolidays(year);
        const targetHolidays = holidays.filter(h => h.type === holidayType);

        results.push({
          year,
          success: true,
          count: targetHolidays.length,
          holidays: targetHolidays
        });
      } catch (error) {
        results.push({
          year,
          success: false,
          error: error as Error
        });
      }
    }

    return results;
  },

  // Test date operations with validation
  testDateOperation(date: Date, operation: string, expected?: any) {
    const startTime = performance.now();

    try {
      let result;

      switch (operation) {
        case 'addDay':
          result = kairos(date).add(1, 'day');
          break;
        case 'addWeek':
          result = kairos(date).add(1, 'week');
          break;
        case 'addMonth':
          result = kairos(date).add(1, 'month');
          break;
        case 'addYear':
          result = kairos(date).add(1, 'year');
          break;
        case 'format':
          result = kairos(date).format('YYYY-MM-DD');
          break;
        case 'isHoliday':
          result = kairos(date).isHoliday();
          break;
        case 'isWeekend':
          result = kairos(date).isWeekend();
          break;
        case 'isBusinessDay':
          result = kairos(date).isBusinessDay();
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      const duration = performance.now() - startTime;
      const success = expected !== undefined ?
        (typeof expected === 'function' ? expected(result) : result === expected) :
        true;

      return {
        success,
        result,
        duration,
        operation,
        inputDate: date
      };
    } catch (error) {
      const duration = performance.now() - startTime;

      return {
        success: false,
        error: error as Error,
        duration,
        operation,
        inputDate: date
      };
    }
  },

  // Performance benchmarking
  async benchmarkOperation<T>(
    operation: () => T | Promise<T>,
    iterations: number = 100
  ): Promise<{iterations: number; totalTime: number; averageTime: number; minTime: number; maxTime: number}> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await operation();
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      iterations,
      totalTime,
      averageTime,
      minTime,
      maxTime
    };
  },

  // Generate comprehensive test data
  generateTestData() {
    const currentYear = new Date().getFullYear();

    return {
      // Test years including leap years
      years: [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2],

      // Test dates including edge cases
      dates: [
        new Date(currentYear, 0, 1), // New Year
        new Date(currentYear, 1, 29), // Feb 29 (leap year check)
        new Date(currentYear, 11, 31), // Dec 31
        new Date(currentYear, 5, 21), // Summer solstice
        new Date(currentYear, 11, 21), // Winter solstice
      ],

      // Test time components
      times: [
        { hour: 0, minute: 0, second: 0 }, // Midnight
        { hour: 12, minute: 0, second: 0 }, // Noon
        { hour: 23, minute: 59, second: 59 }, // End of day
        { hour: 6, minute: 30, second: 15 }, // Random time
      ],

      // Test locales
      locales: ['en-US', 'tr-TR', 'de-DE', 'ja-JP', 'fr-FR', 'es-ES'],

      // Test timezones
      timezones: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']
    };
  }
};

// Integration test setup
beforeAll(async () => {
  console.log('🔧 Setting up integration test environment');

  // Setup real plugins
  integrationTestEnvironment.setupRealPlugins();

  // Setup temp directories
  const tempDirs = integrationTestEnvironment.setupTempDirectories();

  // Setup HTTP mocks
  integrationTestEnvironment.setupHttpMocks();

  // Setup file system mocks
  integrationTestEnvironment.setupFileSystemMocks();

  console.log('✅ Integration test environment ready');
});

// Cleanup after integration tests
afterAll(async () => {
  console.log('🧹 Cleaning up integration test environment');

  // Clean up temp directories
  const tempDirs = integrationTestEnvironment.setupTempDirectories();
  tempDirs.cleanup();

  console.log('✅ Integration test cleanup complete');
});

// Make utilities globally available
(global as any).integrationTestUtils = integrationTestUtils;
(global as any).integrationTestEnvironment = integrationTestEnvironment;