// Platform-specific test utilities

export interface PlatformInfo {
  os: 'windows' | 'macos' | 'linux' | 'unknown';
  node: string;
  timezone: string;
  locale: string;
  arch: string;
  endianness: 'BE' | 'LE';
}

export function getPlatformInfo(): PlatformInfo {
  const os = process.platform;
  let osType: PlatformInfo['os'] = 'unknown';

  if (os === 'win32') {
    osType = 'windows';
  } else if (os === 'darwin') {
    osType = 'macos';
  } else if (os === 'linux') {
    osType = 'linux';
  }

  return {
    os: osType,
    node: process.version,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    arch: process.arch,
    endianness: require('os').endianness(),
  };
}

export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isMacOS(): boolean {
  return process.platform === 'darwin';
}

export function isLinux(): boolean {
  return process.platform === 'linux';
}

export function skipOnWindows(testFn: () => void): void {
  if (isWindows()) {
    test.skip('Skipped on Windows', () => {});
  } else {
    testFn();
  }
}

export function skipOnMacOS(testFn: () => void): void {
  if (isMacOS()) {
    test.skip('Skipped on macOS', () => {});
  } else {
    testFn();
  }
}

export function skipOnLinux(testFn: () => void): void {
  if (isLinux()) {
    test.skip('Skipped on Linux', () => {});
  } else {
    testFn();
  }
}

export function runOnlyOn(platform: 'windows' | 'macos' | 'linux', testFn: () => void): void {
  const currentPlatform = getPlatformInfo().os;
  if (currentPlatform === platform) {
    testFn();
  } else {
    test.skip(`Skipped - only runs on ${platform}`, () => {});
  }
}

// Timezone-specific test utilities
export function withTimezone(tz: string, testFn: () => void): void {
  const originalTZ = process.env.TZ;

  beforeEach(() => {
    process.env.TZ = tz;
  });

  afterEach(() => {
    if (originalTZ) {
      process.env.TZ = originalTZ;
    } else {
      delete process.env.TZ;
    }
  });

  testFn();
}

// Node version specific utilities
export function getNodeMajorVersion(): number {
  return parseInt(process.version.split('.')[0].substring(1), 10);
}

export function skipIfNodeBelow(version: number, testFn: () => void): void {
  if (getNodeMajorVersion() < version) {
    test.skip(`Skipped - requires Node ${version}+`, () => {});
  } else {
    testFn();
  }
}

// Platform-specific date handling
export function normalizeLineEndings(str: string): string {
  return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function getSystemTimezone(): string {
  if (isWindows()) {
    // Windows doesn't use TZ env var the same way
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// File system path utilities
export function normalizePath(path: string): string {
  if (isWindows()) {
    return path.replace(/\//g, '\\');
  }
  return path.replace(/\\/g, '/');
}

// Encoding utilities
export function getSystemEncoding(): string {
  if (isWindows()) {
    return 'cp1252'; // Windows default
  }
  return 'utf8';
}

// Performance utilities adjusted for platform
export function getPerformanceThreshold(baseMs: number): number {
  // Adjust thresholds based on platform
  if (isWindows()) {
    return baseMs * 1.2; // Windows tends to be slower in CI
  } else if (isMacOS()) {
    return baseMs * 0.9; // macOS tends to be faster
  }
  return baseMs;
}

// Memory utilities
export function getMemoryLimit(): number {
  // Return memory limit in MB based on platform
  if (isWindows()) {
    return 512;
  } else if (isMacOS()) {
    return 1024;
  }
  return 768; // Linux default
}

// Locale utilities
export function getAvailableLocales(): string[] {
  // Some locales might not be available on all platforms
  const baseLocales = ['en-US', 'en-GB'];

  if (!isWindows()) {
    // Unix-like systems typically have more locales available
    baseLocales.push('de-DE', 'fr-FR', 'ja-JP', 'tr-TR', 'zh-CN');
  }

  return baseLocales;
}

// Error message normalization
export function normalizeErrorMessage(message: string): string {
  // Different platforms may format error messages differently
  return message.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

// Date string normalization
export function normalizeDateString(dateStr: string): string {
  // Handle platform-specific date string differences
  if (isWindows()) {
    // Windows may use different date separators
    return dateStr.replace(/\\/g, '/');
  }
  return dateStr;
}

// Test data generators that account for platform differences
export function generateTestDates(): Date[] {
  const dates: Date[] = [];

  // Standard dates
  dates.push(new Date('2024-01-01'));
  dates.push(new Date('2024-06-15'));
  dates.push(new Date('2024-12-31'));

  // Platform-specific edge cases
  if (!isWindows()) {
    // Unix timestamp edge cases
    dates.push(new Date(0)); // Unix epoch
    dates.push(new Date(-1)); // Before epoch
  }

  // Timezone-sensitive dates
  dates.push(new Date('2024-03-10T02:30:00')); // DST transition (US)
  dates.push(new Date('2024-11-03T01:30:00')); // DST transition (US)

  return dates;
}

// Export test environment info for debugging
export function logTestEnvironment(): void {
  const info = getPlatformInfo();
  console.log('Test Environment:');
  console.log(`  OS: ${info.os}`);
  console.log(`  Node: ${info.node}`);
  console.log(`  Timezone: ${info.timezone}`);
  console.log(`  Locale: ${info.locale}`);
  console.log(`  Architecture: ${info.arch}`);
  console.log(`  Endianness: ${info.endianness}`);
}
