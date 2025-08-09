#!/usr/bin/env node

import kairos from '@oxog/kairos';

// Import all plugins
import businessPlugin from '@oxog/kairos/plugins/business/workday.js';
import fiscalPlugin from '@oxog/kairos/plugins/business/fiscal.js';
import holidayEngine from '@oxog/kairos/plugins/holiday/engine.js';
import fixedCalculator from '@oxog/kairos/plugins/holiday/calculators/fixed.js';
import nthWeekdayCalculator from '@oxog/kairos/plugins/holiday/calculators/nth-weekday.js';
import easterCalculator from '@oxog/kairos/plugins/holiday/calculators/easter.js';
import relativeCalculator from '@oxog/kairos/plugins/holiday/calculators/relative.js';
import durationPlugin from '@oxog/kairos/plugins/duration/duration.js';
import rangePlugin from '@oxog/kairos/plugins/range/range.js';
import relativeTimePlugin from '@oxog/kairos/plugins/relative/relative-time.js';
import calendarPlugin from '@oxog/kairos/plugins/calendar/calendar.js';
import localeUS from '@oxog/kairos/plugins/locale/en-US/index.js';

// Initialize all plugins
kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  relativeCalculator,
  businessPlugin,
  fiscalPlugin,
  durationPlugin,
  rangePlugin,
  relativeTimePlugin,
  calendarPlugin,
  localeUS
]);

console.log('🗓️  Kairos Node.js Examples\n');
console.log('='.repeat(50));

// 1. Basic Date Operations
console.log('\n📅 Basic Date Operations:');
const today = kairos();
const birthday = kairos('1990-05-15');
const futureDate = kairos('2025-12-31');

console.log(`Today: ${today.format('dddd, MMMM Do, YYYY')}`);
console.log(`Birthday: ${birthday.format('dddd, MMMM Do, YYYY')}`);
console.log(`Future: ${futureDate.format('dddd, MMMM Do, YYYY')}`);

// Age calculation
const ageYears = today.year() - birthday.year();
const ageDuration = birthday.duration(today);
console.log(`Age: ${ageYears} years (${Math.abs(ageDuration.asDays()).toFixed(0)} days)`);

// 2. Holiday Detection and Information
console.log('\n🎉 Holiday Detection:');
const holidays = [
  kairos('2024-01-01'), // New Year
  kairos('2024-07-04'), // Independence Day
  kairos('2024-12-25'), // Christmas
  kairos('2024-01-15'), // MLK Day
];

holidays.forEach(holiday => {
  const isHoliday = holiday.isHoliday();
  const holidayInfo = holiday.getHoliday();
  console.log(`${holiday.format('YYYY-MM-DD')}: ${isHoliday ? `${holidayInfo?.name}` : 'Not a holiday'}`);
});

// 3. Business Day Calculations
console.log('\n💼 Business Day Analysis:');
const businessDates = [
  kairos('2024-01-12'), // Friday
  kairos('2024-01-13'), // Saturday
  kairos('2024-01-15'), // MLK Day
  kairos('2024-01-16'), // Tuesday
];

businessDates.forEach(date => {
  const isBusinessDay = date.isBusinessDay();
  const type = isBusinessDay ? 'Business Day' : 
               date.isWeekend() ? 'Weekend' : 'Holiday';
  const next = date.nextBusinessDay();
  
  console.log(`${date.format('YYYY-MM-DD dddd')}: ${type}`);
  console.log(`  Next business day: ${next.format('YYYY-MM-DD dddd')}`);
});

// 4. Advanced Business Calculations
console.log('\n💰 Financial Calculations:');
const invoiceDate = kairos('2024-01-15');
const terms30 = invoiceDate.addBusinessDays(30);
const terms45 = invoiceDate.addBusinessDays(45);

console.log(`Invoice Date: ${invoiceDate.format('YYYY-MM-DD dddd')}`);
console.log(`Net 30 (business days): ${terms30.format('YYYY-MM-DD dddd')}`);
console.log(`Net 45 (business days): ${terms45.format('YYYY-MM-DD dddd')}`);

