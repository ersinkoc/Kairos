/**
 * Modern size limit configuration for Kairos
 * Defines bundle size limits for different build targets
 */

export default [
  // Core library (ESM)
  {
    name: 'Core Library (ESM)',
    path: 'dist/index.js',
    limit: '28 KB',
    gzip: false,
    running: false,
    fail: true,
    import: '*'
  },

  // Core library with GZIP
  {
    name: 'Core Library (ESM gzipped)',
    path: 'dist/index.js',
    limit: '8 KB',
    gzip: true,
    running: false,
    fail: true,
    import: '*'
  },

  // Core + Holiday Engine
  {
    name: 'Core + Holiday Engine',
    path: [
      'dist/index.js',
      'dist/plugins/holiday/engine.js'
    ],
    limit: '30 KB',
    gzip: false,
    running: false,
    fail: true,
    import: ['*', './plugins/holiday/engine.js']
  },

  // Core + Holiday Engine with GZIP
  {
    name: 'Core + Holiday Engine (gzipped)',
    path: [
      'dist/index.js',
      'dist/plugins/holiday/engine.js'
    ],
    limit: '10 KB',
    gzip: true,
    running: false,
    fail: true,
    import: ['*', './plugins/holiday/engine.js']
  },

  // All plugins
  {
    name: 'Core + All Plugins',
    path: 'dist/**/*.js',
    limit: '225 KB',
    gzip: false,
    running: false,
    fail: true,
    import: '**/*.js'
  },

  // All plugins with GZIP
  {
    name: 'Core + All Plugins (gzipped)',
    path: 'dist/**/*.js',
    limit: '55 KB',
    gzip: true,
    running: false,
    fail: true,
    import: '**/*.js'
  },

  // UMD Browser Bundle (Development)
  {
    name: 'Browser Bundle (UMD dev)',
    path: 'dist/kairos.umd.js',
    limit: '45 KB',
    gzip: false,
    running: false,
    fail: true,
    import: '*'
  },

  // UMD Browser Bundle (Production)
  {
    name: 'Browser Bundle (UMD prod)',
    path: 'dist/kairos.umd.min.js',
    limit: '25 KB',
    gzip: false,
    running: false,
    fail: true,
    import: '*'
  },

  // UMD Browser Bundle (Production gzipped)
  {
    name: 'Browser Bundle (UMD prod gzipped)',
    path: 'dist/kairos.umd.min.js',
    limit: '8 KB',
    gzip: true,
    running: false,
    fail: true,
    import: '*'
  },

  // Modern ESM Bundle (ES2020)
  {
    name: 'Modern ESM Bundle',
    path: 'dist/kairos.modern.js',
    limit: '35 KB',
    gzip: false,
    running: false,
    fail: true,
    import: '*'
  },

  // Modern ESM Bundle (gzipped)
  {
    name: 'Modern ESM Bundle (gzipped)',
    path: 'dist/kairos.modern.js',
    limit: '9 KB',
    gzip: true,
    running: false,
    fail: true,
    import: '*'
  },

  // Individual plugin size limits
  {
    name: 'Holiday Plugin',
    path: 'dist/plugins/holiday/engine.js',
    limit: '12 KB',
    gzip: false,
    running: false,
    fail: true,
    import: './plugins/holiday/engine.js'
  },

  {
    name: 'Business Plugin',
    path: 'dist/plugins/business/workday.js',
    limit: '8 KB',
    gzip: false,
    running: false,
    fail: true,
    import: './plugins/business/workday.js'
  },

  {
    name: 'Locale Plugin (en-US)',
    path: 'dist/plugins/locale/en-US/index.js',
    limit: '3 KB',
    gzip: false,
    running: false,
    fail: true,
    import: './plugins/locale/en-US/index.js'
  }
];