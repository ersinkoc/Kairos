/**
 * Localization and Internationalization
 * Working with different locales and languages
 */

const kairos = require('../dist/index.js');

// Import locale plugins
const enUS = require('../dist/plugins/locale/en-US').default;
const deDE = require('../dist/plugins/locale/de-DE').default;
const trTR = require('../dist/plugins/locale/tr-TR').default;
const jaJP = require('../dist/plugins/locale/ja-JP').default;

console.log('=== LOCALIZATION ===\n');

// Loading locales
console.log('[ Loading Locales ]');
kairos.locale('en-US', enUS);
kairos.locale('de-DE', deDE);
kairos.locale('tr-TR', trTR);
kairos.locale('ja-JP', jaJP);
console.log('Loaded locales: en-US, de-DE, tr-TR, ja-JP');

// Date in different locales
console.log('\n[ Date Formatting by Locale ]');
const internationalDate = kairos('2024-06-15 14:30:00');

// English (US)
kairos.setLocale('en-US');
console.log('English (US):');
console.log('  Full:', internationalDate.format('LLLL'));
console.log('  Long:', internationalDate.format('LLL'));
console.log('  Medium:', internationalDate.format('LL'));
console.log('  Short:', internationalDate.format('L'));

// German
kairos.setLocale('de-DE');
console.log('\nGerman (Germany):');
console.log('  Full:', internationalDate.format('LLLL'));
console.log('  Long:', internationalDate.format('LLL'));
console.log('  Medium:', internationalDate.format('LL'));
console.log('  Short:', internationalDate.format('L'));

// Turkish
kairos.setLocale('tr-TR');
console.log('\nTurkish (Turkey):');
console.log('  Full:', internationalDate.format('LLLL'));
console.log('  Long:', internationalDate.format('LLL'));
console.log('  Medium:', internationalDate.format('LL'));
console.log('  Short:', internationalDate.format('L'));

// Japanese
kairos.setLocale('ja-JP');
console.log('\nJapanese (Japan):');
console.log('  Full:', internationalDate.format('LLLL'));
console.log('  Long:', internationalDate.format('LLL'));
console.log('  Medium:', internationalDate.format('LL'));
console.log('  Short:', internationalDate.format('L'));

// Reset to English for remaining examples
kairos.setLocale('en-US');

// Month names in different locales
console.log('\n[ Month Names ]');
const january = kairos('2024-01-15');

console.log('January in different languages:');
kairos.setLocale('en-US');
console.log('  English:', january.format('MMMM'));
kairos.setLocale('de-DE');
console.log('  German:', january.format('MMMM'));
kairos.setLocale('tr-TR');
console.log('  Turkish:', january.format('MMMM'));
kairos.setLocale('ja-JP');
console.log('  Japanese:', january.format('MMMM'));

// Weekday names
console.log('\n[ Weekday Names ]');
const monday = kairos('2024-06-10'); // Monday

console.log('Monday in different languages:');
kairos.setLocale('en-US');
console.log('  English:', monday.format('dddd'));
kairos.setLocale('de-DE');
console.log('  German:', monday.format('dddd'));
kairos.setLocale('tr-TR');
console.log('  Turkish:', monday.format('dddd'));
kairos.setLocale('ja-JP');
console.log('  Japanese:', monday.format('dddd'));

// Number formatting
console.log('\n[ Number Formatting ]');
kairos.setLocale('en-US');
const sampleNum = kairos('2024-12-25');

console.log('Date components:');
kairos.setLocale('en-US');
console.log('  US format:', sampleNum.format('MM/DD/YYYY'));
kairos.setLocale('de-DE');
console.log('  German format:', sampleNum.format('DD.MM.YYYY'));
kairos.setLocale('ja-JP');
console.log('  Japanese format:', sampleNum.format('YYYY年MM月DD日'));

// Locale-specific holidays
console.log('\n[ Locale-Specific Holidays ]');
const holidayPlugin = require('../dist/plugins/holiday/holiday').default;
kairos.use(holidayPlugin);

const checkHoliday = (date, locale) => {
  kairos.setLocale(locale);
  const holiday = date.getHoliday();
  return holiday ? holiday.name : 'Not a holiday';
};

const christmas = kairos('2024-12-25');
const thanksgiving = kairos('2024-11-28');
const germanUnity = kairos('2024-10-03');

console.log('Christmas (Dec 25):');
console.log('  US:', checkHoliday(christmas, 'en-US'));
console.log('  Germany:', checkHoliday(christmas, 'de-DE'));

console.log('\nThanksgiving (Nov 28, 2024):');
console.log('  US:', checkHoliday(thanksgiving, 'en-US'));
console.log('  Germany:', checkHoliday(thanksgiving, 'de-DE'));

console.log('\nGerman Unity Day (Oct 3):');
console.log('  US:', checkHoliday(germanUnity, 'en-US'));
console.log('  Germany:', checkHoliday(germanUnity, 'de-DE'));

// Relative time in different locales
console.log('\n[ Relative Time ]');
const relativePlugin = require('../dist/plugins/relative/relative').default;
kairos.use(relativePlugin);

const past = kairos().subtract(2, 'hours');
const future = kairos().add(3, 'days');

console.log('2 hours ago:');
kairos.setLocale('en-US');
console.log('  English:', past.fromNow());
kairos.setLocale('de-DE');
console.log('  German:', past.fromNow());
kairos.setLocale('tr-TR');
console.log('  Turkish:', past.fromNow());

console.log('\nIn 3 days:');
kairos.setLocale('en-US');
console.log('  English:', future.fromNow());
kairos.setLocale('de-DE');
console.log('  German:', future.fromNow());
kairos.setLocale('tr-TR');
console.log('  Turkish:', future.fromNow());

// Calendar format
console.log('\n[ Calendar Format ]');
const today = kairos();
const tomorrow = kairos().add(1, 'day');
const nextWeek = kairos().add(1, 'week');

kairos.setLocale('en-US');
console.log('Calendar (English):');
console.log('  Today:', today.calendar());
console.log('  Tomorrow:', tomorrow.calendar());
console.log('  Next week:', nextWeek.calendar());

kairos.setLocale('de-DE');
console.log('\nCalendar (German):');
console.log('  Today:', today.calendar());
console.log('  Tomorrow:', tomorrow.calendar());
console.log('  Next week:', nextWeek.calendar());

// Reset locale
kairos.setLocale('en-US');
console.log('\n[ Locale Reset ]');
console.log('Current locale reset to:', kairos.getLocale());