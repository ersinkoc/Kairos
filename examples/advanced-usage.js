// Advanced usage examples for Kairos
const kairos = require('../dist/index.js').default;
const { 
  setupFull,
  Duration,
  DateRange,
  customCalculatorUtils
} = require('../dist/index.js');

// Full setup with all features
const k = setupFull();

console.log('=== Kairos Advanced Usage Examples ===\n');

// 1. Duration handling
console.log('1. Duration Handling:');
const duration1 = k.duration({ hours: 2, minutes: 30 });
const duration2 = k.duration('PT2H30M'); // ISO 8601 format
const duration3 = k.duration('2 hours 30 minutes');

console.log(`Duration 1: ${duration1.humanize()}`);
console.log(`Duration 2: ${duration2.humanize()}`);
console.log(`Duration 3: ${duration3.humanize()}`);

// Duration arithmetic
const totalDuration = duration1.add(duration2);
console.log(`Total duration: ${totalDuration.humanize()}`);

// Time calculations with durations
const startTime = k('2024-01-15 09:00');
const endTime = startTime.addDuration(duration1);
console.log(`Start: ${startTime.format('YYYY-MM-DD HH:mm')}`);
console.log(`End: ${endTime.format('YYYY-MM-DD HH:mm')}`);

// 2. Date ranges
console.log('\n2. Date Ranges:');
const rangeStart = k('2024-01-01');
const rangeEnd = k('2024-01-31');
const dateRange = rangeStart.range(rangeEnd);

console.log(`Range: ${rangeStart.format('MMM D')} to ${rangeEnd.format('MMM D')}`);
console.log(`Total days: ${dateRange.count()}`);

// Business days in range
const businessDays = dateRange.businessDays();
console.log(`Business days: ${businessDays.length}`);

// Weekends in range
const weekends = dateRange.weekends();
console.log(`Weekends: ${weekends.length}`);

// Filter specific weekdays
const mondays = dateRange.weekday(1);
console.log(`Mondays: ${mondays.length}`);

// 3. Complex holiday calculations
console.log('\n3. Complex Holiday Calculations:');

// Create custom holidays
const customHolidays = [
  {
    name: 'Company Foundation Day',
    type: 'fixed',
    rule: { month: 3, day: 15 }
  },
  {
    name: 'Summer Retreat',
    type: 'nth-weekday',
    rule: { month: 7, weekday: 5, nth: 2 } // 2nd Friday of July
  },
  {
    name: 'Post-Thanksgiving',
    type: 'relative',
    rule: { relativeTo: 'Thanksgiving', offset: 1 }
  },
  {
    name: 'Harvest Festival',
    type: 'custom',
    rule: {
      calculate: (year) => {
        // First Saturday after autumnal equinox
        const equinox = customCalculatorUtils.calculateAutumnalEquinox(year);
        let saturday = new Date(equinox);
        while (saturday.getDay() !== 6) {
          saturday.setDate(saturday.getDate() + 1);
        }
        return saturday;
      }
    }
  }
];

// Calculate custom holidays for 2024
console.log('Custom holidays for 2024:');
customHolidays.forEach(holiday => {
  try {
    const dates = k.holidayEngine.calculate(holiday, 2024);
    dates.forEach(date => {
      console.log(`  ${holiday.name}: ${k(date).format('YYYY-MM-DD dddd')}`);
    });
  } catch (error) {
    console.log(`  ${holiday.name}: Error calculating`);
  }
});

// 4. Timezone handling
console.log('\n4. Timezone Handling:');
const utcTime = k.utc('2024-01-15 12:00:00');
console.log(`UTC time: ${utcTime.format('YYYY-MM-DD HH:mm')} UTC`);

// Convert to different timezones
const nyTime = utcTime.tz('America/New_York');
const tokyoTime = utcTime.tz('Asia/Tokyo');
const londonTime = utcTime.tz('Europe/London');

console.log(`New York: ${nyTime.format('YYYY-MM-DD HH:mm')}`);
console.log(`Tokyo: ${tokyoTime.format('YYYY-MM-DD HH:mm')}`);
console.log(`London: ${londonTime.format('YYYY-MM-DD HH:mm')}`);

// Get timezone info
const tzInfo = nyTime.timezone();
console.log(`NY timezone: ${tzInfo.name} (${tzInfo.abbreviation})`);
console.log(`Offset: ${tzInfo.offset} minutes`);
console.log(`DST: ${tzInfo.dst}`);

// 5. Fiscal year calculations
console.log('\n5. Fiscal Year Calculations:');
const fiscalDate = k('2024-06-15');

// Different fiscal year configurations
const fiscalConfigs = [
  { name: 'US Government', config: { start: 10 } },
  { name: 'UK Government', config: { start: 4 } },
  { name: 'Australia', config: { start: 7 } },
  { name: 'Japan', config: { start: 4 } }
];

