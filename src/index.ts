// Kairos - Revolutionary zero-dependency JavaScript date/time library
// Core export
export { default } from './core/plugin-system.js';

// Type exports
export type {
  KairosInstance,
  KairosStatic,
  KairosInput,
  KairosConfig,
  TimeUnit,
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

// Utility exports
export { LRUCache, memoize, createDateCache, createHolidayCache } from './core/utils/cache.js';
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
export const VERSION = '1.0.0';
export const AUTHOR = 'Ersin Koc';
export const REPOSITORY = 'https://github.com/ersinkoc/kairos';
export const HOMEPAGE = 'https://github.com/ersinkoc/kairos#readme';
export const DESCRIPTION =
  'Revolutionary zero-dependency JavaScript date/time library with modular architecture and dynamic holiday system';

// Convenience setup functions
export function setupBasic() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // Use individual plugins as needed
  return kairos;
}

export function setupWithBusiness() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // Use individual plugins as needed
  return kairos;
}

export function setupWithLocales() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // Use individual plugins as needed
  return kairos;
}

export function setupFull() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const kairos = require('./core/plugin-system.js').default;
  // Use individual plugins as needed
  return kairos;
}
