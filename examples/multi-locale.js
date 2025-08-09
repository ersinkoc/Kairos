// Multi-locale examples for Kairos
const kairos = require('../dist/index.js').default;
const { 
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  lunarCalculator,
  localeUS,
  localeDE,
  localeTR,
  localeJP,
  businessWorkday
} = require('../dist/index.js');

// Load all plugins
kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  lunarCalculator,
  localeUS,
  localeDE,
  localeTR,
  localeJP,
  businessWorkday
]);

console.log('=== Kairos Multi-Locale Examples ===\n');

// Test dates
const may1st = kairos('2024-05-01'); // Labor Day in many countries
const christmas = kairos('2024-12-25');
const july4th = kairos('2024-07-04');

console.log('1. Labor Day (May 1st) across different locales:');

// US Locale
kairos.locale('en-US');
console.log(`🇺🇸 US: May 1st is holiday: ${may1st.isHoliday()}`);
console.log(`🇺🇸 US: May 1st is business day: ${may1st.isBusinessDay()}`);

// German Locale
kairos.locale('de-DE');
console.log(`🇩🇪 Germany: May 1st is holiday: ${may1st.isHoliday()}`);
console.log(`🇩🇪 Germany: May 1st is business day: ${may1st.isBusinessDay()}`);
if (may1st.isHoliday()) {
  console.log(`🇩🇪 Germany: Holiday name: ${may1st.getHolidayInfo().name}`);
}

// Turkish Locale
kairos.locale('tr-TR');
console.log(`🇹🇷 Turkey: May 1st is holiday: ${may1st.isHoliday()}`);
console.log(`🇹🇷 Turkey: May 1st is business day: ${may1st.isBusinessDay()}`);
if (may1st.isHoliday()) {
  console.log(`🇹🇷 Turkey: Holiday name: ${may1st.getHolidayInfo().name}`);
}

console.log('\n2. Christmas across different locales:');

// US
kairos.locale('en-US');
console.log(`🇺🇸 US: Christmas is holiday: ${christmas.isHoliday()}`);
if (christmas.isHoliday()) {
  console.log(`🇺🇸 US: Holiday name: ${christmas.getHolidayInfo().name}`);
}

// Germany
kairos.locale('de-DE');
console.log(`🇩🇪 Germany: Christmas is holiday: ${christmas.isHoliday()}`);
if (christmas.isHoliday()) {
  console.log(`🇩🇪 Germany: Holiday name: ${christmas.getHolidayInfo().name}`);
}

// Turkey
kairos.locale('tr-TR');
console.log(`🇹🇷 Turkey: Christmas is holiday: ${christmas.isHoliday()}`);

// Japan
kairos.locale('ja-JP');
console.log(`🇯🇵 Japan: Christmas is holiday: ${christmas.isHoliday()}`);

console.log('\n3. Independence Day (July 4th) across locales:');

// US
kairos.locale('en-US');
console.log(`🇺🇸 US: July 4th is holiday: ${july4th.isHoliday()}`);
if (july4th.isHoliday()) {
  console.log(`🇺🇸 US: Holiday name: ${july4th.getHolidayInfo().name}`);
}

// Germany
kairos.locale('de-DE');
console.log(`🇩🇪 Germany: July 4th is holiday: ${july4th.isHoliday()}`);

// Turkey
kairos.locale('tr-TR');
console.log(`🇹🇷 Turkey: July 4th is holiday: ${july4th.isHoliday()}`);

console.log('\n4. Country-specific holidays:');

// German Easter holidays
kairos.locale('de-DE');
const easter2024 = kairos.getEaster(2024);
console.log(`🇩🇪 Germany: Easter 2024: ${easter2024.format('YYYY-MM-DD dddd')}`);

const easterHolidays = kairos.getEasterHolidays(2024);
console.log('🇩🇪 German Easter holidays 2024:');
easterHolidays.forEach(holiday => {
  console.log(`  ${holiday.date.format('MM-DD')}: ${holiday.name}`);
});