console.log(`Date: ${fiscalDate.format('YYYY-MM-DD')}`);
fiscalConfigs.forEach(({ name, config }) => {
  const fy = fiscalDate.fiscalYear(config);
  const fq = fiscalDate.fiscalQuarter(config);
  const fyStart = fiscalDate.fiscalYearStart(config);
  const fyEnd = fiscalDate.fiscalYearEnd(config);
  
  console.log(`${name}: FY${fy} Q${fq}`);
  console.log(`  Period: ${fyStart.format('MMM D')} - ${fyEnd.format('MMM D')}`);
});

// 6. Business day scenarios
console.log('\n6. Business Day Scenarios:');

// Project timeline calculation
const projectStart = k('2024-01-15');
const phases = [
  { name: 'Planning', duration: 5 },
  { name: 'Design', duration: 10 },
  { name: 'Development', duration: 30 },
  { name: 'Testing', duration: 15 },
  { name: 'Deployment', duration: 5 }
];

console.log('Project Timeline:');
let currentPhaseStart = projectStart;

phases.forEach(phase => {
  const phaseEnd = currentPhaseStart.addBusinessDays(phase.duration);
  console.log(`${phase.name}: ${currentPhaseStart.format('MMM D')} - ${phaseEnd.format('MMM D')} (${phase.duration} business days)`);
  currentPhaseStart = phaseEnd;
});

const totalProjectDuration = projectStart.businessDaysBetween(currentPhaseStart);
console.log(`Total project duration: ${totalProjectDuration} business days`);

// 7. Advanced date manipulations
console.log('\n7. Advanced Date Manipulations:');

// Get all Fridays in a year
const year2024 = k.yearRange(2024);
const fridaysIn2024 = year2024.weekday(5); // 5 = Friday
console.log(`Total Fridays in 2024: ${fridaysIn2024.length}`);

// Get all Friday the 13ths in a year
const friday13ths = fridaysIn2024.filter(friday => friday.getDate() === 13);
console.log(`Friday the 13ths in 2024: ${friday13ths.length}`);
friday13ths.forEach(friday => {
  console.log(`  ${k(friday).format('YYYY-MM-DD dddd')}`);
});

// 8. Complex formatting with locales
console.log('\n8. Complex Formatting:');

const sampleDate = k('2024-03-15 14:30:45');

// Different locale formats
const locales = ['en-US', 'de-DE', 'tr-TR', 'ja-JP'];
locales.forEach(locale => {
  k.locale(locale);
  console.log(`${locale}: ${sampleDate.format('LLLL')}`);
});

// Custom formatting with tokens
k.locale('en-US');
console.log(`Custom format: ${sampleDate.format('dddd, MMMM Do YYYY [at] h:mm:ss A')}`);

// 9. Performance optimizations
console.log('\n9. Performance Optimizations:');

// Batch holiday calculations
const years = [2024, 2025, 2026];
const startTime = Date.now();

years.forEach(year => {
  const holidays = k.getYearHolidays(year, k().getHolidays());
  console.log(`${year}: ${holidays.length} holidays`);
});

const endTime = Date.now();
console.log(`Batch calculation time: ${endTime - startTime}ms`);

// 10. Error handling and edge cases
console.log('\n10. Error Handling:');

// Invalid date handling
try {
  const invalidDate = k('invalid-date-string');
  console.log(`Invalid date handled: ${invalidDate.format()}`);
} catch (error) {
  console.log(`Error caught: ${error.message}`);
}

// Leap year handling
const leapYear = k('2024-02-29');
const nonLeapYear = k('2023-02-28');

console.log(`Leap year date: ${leapYear.format('YYYY-MM-DD')}`);
console.log(`Non-leap year date: ${nonLeapYear.format('YYYY-MM-DD')}`);

// Add a year to leap day
const nextYear = leapYear.add(1, 'year');
console.log(`Leap day + 1 year: ${nextYear.format('YYYY-MM-DD')}`);

// 11. Chaining operations
console.log('\n11. Chaining Operations:');

const complexChain = k('2024-01-01')
  .add(1, 'month')
  .nextBusinessDay()
  .addBusinessDays(15)
  .endOf('month')
  .previousBusinessDay();

console.log(`Complex chain result: ${complexChain.format('YYYY-MM-DD dddd')}`);

// 12. Relative time descriptions
console.log('\n12. Relative Time Descriptions:');

const pastDate = k().subtract(2, 'days');
const futureDate = k().add(3, 'days');

console.log(`Past date: ${pastDate.fromNow()}`);
console.log(`Future date: ${futureDate.toNow()}`);

// Duration between dates
const meetingStart = k('2024-01-15 09:00');
const meetingEnd = k('2024-01-15 10:30');
const meetingDuration = meetingStart.duration(meetingEnd);

console.log(`Meeting duration: ${meetingDuration.humanize()}`);

console.log('\n=== End of Advanced Examples ===');