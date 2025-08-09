/**
 * Basic Timezone and Date Operations
 * Working with dates and times
 */

import kairos from '../dist/index.js';

console.log('=== BASIC DATE OPERATIONS ===\n');

// Basic date creation
console.log('[ Date Creation ]');
const now = kairos();
const utcNow = kairos.utc();

console.log('Current local time:', now.format('YYYY-MM-DD HH:mm:ss'));
console.log('Current UTC time:', utcNow.format('YYYY-MM-DD HH:mm:ss'));
console.log('System timezone offset:', new Date().getTimezoneOffset(), 'minutes');

// Date parsing and formatting
console.log('\n[ Date Parsing ]');
const specificDate = kairos('2024-06-15 14:30:00');
const utcSpecific = kairos.utc('2024-06-15 14:30:00');

console.log('Parsed local date:', specificDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('Parsed UTC date:', utcSpecific.format('YYYY-MM-DD HH:mm:ss'));

// Date arithmetic
console.log('\n[ Date Arithmetic ]');
const baseDate = kairos('2024-06-15 12:00:00');
console.log('Base date:', baseDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('Plus 5 hours:', baseDate.clone().add(5, 'hours').format('YYYY-MM-DD HH:mm:ss'));
console.log('Minus 3 hours:', baseDate.clone().subtract(3, 'hours').format('YYYY-MM-DD HH:mm:ss'));

// Different time zones (manual calculation)
console.log('\n[ Time Zone Examples ]');
const meetingTime = kairos.utc('2024-06-15 14:00:00');
console.log('Meeting time (UTC):', meetingTime.format('HH:mm'));

const timezones = [
  { name: 'New York', offset: -5 },
  { name: 'London', offset: 1 },
  { name: 'Tokyo', offset: 9 }
];

timezones.forEach(tz => {
  const localTime = meetingTime.clone().add(tz.offset, 'hours');
  console.log(`${tz.name}: ${localTime.format('HH:mm')}`);
});

// ISO string formatting
console.log('\n[ ISO String Formatting ]');
const isoDate = kairos('2024-06-15 14:30:00');
console.log('Date object:', isoDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('ISO string:', isoDate.toISOString());
console.log('Unix timestamp:', isoDate.valueOf());

// Date comparisons
console.log('\n[ Date Comparisons ]');
const date1 = kairos('2024-06-15 10:00:00');
const date2 = kairos('2024-06-15 15:00:00');

console.log('Date 1:', date1.format('HH:mm'));
console.log('Date 2:', date2.format('HH:mm'));
console.log('Date 1 is before Date 2:', date1.isBefore(date2));
console.log('Date 2 is after Date 1:', date2.isAfter(date1));
console.log('Are they the same?', date1.isSame(date2));

// Start/End of periods
console.log('\n[ Period Boundaries ]');
const sampleDate = kairos('2024-06-15 14:30:45');
console.log('Original:', sampleDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('Start of day:', sampleDate.startOf('day').format('YYYY-MM-DD HH:mm:ss'));
console.log('End of day:', sampleDate.endOf('day').format('YYYY-MM-DD HH:mm:ss'));
console.log('Start of month:', sampleDate.startOf('month').format('YYYY-MM-DD'));
console.log('End of month:', sampleDate.endOf('month').format('YYYY-MM-DD'));

// Validation
console.log('\n[ Date Validation ]');
const validDate = kairos('2024-06-15');
const invalidDate = kairos('invalid');

console.log('Valid date "2024-06-15":', validDate.isValid());
console.log('Invalid date "invalid":', invalidDate.isValid());

console.log('\n✅ Basic date operations completed successfully');