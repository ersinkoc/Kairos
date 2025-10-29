// Kairos - Revolutionary zero-dependency JavaScript date/time library
// Core export
export { default } from './core/plugin-system.js';

// Type exports
export type {
  KairosInstance,
  KairosStatic,
  KairosInput,
  KairosConfig as BaseKairosConfig,
  TimeUnit as BaseTimeUnit,
} from './core/types/base.js';

export type {
  KairosPlugin,
  PluginContext,
  PluginUtils,
  ParsePlugin,
  FormatPlugin,
  LocalePlugin,
  ExtensionMethods,
  StaticMethods,
} from './core/types/plugin.js';

export type {
  HolidayRule,
  FixedRule,
  NthWeekdayRule,
  RelativeRule,
  LunarRule,
  EasterRule,
  CustomRule,
  ObservedRule,
  HolidayInfo,
  HolidayCalculator,
  CalendarConverter,
  HolidaySet,
  BusinessDayConfig,
} from './core/types/holiday.js';

export type { PoolableObject } from './core/utils/object-pool.js';
export type { MemorySnapshot, MemoryAlert, MemoryThresholds } from './core/utils/memory-monitor.js';

// Advanced type exports
export type {
  // Branded types
  Timestamp,
  Year,
  Month,
  Day,
  Hour,
  Minute,
  Second,
  Millisecond,
  DayOfWeek,
  DayOfYear,
  WeekOfYear,
  LocaleCode,
  TimeZone,
  FormatString,
  DateString,
  HolidayId,
  BusinessDayId,
} from './core/types/brands.js';

// Branded type utility functions
export {
  createTimestamp,
  createYear,
  createMonth,
  createDay,
  createHour,
  createMinute,
  createSecond,
  createMillisecond,
  createDayOfWeek,
  createDayOfYear,
  createWeekOfYear,
  createLocaleCode,
  createTimeZone,
  createFormatString,
  createDateString,
  createHolidayId,
  createBusinessDayId,
  isValidTimestamp,
  isValidHour,
  isValidMinute,
  isValidSecond,
  isValidMillisecond,
  isValidDayOfWeek,
  isValidDayOfYear,
  isValidWeekOfYear,
  isValidLocaleCode,
  isValidFormatString,
  toTimestamp,
  toYear,
  toMonth,
  toDay,
  toHour,
  toMinute,
  toSecond,
  toMillisecond,
  toDayOfWeek,
  toDayOfYear,
  toWeekOfYear,
  toLocaleCode,
  toFormatString,
  isTimestamp,
  isYear,
  isMonth,
  isDay,
  isHour,
  isMinute,
  isSecond,
  isMillisecond,
  isDayOfWeek,
  isDayOfYear,
  isWeekOfYear,
  isLocaleCode,
  isFormatString,
} from './core/types/brands.js';

export type {
  // Format types
  FormatString as DateFormatString,
  StandardFormats,
  FormatToken,
  FormatValidator,
  FormatCompiler,
  CompiledFormat,
  DateOnlyFormat,
  TimeOnlyFormat,
  ISOFormat,
  LocaleFormat,
} from './core/types/format.js';

// Format token registry
export { FORMAT_TOKENS } from './core/types/format.js';

export type {
  // Utility types (avoiding duplicates with other imports)
  StrictDateComponents,
  PartialDateComponents,
  DateArithmeticOperation,
  DateValidation,
  DateParser,
  DateFormatter,
  Duration,
  DeepPartial,
  DeepRequired,
} from './core/types/utilities.js';

export type {
  // Error types
  ParsingError,
  ConfigurationError,
} from './core/types/errors.js';

// Error handling classes
export {
  ErrorFactory,
  ErrorHandler,
  InvalidDateError,
  ValidationError,
  InvalidFormatError,
  PluginError,
  InvalidLocaleError,
  InvalidTimezoneError,
  KairosBaseError
} from './core/types/errors.js';

// Plugin exports
export { default as holidayEngine } from './plugins/holiday/engine.js';
export { default as fixedCalculator } from './plugins/holiday/calculators/fixed.js';
export { default as nthWeekdayCalculator } from './plugins/holiday/calculators/nth-weekday.js';
export { default as easterCalculator } from './plugins/holiday/calculators/easter.js';
export { default as lunarCalculator } from './plugins/holiday/calculators/lunar.js';
export { default as relativeCalculator } from './plugins/holiday/calculators/relative.js';
export { default as customCalculator } from './plugins/holiday/calculators/custom.js';

