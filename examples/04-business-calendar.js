/**
 * Business Days and Calendar Operations
 * Working with business days, holidays, and calendar calculations
 */

const kairos = require('../dist/index.js');
const businessPlugin = require('../dist/plugins/business/workday').default;
const calendarPlugin = require('../dist/plugins/calendar/calendar').default;
const holidayPlugin = require('../dist/plugins/holiday/holiday').default;

// Load plugins
kairos.use(businessPlugin);
kairos.use(calendarPlugin);
kairos.use(holidayPlugin);

console.log('=== BUSINESS & CALENDAR ===\n');

// Business day checks
console.log('[ Business Day Checks ]');
const weekday = kairos('2024-06-14'); // Friday
const weekend = kairos('2024-06-15'); // Saturday
const holiday = kairos('2024-12-25'); // Christmas

console.log('Friday June 14:', weekday.format('YYYY-MM-DD'), '- Business day:', weekday.isBusinessDay());
console.log('Saturday June 15:', weekend.format('YYYY-MM-DD'), '- Business day:', weekend.isBusinessDay());
console.log('Christmas:', holiday.format('YYYY-MM-DD'), '- Business day:', holiday.isBusinessDay());

// Next/Previous business days
console.log('\n[ Business Day Navigation ]');
const startDate = kairos('2024-06-14'); // Friday
console.log('Start (Friday):', startDate.format('YYYY-MM-DD'));
console.log('Next business day:', startDate.nextBusinessDay().format('YYYY-MM-DD'));
console.log('Previous business day:', startDate.previousBusinessDay().format('YYYY-MM-DD'));

const beforeHoliday = kairos('2024-12-24');
console.log('\nDec 24:', beforeHoliday.format('YYYY-MM-DD'));
console.log('Next business day:', beforeHoliday.nextBusinessDay().format('YYYY-MM-DD'));

// Business day arithmetic
console.log('\n[ Business Day Arithmetic ]');
const projectStart = kairos('2024-06-10'); // Monday
console.log('Project start:', projectStart.format('YYYY-MM-DD dddd'));
console.log('Plus 5 business days:', projectStart.addBusinessDays(5).format('YYYY-MM-DD dddd'));
console.log('Plus 10 business days:', projectStart.addBusinessDays(10).format('YYYY-MM-DD dddd'));
console.log('Minus 3 business days:', projectStart.subtractBusinessDays(3).format('YYYY-MM-DD dddd'));

// Business days between dates
console.log('\n[ Business Days Between ]');
const contractStart = kairos('2024-06-01');
const contractEnd = kairos('2024-06-30');
console.log('Contract period:', contractStart.format('MMM D'), 'to', contractEnd.format('MMM D, YYYY'));
console.log('Calendar days:', contractStart.diff(contractEnd, 'days'));
console.log('Business days:', contractStart.businessDaysBetween(contractEnd));

// Holiday detection
console.log('\n[ Holiday Detection ]');
const dates = [
  kairos('2024-01-01'), // New Year
  kairos('2024-07-04'), // Independence Day
  kairos('2024-11-28'), // Thanksgiving
  kairos('2024-12-25'), // Christmas
  kairos('2024-06-15')  // Regular day
];

dates.forEach(date => {
  const isHoliday = date.isHoliday();
  const holidayInfo = date.getHoliday();
  console.log(
    date.format('MMM DD, YYYY'),
    '- Holiday:', isHoliday,
    isHoliday && holidayInfo ? `(${holidayInfo.name})` : ''
  );
});

// Calendar information
console.log('\n[ Calendar Information ]');
const calDate = kairos('2024-06-15');
console.log('Date:', calDate.format('YYYY-MM-DD'));
console.log('Quarter:', calDate.quarter());
console.log('Week of year:', calDate.week());
console.log('Week of month:', calDate.weekOfMonth());
console.log('Day of year:', calDate.dayOfYear());
console.log('Days in month:', calDate.daysInMonth());
console.log('Days in year:', calDate.daysInYear());
console.log('Is leap year:', calDate.isLeapYear());

// Week calculations
console.log('\n[ Week Calculations ]');
const midWeek = kairos('2024-06-12'); // Wednesday
console.log('Wednesday June 12:', midWeek.format('YYYY-MM-DD'));
console.log('Start of week:', midWeek.startOf('week').format('YYYY-MM-DD dddd'));
console.log('End of week:', midWeek.endOf('week').format('YYYY-MM-DD dddd'));
console.log('ISO week:', midWeek.isoWeek());
console.log('Week year:', midWeek.weekYear());

// Quarter operations
console.log('\n[ Quarter Operations ]');
const q2Date = kairos('2024-05-15');
console.log('Date:', q2Date.format('YYYY-MM-DD'));
console.log('Quarter:', q2Date.quarter());
console.log('Start of quarter:', q2Date.startOf('quarter').format('YYYY-MM-DD'));
console.log('End of quarter:', q2Date.endOf('quarter').format('YYYY-MM-DD'));

// Fiscal year calculations
console.log('\n[ Fiscal Year ]');
const fiscalDate = kairos('2024-02-15');
const fiscalConfig = { startMonth: 4 }; // April start
console.log('Date:', fiscalDate.format('YYYY-MM-DD'));
console.log('Calendar year:', fiscalDate.year());
console.log('Fiscal year (Apr start):', fiscalDate.fiscalYear(fiscalConfig));
console.log('Fiscal quarter:', fiscalDate.fiscalQuarter(fiscalConfig));

// Working hours (custom business logic)
console.log('\n[ Working Hours ]');
const morningTime = kairos('2024-06-14 09:30:00');
const lunchTime = kairos('2024-06-14 12:30:00');
const eveningTime = kairos('2024-06-14 17:30:00');
const nightTime = kairos('2024-06-14 22:00:00');

const isWorkingHour = (date) => {
  const hour = date.hour();
  return hour >= 9 && hour < 17 && date.isBusinessDay();
};

console.log('9:30 AM:', morningTime.format('HH:mm'), '- Working hour:', isWorkingHour(morningTime));
console.log('12:30 PM:', lunchTime.format('HH:mm'), '- Working hour:', isWorkingHour(lunchTime));
console.log('5:30 PM:', eveningTime.format('HH:mm'), '- Working hour:', isWorkingHour(eveningTime));
console.log('10:00 PM:', nightTime.format('HH:mm'), '- Working hour:', isWorkingHour(nightTime));

// Month boundaries
console.log('\n[ Month Information ]');
const monthDate = kairos('2024-02-15'); // February in leap year
console.log('Date:', monthDate.format('MMMM YYYY'));
console.log('Days in month:', monthDate.daysInMonth());
console.log('First day:', monthDate.startOf('month').format('YYYY-MM-DD dddd'));
console.log('Last day:', monthDate.endOf('month').format('YYYY-MM-DD dddd'));
console.log('Is leap year:', monthDate.isLeapYear());