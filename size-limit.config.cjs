/**
 * Size Limit Configuration for Kairos
 * Focuses on browser-friendly bundles without Node.js dependencies
 */

module.exports = [
  // Core library (UMD minified)
  {
    name: 'Core Library (UMD)',
    path: 'dist/kairos.umd.min.js',
    limit: '60 KB',
    gzip: false,
    fail: true
  },

  // Core library (UMD gzipped)
  {
    name: 'Core Library (UMD gzipped)',
    path: 'dist/kairos.umd.min.js',
    limit: '20 KB',
    gzip: true,
    fail: true
  },

  // ESM Bundle (minified)
  {
    name: 'ESM Bundle',
    path: 'dist/kairos.esm.min.js',
    limit: '60 KB',
    gzip: false,
    fail: true
  },

  // ESM Bundle (gzipped)
  {
    name: 'ESM Bundle (gzipped)',
    path: 'dist/kairos.esm.min.js',
    limit: '20 KB',
    gzip: true,
    fail: true
  },

  // Modern ES2022 Bundle
  {
    name: 'Modern ES2022 Bundle',
    path: 'dist/kairos.modern.js',
    limit: '55 KB',
    gzip: false,
    fail: true
  },

  // Modern ES2022 Bundle (gzipped)
  {
    name: 'Modern ES2022 Bundle (gzipped)',
    path: 'dist/kairos.modern.js',
    limit: '18 KB',
    gzip: true,
    fail: true
  },

  // IIFE Bundle (minified)
  {
    name: 'IIFE Bundle',
    path: 'dist/kairos.iife.min.js',
    limit: '60 KB',
    gzip: false,
    fail: true
  },

  // IIFE Bundle (gzipped)
  {
    name: 'IIFE Bundle (gzipped)',
    path: 'dist/kairos.iife.min.js',
    limit: '20 KB',
    gzip: true,
    fail: true
  }
];