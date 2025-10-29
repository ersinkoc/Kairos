/**
 * Enhanced Jest Configuration for Kairos
 * Provides comprehensive testing with advanced coverage and performance monitoring
 */

module.exports = {
  // Basic configuration
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/tests/browser/', // Exclude Playwright tests
    '/tests/integration/browser/' // Exclude browser integration tests
  ],

  // TypeScript transformation
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(.*)\\.js$': '$1'
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.enhanced.ts'],

  // Test timeout (increased for complex operations)
  testTimeout: 15000,

  // Verbose output in development
  verbose: process.env.NODE_ENV !== 'production',

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.mock.ts',
    '!src/types/**', // Exclude type definitions from coverage
    '!src/core/types/**' // Exclude core type definitions
  ],

  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'clover'
  ],

  // Enhanced coverage thresholds
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85
    },
    // Core system thresholds
    './src/core/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // Plugin thresholds
    './src/plugins/': {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    // Utility thresholds
    './src/core/utils/': {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    }
  },

  // Performance monitoring
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ]
  ],

  // Global variables for tests
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },

  // Parallel execution configuration
  maxWorkers: '50%',
  maxConcurrency: 5,

  // Test result processor for custom reporting
  testResultsProcessor: undefined, // Can be customized

  // Error handling
  errorOnDeprecated: true,

  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Watch mode configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },

  // Custom snapshot serializers
  snapshotSerializers: [],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Randomization for test order
  randomize: false, // Set to true for random test execution

  // Project configuration for different test types
  projects: [
    // Unit tests
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.unit.ts'],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts'
      ],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 85,
          lines: 90,
          statements: 90
        }
      }
    },

    // Integration tests
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.integration.ts'],
      testTimeout: 30000, // Longer timeout for integration tests
      maxWorkers: 1, // Run integration tests sequentially
      collectCoverageFrom: [], // Don't collect coverage for integration tests
      coverageThreshold: {}
    },

    // Performance tests
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.performance.ts'],
      testTimeout: 60000, // Long timeout for performance tests
      maxWorkers: 1, // Run performance tests sequentially
      collectCoverageFrom: [], // Don't collect coverage for performance tests
      coverageThreshold: {}
    }
  ],

  // Suppress console output in tests unless verbose
  silent: process.env.NODE_ENV === 'production' || process.env.JEST_SILENT === 'true'
};