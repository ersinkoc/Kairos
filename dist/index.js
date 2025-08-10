export { default } from './core/plugin-system.js';
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
export { LRUCache, memoize, createDateCache, createHolidayCache } from './core/utils/cache.js';
export { isValidDate, isValidNumber, isValidString, isValidYear, isValidMonth, isValidDay, isValidWeekday, isValidNth, validateHolidayRule, throwError, } from './core/utils/validators.js';
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
export { holidays as usHolidays, stateHolidays as usStateHolidays, federalHolidays as usFederalHolidays, allHolidays as allUSHolidays, } from './plugins/locale/en-US/holidays.js';
export { holidays as turkishHolidays, observances as turkishObservances, historicalHolidays as turkishHistoricalHolidays, allHolidays as allTurkishHolidays, publicHolidays as turkishPublicHolidays, } from './plugins/locale/tr-TR/holidays.js';
export { holidays as germanHolidays, stateHolidays as germanStateHolidays, federalHolidays as germanFederalHolidays, allHolidays as allGermanHolidays, historicalHolidays as germanHistoricalHolidays, } from './plugins/locale/de-DE/holidays.js';
export { holidays as japaneseHolidays, observances as japaneseObservances, historicalHolidays as japaneseHistoricalHolidays, goldenWeekHolidays as japaneseGoldenWeekHolidays, publicHolidays as japanesePublicHolidays, allHolidays as allJapaneseHolidays, reiwaHolidays as japaneseReiwaHolidays, heiseiHolidays as japaneseHeiseiHolidays, } from './plugins/locale/ja-JP/holidays.js';
export const VERSION = '1.1.0';
export const AUTHOR = 'Ersin Koc';
export const REPOSITORY = 'https://github.com/ersinkoc/kairos';
export const HOMEPAGE = 'https://github.com/ersinkoc/kairos#readme';
export const DESCRIPTION = 'Revolutionary zero-dependency JavaScript date/time library with modular architecture and dynamic holiday system';
export function setupBasic() {
    const kairos = require('./core/plugin-system.js').default;
    const parseFlexible = require('./plugins/parse/flexible.js').default;
    const parseISO = require('./plugins/parse/iso.js').default;
    const formatTokens = require('./plugins/format/tokens.js').default;
    kairos.use([parseFlexible, parseISO, formatTokens]);
    return kairos;
}
export function setupWithBusiness() {
    const kairos = require('./core/plugin-system.js').default;
    const businessWorkday = require('./plugins/business/workday.js').default;
    const businessFiscal = require('./plugins/business/fiscal.js').default;
    const holidayEngine = require('./plugins/holiday/engine.js').default;
    kairos.use([businessWorkday, businessFiscal, holidayEngine]);
    return kairos;
}
export function setupWithLocales() {
    const kairos = require('./core/plugin-system.js').default;
    const localeUS = require('./plugins/locale/en-US/index.js').default;
    const localeDE = require('./plugins/locale/de-DE/index.js').default;
    const localeTR = require('./plugins/locale/tr-TR/index.js').default;
    const localeJP = require('./plugins/locale/ja-JP/index.js').default;
    const localeFR = require('./plugins/locale/fr-FR/index.js').default;
    const localeES = require('./plugins/locale/es-ES/index.js').default;
    const localeIT = require('./plugins/locale/it-IT/index.js').default;
    const localePT = require('./plugins/locale/pt-BR/index.js').default;
    const localeRU = require('./plugins/locale/ru-RU/index.js').default;
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
    const kairos = require('./core/plugin-system.js').default;
    const holidayEngine = require('./plugins/holiday/engine.js').default;
    const businessWorkday = require('./plugins/business/workday.js').default;
    const businessFiscal = require('./plugins/business/fiscal.js').default;
    const relativeTimePlugin = require('./plugins/relative/relative-time.js').default;
    const calendarPlugin = require('./plugins/calendar/calendar.js').default;
    const durationPlugin = require('./plugins/duration/duration.js').default;
    const rangePlugin = require('./plugins/range/range.js').default;
    const timezonePlugin = require('./plugins/timezone/timezone.js').default;
    const parseFlexible = require('./plugins/parse/flexible.js').default;
    const parseISO = require('./plugins/parse/iso.js').default;
    const parseRFC2822 = require('./plugins/parse/rfc2822.js').default;
    const parseUnix = require('./plugins/parse/unix.js').default;
    const formatTokens = require('./plugins/format/tokens.js').default;
    const localeUS = require('./plugins/locale/en-US/index.js').default;
    const localeDE = require('./plugins/locale/de-DE/index.js').default;
    const localeTR = require('./plugins/locale/tr-TR/index.js').default;
    const localeJP = require('./plugins/locale/ja-JP/index.js').default;
    const localeFR = require('./plugins/locale/fr-FR/index.js').default;
    const localeES = require('./plugins/locale/es-ES/index.js').default;
    const localeIT = require('./plugins/locale/it-IT/index.js').default;
    const localePT = require('./plugins/locale/pt-BR/index.js').default;
    const localeRU = require('./plugins/locale/ru-RU/index.js').default;
    const localeCN = require('./plugins/locale/zh-CN/index.js').default;
    const fixedCalculator = require('./plugins/holiday/calculators/fixed.js').default;
    const nthWeekdayCalculator = require('./plugins/holiday/calculators/nth-weekday.js').default;
    const easterCalculator = require('./plugins/holiday/calculators/easter.js').default;
    const lunarCalculator = require('./plugins/holiday/calculators/lunar.js').default;
    const relativeCalculator = require('./plugins/holiday/calculators/relative.js').default;
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
//# sourceMappingURL=index.js.map