// Settlement dates
const tradeDate = kairos('2024-06-14'); // Friday
console.log(`Trade Date: ${tradeDate.format('YYYY-MM-DD dddd')}`);
console.log(`T+1 Settlement: ${tradeDate.settlementDate(1).format('YYYY-MM-DD dddd')}`);
console.log(`T+3 Settlement: ${tradeDate.settlementDate(3).format('YYYY-MM-DD dddd')}`);

// 5. Duration Examples
console.log('\n⏱️  Duration Operations:');
const project = {
  start: kairos('2024-01-01'),
  end: kairos('2024-06-30')
};

const projectDuration = project.start.duration(project.end);
console.log(`Project Duration: ${projectDuration.humanize()}`);
console.log(`Project Days: ${Math.abs(projectDuration.asDays()).toFixed(0)}`);
console.log(`Project Business Days: ${project.start.businessDaysBetween(project.end)}`);

// ISO 8601 durations
const isoDurations = [
  'P1Y2M3DT4H5M6S',
  'P1W',
  'PT8H',
  'P90D'
];

console.log('\nISO 8601 Duration Parsing:');
isoDurations.forEach(iso => {
  const duration = kairos.duration(iso);
  console.log(`${iso}: ${duration.humanize()}`);
});

// 6. Date Ranges
console.log('\n📊 Date Range Operations:');
const yearRange = kairos('2024-01-01').range(kairos('2024-12-31'));
const businessDays = yearRange.businessDays();
const weekends = yearRange.weekends();

console.log(`Year 2024 total days: ${yearRange.count()}`);
console.log(`Business days: ${businessDays.length}`);
console.log(`Weekend days: ${weekends.length}`);
console.log(`Holidays: ${yearRange.count() - businessDays.length - weekends.length}`);

// Monthly breakdown
console.log('\nMonthly Business Day Breakdown:');
for (let month = 1; month <= 12; month++) {
  const businessDaysInMonth = kairos.getBusinessDaysInMonth(2024, month);
  const monthName = kairos(`2024-${month.toString().padStart(2, '0')}-01`).format('MMMM');
  console.log(`${monthName}: ${businessDaysInMonth.length} business days`);
}

// 7. Calendar Calculations
console.log('\n📅 Calendar Calculations:');
const sampleDate = kairos('2024-06-15');

console.log(`Date: ${sampleDate.format('YYYY-MM-DD dddd')}`);
console.log(`Quarter: Q${sampleDate.quarter()}`);
console.log(`Week of Year: ${sampleDate.weekOfYear()}`);
console.log(`Day of Year: ${sampleDate.dayOfYear()}`);
console.log(`Days in Month: ${sampleDate.endOf('month').date()}`);
console.log(`Days in Year: ${sampleDate.endOf('year').dayOfYear()}`);

// 8. Relative Time
console.log('\n🕐 Relative Time Examples:');
const relativeDates = [
  kairos().subtract(2, 'hours'),
  kairos().subtract(1, 'day'),
  kairos().subtract(1, 'week'),
  kairos().add(3, 'days'),
  kairos().add(2, 'months')
];

relativeDates.forEach(date => {
  console.log(`${date.format('YYYY-MM-DD HH:mm')}: ${date.fromNow()}`);
});

// 9. Performance Demo
console.log('\n⚡ Performance Demo:');
console.time('1000 business day calculations');
for (let i = 0; i < 1000; i++) {
  const randomDate = kairos().add(Math.floor(Math.random() * 365), 'days');
  randomDate.isBusinessDay();
  randomDate.nextBusinessDay();
}
console.timeEnd('1000 business day calculations');

console.time('10000 date operations');
for (let i = 0; i < 10000; i++) {
  kairos().add(i, 'days').format('YYYY-MM-DD');
}
console.timeEnd('10000 date operations');

// 10. Error Handling Demo
console.log('\n⚠️  Error Handling:');
try {
  const invalidDate = kairos('invalid-date-string');
  console.log('Invalid date handled gracefully:', invalidDate.format());
} catch (error) {
  console.log('Error caught:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('✅ All examples completed successfully!');
console.log('\nRun specific examples:');
console.log('  npm run financial  - Financial calculations');
console.log('  npm run payroll     - Payroll system demo');
console.log('  npm run scheduler   - Task scheduler demo');
console.log('  npm run server      - Web API demo');
console.log('  npm run cli         - Interactive CLI demo');

export default kairos;