// Turkish religious holidays
kairos.locale('tr-TR');
console.log('\n🇹🇷 Turkish religious holidays:');
const religiousHolidays = kairos().getReligiousHolidays();
console.log('Religious holidays (names only):');
religiousHolidays.forEach(holiday => {
  console.log(`  ${holiday.name}`);
});

// Japanese Golden Week
kairos.locale('ja-JP');
console.log('\n🇯🇵 Japanese Golden Week 2024:');
const goldenWeek = kairos.getGoldenWeek(2024);
goldenWeek.forEach(holiday => {
  console.log(`  ${holiday.date.format('MM-DD')}: ${holiday.name}`);
});

// Japanese era information
const reiwaDate = kairos('2024-01-01');
console.log(`🇯🇵 Japan: 2024-01-01 in Japanese era: ${reiwaDate.formatWithEra()}`);

console.log('\n5. Business day differences across locales:');

const april30 = kairos('2024-04-30'); // Tuesday

// US locale
kairos.locale('en-US');
const nextBizUS = april30.nextBusinessDay();
console.log(`🇺🇸 US: Next business day after April 30: ${nextBizUS.format('YYYY-MM-DD dddd')}`);

// German locale
kairos.locale('de-DE');
const nextBizDE = april30.nextBusinessDay();
console.log(`🇩🇪 Germany: Next business day after April 30: ${nextBizDE.format('YYYY-MM-DD dddd')}`);

// Turkish locale
kairos.locale('tr-TR');
const nextBizTR = april30.nextBusinessDay();
console.log(`🇹🇷 Turkey: Next business day after April 30: ${nextBizTR.format('YYYY-MM-DD dddd')}`);

console.log('\n6. Locale-specific formatting:');

const sampleDate = kairos('2024-03-15');

// US formatting
kairos.locale('en-US');
console.log(`🇺🇸 US format: ${sampleDate.format('L')}`);
console.log(`🇺🇸 US long format: ${sampleDate.format('LLLL')}`);

// German formatting
kairos.locale('de-DE');
console.log(`🇩🇪 German format: ${sampleDate.format('L')}`);
console.log(`🇩🇪 German long format: ${sampleDate.format('LLLL')}`);

// Japanese formatting
kairos.locale('ja-JP');
console.log(`🇯🇵 Japanese format: ${sampleDate.format('L')}`);
console.log(`🇯🇵 Japanese long format: ${sampleDate.format('LLLL')}`);

console.log('\n7. Year overview for different locales:');

function printYearOverview(year, locale, flag) {
  kairos.locale(locale);
  const holidays = kairos.getYearHolidays(year, kairos().getHolidays());
  console.log(`${flag} ${locale}: ${holidays.length} holidays in ${year}`);
  
  // Show first 3 holidays
  holidays.slice(0, 3).forEach(holiday => {
    console.log(`  ${holiday.date.toISOString().split('T')[0]}: ${holiday.name}`);
  });
}

printYearOverview(2024, 'en-US', '🇺🇸');
printYearOverview(2024, 'de-DE', '🇩🇪');
printYearOverview(2024, 'tr-TR', '🇹🇷');
printYearOverview(2024, 'ja-JP', '🇯🇵');

console.log('\n8. Settlement calculations across locales:');

const tradeDate = kairos('2024-12-20'); // Friday before Christmas

// US settlement (T+2)
kairos.locale('en-US');
const settlementUS = tradeDate.settlementDate(2);
console.log(`🇺🇸 US T+2 settlement: ${settlementUS.format('YYYY-MM-DD dddd')}`);

// German settlement (T+2)
kairos.locale('de-DE');
const settlementDE = tradeDate.settlementDate(2);
console.log(`🇩🇪 German T+2 settlement: ${settlementDE.format('YYYY-MM-DD dddd')}`);

console.log('\n=== End of Multi-Locale Examples ===');