export { default as businessWorkday } from './plugins/business/workday.js';
export { default as businessFiscal } from './plugins/business/fiscal.js';

export { default as relativeTimePlugin } from './plugins/relative/relative-time.js';
export { default as calendarPlugin } from './plugins/calendar/calendar.js';

export { default as localeUS } from './plugins/locale/en-US/index.js';
export { default as localeTR } from './plugins/locale/tr-TR/index.js';
export { default as localeDE } from './plugins/locale/de-DE/index.js';
export { default as localeJP } from './plugins/locale/ja-JP/index.js';
export { default as localeFR } from './plugins/locale/fr-FR/index.js';
export { default as localeES } from './plugins/locale/es-ES/index.js';
export { default as localeIT } from './plugins/locale/it-IT/index.js';
export { default as localePT } from './plugins/locale/pt-BR/index.js';
export { default as localeRU } from './plugins/locale/ru-RU/index.js';
export { default as localeCN } from './plugins/locale/zh-CN/index.js';

// Utility exports
export { LRUCache, memoize, createDateCache, createHolidayCache } from './core/utils/cache.js';
export { ObjectPool, createPool, globalPoolManager, datePool } from './core/utils/object-pool.js';
export { MemoryMonitor, globalMemoryMonitor } from './core/utils/memory-monitor.js';
export {
  isValidDate,
  isValidNumber,
  isValidString,
  isValidYear,
  isValidMonth,
  isValidDay,
  isValidWeekday,
  isValidNth,
  validateHolidayRule,
  throwError,
} from './core/utils/validators.js';

// Advanced validation and error handling system
export {
  AdvancedValidator,
  globalValidator,
  validateDateComponents,
  validateHolidayRule as validateHolidayRuleAdvanced,
  createCustomValidator,
  type ValidationContext,
  type ValidationRule,
  type EnhancedValidationResult,
  type EnhancedValidationSchema,
  type ValidationErrorDetail,
  type ValidationWarning,
} from './core/utils/validation-framework.js';

export {
  AdvancedErrorHandler,
  globalErrorHandler,
  ErrorBoundary,
  ErrorMonitor,
  globalErrorMonitor,
  handleError,
  type RecoveryStrategy,
  type ErrorSeverity,
  type ErrorContext,
  type ErrorRecoveryResult,
  type RecoveryConfig,
  type ErrorMetrics,
  type ErrorAlert,
} from './core/utils/error-handling.js';

export {
  ErrorManager,
  globalErrorManager,
  executeWithErrorHandling,
  validateWithErrorHandling,
  handleWithErrorRecovery,
  type ErrorManagerConfig,
  type ErrorManagerResult,
  type OperationConfig,
} from './core/utils/error-manager.js';

// Calculator classes
export { FixedCalculator } from './plugins/holiday/calculators/fixed.js';

export { NthWeekdayCalculator } from './plugins/holiday/calculators/nth-weekday.js';

export { EasterCalculator } from './plugins/holiday/calculators/easter.js';

export { LunarCalculator } from './plugins/holiday/calculators/lunar.js';

export { RelativeCalculator } from './plugins/holiday/calculators/relative.js';

export { CustomCalculator, CustomCalculatorUtils } from './plugins/holiday/calculators/custom.js';

export { BusinessDayCalculator } from './plugins/business/workday.js';

export { FiscalYearCalculator } from './plugins/business/fiscal.js';

export { RelativeTimeCalculator } from './plugins/relative/relative-time.js';
export { CalendarCalculator } from './plugins/calendar/calendar.js';

// Holiday definitions
export {
  holidays as usHolidays,
  stateHolidays as usStateHolidays,
  federalHolidays as usFederalHolidays,
  allHolidays as allUSHolidays,
} from './plugins/locale/en-US/holidays.js';

export {
  holidays as turkishHolidays,
  observances as turkishObservances,
  historicalHolidays as turkishHistoricalHolidays,
  allHolidays as allTurkishHolidays,
  publicHolidays as turkishPublicHolidays,
} from './plugins/locale/tr-TR/holidays.js';

export {
  holidays as germanHolidays,
  stateHolidays as germanStateHolidays,
  federalHolidays as germanFederalHolidays,
  allHolidays as allGermanHolidays,
  historicalHolidays as germanHistoricalHolidays,
} from './plugins/locale/de-DE/holidays.js';

