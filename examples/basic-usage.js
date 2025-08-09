// Basic usage examples for Kairos
const kairos = require('../dist/index.js').default;
const { 
  holidayEngine, 
  localeUS, 
  businessWorkday,
  fixedCalculator,
  nthWeekdayCalculator
} = require('../dist/index.js');

// Load plugins
kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  localeUS,
  businessWorkday
]);

console.log('=== Kairos Basic Usage Examples ===\n');

// 1. Basic date operations
console.log('1. Basic Date Operations:');
const today = kairos();
const christmas = kairos('2024-12-25');
const newYear = kairos('2025-01-01');

console.log(`Today: ${today.format('YYYY-MM-DD dddd')}`);
console.log(`Christmas: ${christmas.format('YYYY-MM-DD dddd')}`);
console.log(`New Year: ${newYear.format('YYYY-MM-DD dddd')}`);

// 2. Holiday detection
console.log('\n2. Holiday Detection:');
console.log(`Is today a holiday? ${today.isHoliday()}`);
console.log(`Is Christmas a holiday? ${christmas.isHoliday()}`);
console.log(`Is New Year a holiday? ${newYear.isHoliday()}`);

const christmasInfo = christmas.getHolidayInfo();
if (christmasInfo) {
  console.log(`Christmas holiday info: ${christmasInfo.name}`);
}

// 3. Next/Previous holidays
console.log('\n3. Next/Previous Holidays:');
const nextHoliday = today.nextHoliday();
if (nextHoliday) {
  const nextHolidayInfo = nextHoliday.getHolidayInfo();
  console.log(`Next holiday: ${nextHolidayInfo.name} on ${nextHoliday.format('YYYY-MM-DD')}`);
}

// 4. Business day calculations
console.log('\n4. Business Day Calculations:');
const monday = kairos('2024-01-08'); // Monday
const friday = kairos('2024-01-12'); // Friday

console.log(`Is Monday a business day? ${monday.isBusinessDay()}`);
console.log(`Is Friday a business day? ${friday.isBusinessDay()}`);

const nextBusinessDay = friday.nextBusinessDay();
console.log(`Next business day after Friday: ${nextBusinessDay.format('YYYY-MM-DD dddd')}`);

// 5. Adding business days
console.log('\n5. Adding Business Days:');
const invoiceDate = kairos('2024-01-15');
const dueDate = invoiceDate.addBusinessDays(30);
console.log(`Invoice date: ${invoiceDate.format('YYYY-MM-DD')}`);
console.log(`Due date (30 business days later): ${dueDate.format('YYYY-MM-DD')}`);

// 6. Business days between dates
console.log('\n6. Business Days Between Dates:');
const start = kairos('2024-01-01');
const end = kairos('2024-01-31');
const businessDays = start.businessDaysBetween(end);
console.log(`Business days between ${start.format('MMM D')} and ${end.format('MMM D')}: ${businessDays}`);

// 7. Year holidays
console.log('\n7. All Holidays in 2024:');
const holidays2024 = kairos.getYearHolidays(2024, kairos().getHolidays());
console.log('First 5 holidays in 2024:');
holidays2024.slice(0, 5).forEach(holiday => {
  console.log(`  ${holiday.date.toISOString().split('T')[0]}: ${holiday.name}`);
});

// 8. Date arithmetic
console.log('\n8. Date Arithmetic:');
const baseDate = kairos('2024-01-01');
console.log(`Base date: ${baseDate.format('YYYY-MM-DD')}`);
console.log(`Add 1 year: ${baseDate.add(1, 'year').format('YYYY-MM-DD')}`);
console.log(`Add 6 months: ${baseDate.add(6, 'months').format('YYYY-MM-DD')}`);
console.log(`Add 15 days: ${baseDate.add(15, 'days').format('YYYY-MM-DD')}`);

// 9. Date comparison
console.log('\n9. Date Comparison:');
const date1 = kairos('2024-01-01');
const date2 = kairos('2024-01-02');
console.log(`${date1.format('YYYY-MM-DD')} is before ${date2.format('YYYY-MM-DD')}: ${date1.isBefore(date2)}`);
console.log(`${date1.format('YYYY-MM-DD')} is after ${date2.format('YYYY-MM-DD')}: ${date1.isAfter(date2)}`);
console.log(`${date1.format('YYYY-MM-DD')} is same as ${date1.format('YYYY-MM-DD')}: ${date1.isSame(date1)}`);

// 10. Working hours
console.log('\n10. Working Hours:');
const workingHour = kairos('2024-01-08 14:30'); // Monday 2:30 PM
const afterHours = kairos('2024-01-08 19:30'); // Monday 7:30 PM
const weekend = kairos('2024-01-06 14:30'); // Saturday 2:30 PM

console.log(`Monday 2:30 PM is working hour: ${workingHour.isWorkingHour()}`);
console.log(`Monday 7:30 PM is working hour: ${afterHours.isWorkingHour()}`);
console.log(`Saturday 2:30 PM is working hour: ${weekend.isWorkingHour()}`);

console.log('\n=== End of Examples ===');