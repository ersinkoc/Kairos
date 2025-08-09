// Setup for cross-platform tests
import kairos from '../../src/core/plugin-system';
import holidayEngine from '../../src/plugins/holiday/engine';
import fixedCalculator from '../../src/plugins/holiday/calculators/fixed';
import nthWeekdayCalculator from '../../src/plugins/holiday/calculators/nth-weekday';
import easterCalculator from '../../src/plugins/holiday/calculators/easter';
import lunarCalculator from '../../src/plugins/holiday/calculators/lunar';
import relativeCalculator from '../../src/plugins/holiday/calculators/relative';
import customCalculator from '../../src/plugins/holiday/calculators/custom';
import businessWorkday from '../../src/plugins/business/workday';
import businessFiscal from '../../src/plugins/business/fiscal';
import localeUS from '../../src/plugins/locale/en-US/index';
import localeTR from '../../src/plugins/locale/tr-TR/index';
import localeDE from '../../src/plugins/locale/de-DE/index';
import localeJP from '../../src/plugins/locale/ja-JP/index';
import formatTokens from '../../src/plugins/format/tokens';
import timezonePlugin from '../../src/plugins/timezone/timezone';
import flexibleParser from '../../src/plugins/parse/flexible';
import rfc2822Parser from '../../src/plugins/parse/rfc2822';
import unixParser from '../../src/plugins/parse/unix';

// Load all plugins for comprehensive testing
kairos.use([
  // Core plugins
  formatTokens,
  timezonePlugin,
  
  // Parse plugins
  flexibleParser,
  rfc2822Parser,
  unixParser,
  
  // Holiday system
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  lunarCalculator,
  relativeCalculator,
  customCalculator,
  
  // Business plugins
  businessWorkday,
  businessFiscal,
  
  // Locales
  localeUS,
  localeTR,
  localeDE,
  localeJP,
]);

// Set default locale
kairos.locale('en-US');

export default kairos;