// Business calendar examples for Kairos
const kairos = require('../dist/index.js').default;
const { 
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  localeUS,
  businessWorkday,
  businessFiscal
} = require('../dist/index.js');

// Load plugins
kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator,
  localeUS,
  businessWorkday,
  businessFiscal
]);

console.log('=== Kairos Business Calendar Examples ===\n');

// 1. Basic business day operations
console.log('1. Basic Business Day Operations:');
const projectStart = kairos('2024-01-15'); // Monday
console.log(`Project start: ${projectStart.format('YYYY-MM-DD dddd')}`);
console.log(`Is business day: ${projectStart.isBusinessDay()}`);

const milestone1 = projectStart.addBusinessDays(10);
console.log(`10 business days later: ${milestone1.format('YYYY-MM-DD dddd')}`);

const milestone2 = projectStart.addBusinessDays(20);
console.log(`20 business days later: ${milestone2.format('YYYY-MM-DD dddd')}`);

const totalBusinessDays = projectStart.businessDaysBetween(milestone2);
console.log(`Business days between start and milestone 2: ${totalBusinessDays}`);

// 2. Settlement date calculations
console.log('\n2. Settlement Date Calculations:');
const tradeDate = kairos('2024-07-03'); // Day before July 4th
console.log(`Trade date: ${tradeDate.format('YYYY-MM-DD dddd')}`);

const t1Settlement = tradeDate.settlementDate(1);
const t2Settlement = tradeDate.settlementDate(2);
const t3Settlement = tradeDate.settlementDate(3);

console.log(`T+1 settlement: ${t1Settlement.format('YYYY-MM-DD dddd')}`);
console.log(`T+2 settlement: ${t2Settlement.format('YYYY-MM-DD dddd')}`);
console.log(`T+3 settlement: ${t3Settlement.format('YYYY-MM-DD dddd')}`);

// 3. Monthly business day analysis
console.log('\n3. Monthly Business Day Analysis:');
const month = 1; // January
const year = 2024;

const businessDaysInMonth = kairos.getBusinessDaysInMonth(year, month);
console.log(`January ${year} has ${businessDaysInMonth.length} business days`);

// First and last business days
const firstBusinessDay = kairos.getNthBusinessDay(year, month, 1);
const lastBusinessDay = kairos.getLastBusinessDay(year, month);

console.log(`First business day: ${firstBusinessDay.format('YYYY-MM-DD dddd')}`);
console.log(`Last business day: ${lastBusinessDay.format('YYYY-MM-DD dddd')}`);

// Specific business days
const fifthBusinessDay = kairos.getNthBusinessDay(year, month, 5);
const tenthBusinessDay = kairos.getNthBusinessDay(year, month, 10);

console.log(`5th business day: ${fifthBusinessDay.format('YYYY-MM-DD dddd')}`);
console.log(`10th business day: ${tenthBusinessDay.format('YYYY-MM-DD dddd')}`);

// 4. Working hours validation
console.log('\n4. Working Hours Validation:');
const meetings = [
  kairos('2024-01-15 09:00'), // Monday 9 AM
  kairos('2024-01-15 14:30'), // Monday 2:30 PM
  kairos('2024-01-15 18:00'), // Monday 6 PM
  kairos('2024-01-13 14:30'), // Saturday 2:30 PM
  kairos('2024-01-01 10:00'), // New Year's Day 10 AM
];

meetings.forEach(meeting => {
  const isWorkingHour = meeting.isWorkingHour();
  const isBusinessDay = meeting.isBusinessDay();
  const isHoliday = meeting.isHoliday();
  
  console.log(`${meeting.format('YYYY-MM-DD dddd HH:mm')}:`);
  console.log(`  Working hour: ${isWorkingHour}`);
  console.log(`  Business day: ${isBusinessDay}`);
  console.log(`  Holiday: ${isHoliday}`);
  
  if (isHoliday) {
    const holidayInfo = meeting.getHolidayInfo();
    console.log(`  Holiday: ${holidayInfo.name}`);
  }
});

// 5. Fiscal year calculations
console.log('\n5. Fiscal Year Calculations:');

// US fiscal year (Oct 1 - Sep 30)
const fiscalDate = kairos('2024-06-15');
const usFiscalYear = fiscalDate.fiscalYear({ start: 10 });
const usFiscalQuarter = fiscalDate.fiscalQuarter({ start: 10 });