export {
  holidays as japaneseHolidays,
  observances as japaneseObservances,
  historicalHolidays as japaneseHistoricalHolidays,
  goldenWeekHolidays as japaneseGoldenWeekHolidays,
  publicHolidays as japanesePublicHolidays,
  allHolidays as allJapaneseHolidays,
  reiwaHolidays as japaneseReiwaHolidays,
  heiseiHolidays as japaneseHeiseiHolidays,
} from './plugins/locale/ja-JP/holidays.js';

// Version and metadata
export const VERSION = '1.1.0';
export const AUTHOR = 'Ersin Koc';
export const REPOSITORY = 'https://github.com/ersinkoc/kairos';
export const HOMEPAGE = 'https://github.com/ersinkoc/kairos#readme';
export const DESCRIPTION =
  'Revolutionary zero-dependency JavaScript date/time library with modular architecture and dynamic holiday system';

// Convenience setup functions
export function setupBasic() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const parseFlexible = require('./plugins/parse/flexible.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const parseISO = require('./plugins/parse/iso.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const formatTokens = require('./plugins/format/tokens.js').default;

  kairos.use([parseFlexible, parseISO, formatTokens]);
  return kairos;
}

export function setupWithBusiness() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const businessWorkday = require('./plugins/business/workday.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const businessFiscal = require('./plugins/business/fiscal.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const holidayEngine = require('./plugins/holiday/engine.js').default;

  kairos.use([businessWorkday, businessFiscal, holidayEngine]);
  return kairos;
}

export function setupWithLocales() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeUS = require('./plugins/locale/en-US/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeDE = require('./plugins/locale/de-DE/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeTR = require('./plugins/locale/tr-TR/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeJP = require('./plugins/locale/ja-JP/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeFR = require('./plugins/locale/fr-FR/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeES = require('./plugins/locale/es-ES/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeIT = require('./plugins/locale/it-IT/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localePT = require('./plugins/locale/pt-BR/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeRU = require('./plugins/locale/ru-RU/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeCN = require('./plugins/locale/zh-CN/index.js').default;

  kairos.use([
    localeUS,
    localeDE,
    localeTR,
    localeJP,
    localeFR,
    localeES,
    localeIT,
    localePT,
    localeRU,
    localeCN,
  ]);
  kairos.locale('en-US');
  return kairos;
}

export function setupFull() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const holidayEngine = require('./plugins/holiday/engine.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const businessWorkday = require('./plugins/business/workday.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const businessFiscal = require('./plugins/business/fiscal.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const relativeTimePlugin = require('./plugins/relative/relative-time.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const calendarPlugin = require('./plugins/calendar/calendar.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const durationPlugin = require('./plugins/duration/duration.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rangePlugin = require('./plugins/range/range.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const timezonePlugin = require('./plugins/timezone/timezone.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const parseFlexible = require('./plugins/parse/flexible.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const parseISO = require('./plugins/parse/iso.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const parseRFC2822 = require('./plugins/parse/rfc2822.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const parseUnix = require('./plugins/parse/unix.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const formatTokens = require('./plugins/format/tokens.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeUS = require('./plugins/locale/en-US/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeDE = require('./plugins/locale/de-DE/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeTR = require('./plugins/locale/tr-TR/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeJP = require('./plugins/locale/ja-JP/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeFR = require('./plugins/locale/fr-FR/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeES = require('./plugins/locale/es-ES/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeIT = require('./plugins/locale/it-IT/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localePT = require('./plugins/locale/pt-BR/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeRU = require('./plugins/locale/ru-RU/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localeCN = require('./plugins/locale/zh-CN/index.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fixedCalculator = require('./plugins/holiday/calculators/fixed.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nthWeekdayCalculator = require('./plugins/holiday/calculators/nth-weekday.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const easterCalculator = require('./plugins/holiday/calculators/easter.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const lunarCalculator = require('./plugins/holiday/calculators/lunar.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const relativeCalculator = require('./plugins/holiday/calculators/relative.js').default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const customCalculator = require('./plugins/holiday/calculators/custom.js').default;

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
    relativeTimePlugin,
    calendarPlugin,
    durationPlugin,
    rangePlugin,
    timezonePlugin,
    parseFlexible,
    parseISO,
    parseRFC2822,
    parseUnix,
    formatTokens,
    localeUS,
    localeDE,
    localeTR,
    localeJP,
    localeFR,
    localeES,
    localeIT,
    localePT,
    localeRU,
    localeCN,
  ]);

  kairos.locale('en-US');
  return kairos;
}