console.log(`Date: ${fiscalDate.format('YYYY-MM-DD')}`);
console.log(`US Fiscal Year: ${usFiscalYear}`);
console.log(`US Fiscal Quarter: Q${usFiscalQuarter}`);

// Get fiscal year info
const fiscalYearInfo = kairos.getFiscalYearInfo(2024, { start: 10 });
console.log(`\nFiscal Year 2024 (Oct start):`);
console.log(`  Start: ${fiscalYearInfo.start.format('YYYY-MM-DD')}`);
console.log(`  End: ${fiscalYearInfo.end.format('YYYY-MM-DD')}`);
console.log(`  Total days: ${fiscalYearInfo.days}`);

// Different fiscal year configurations
console.log('\n6. Different Fiscal Year Configurations:');
const testDate = kairos('2024-06-15');

const fiscalConfigs = [
  { name: 'US Government', config: { start: 10 } },
  { name: 'UK Government', config: { start: 4 } },
  { name: 'Australia', config: { start: 7 } },
  { name: 'Calendar Year', config: { start: 1 } }
];

fiscalConfigs.forEach(({ name, config }) => {
  const fy = testDate.fiscalYear(config);
  const fq = testDate.fiscalQuarter(config);
  console.log(`${name}: FY${fy} Q${fq}`);
});

// 7. Business day ranges
console.log('\n7. Business Day Ranges:');
const rangeStart = kairos('2024-01-01');
const rangeEnd = kairos('2024-01-31');

const businessDayRange = kairos.getBusinessDaysInRange(rangeStart, rangeEnd);
console.log(`Business days in January 2024: ${businessDayRange.length}`);

// Show first and last few business days
console.log('First 5 business days:');
businessDayRange.slice(0, 5).forEach(day => {
  console.log(`  ${day.format('YYYY-MM-DD dddd')}`);
});

console.log('Last 5 business days:');
businessDayRange.slice(-5).forEach(day => {
  console.log(`  ${day.format('YYYY-MM-DD dddd')}`);
});

// 8. Year-end business calculations
console.log('\n8. Year-End Business Calculations:');
const yearEnd = kairos('2024-12-31');
const yearStart = kairos('2024-01-01');

const totalBusinessDays2024 = kairos.businessDaysInYear(2024);
console.log(`Total business days in 2024: ${totalBusinessDays2024}`);

// Check if year-end is a business day
console.log(`Dec 31, 2024 is business day: ${yearEnd.isBusinessDay()}`);

// Last business day of the year
const lastBusinessDay2024 = kairos.getLastBusinessDay(2024, 12);
console.log(`Last business day of 2024: ${lastBusinessDay2024.format('YYYY-MM-DD dddd')}`);

// First business day of next year
const firstBusinessDay2025 = kairos.getNthBusinessDay(2025, 1, 1);
console.log(`First business day of 2025: ${firstBusinessDay2025.format('YYYY-MM-DD dddd')}`);

// 9. Custom business day configuration
console.log('\n9. Custom Business Day Configuration:');
const customDate = kairos('2024-01-12'); // Friday

// Default configuration
console.log(`Default config - Friday is business day: ${customDate.isBusinessDay()}`);

// Custom configuration (Middle East - Friday/Saturday weekend)
const middleEastConfig = {
  weekends: [5, 6] // Friday, Saturday
};

console.log(`Middle East config - Friday is business day: ${customDate.isBusinessDay(middleEastConfig)}`);

// 10. Project timeline with business days
console.log('\n10. Project Timeline with Business Days:');
const projectPhases = [
  { name: 'Planning', duration: 5 },
  { name: 'Development', duration: 20 },
  { name: 'Testing', duration: 10 },
  { name: 'Deployment', duration: 3 }
];

let currentDate = kairos('2024-01-15'); // Project start
console.log(`Project Start: ${currentDate.format('YYYY-MM-DD dddd')}`);

projectPhases.forEach(phase => {
  const phaseStart = currentDate.clone();
  currentDate = currentDate.addBusinessDays(phase.duration);
  
  console.log(`${phase.name}: ${phaseStart.format('MM-DD')} to ${currentDate.format('MM-DD')} (${phase.duration} business days)`);
});

console.log(`Project End: ${currentDate.format('YYYY-MM-DD dddd')}`);

const totalProjectDays = kairos('2024-01-15').businessDaysBetween(currentDate);
console.log(`Total project duration: ${totalProjectDays} business days`);

console.log('\n=== End of Business Calendar Examples ===');