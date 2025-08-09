/**
 * Basic Date Formatting Examples
 * Demonstrating core formatting functionality
 */

import kairos from '../dist/index.js';

console.log('=== BASIC FORMATTING ===\n');

// Standard date formatting
console.log('[ Standard Formats ]');
const sampleDate = kairos('2024-06-15 14:30:00');

console.log('Default format:', sampleDate.format());
console.log('ISO format:', sampleDate.format('YYYY-MM-DD'));
console.log('US format:', sampleDate.format('MM/DD/YYYY'));
console.log('European format:', sampleDate.format('DD.MM.YYYY'));
console.log('Full datetime:', sampleDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('12-hour format:', sampleDate.format('MM/DD/YYYY h:mm A'));

// Time formatting
console.log('\n[ Time Formats ]');
console.log('24-hour time:', sampleDate.format('HH:mm'));
console.log('12-hour time:', sampleDate.format('h:mm A'));
console.log('With seconds:', sampleDate.format('HH:mm:ss'));
console.log('With milliseconds:', sampleDate.format('HH:mm:ss.SSS'));

// Month and day names (using default formatting)
console.log('\n[ Month and Day Names ]');
console.log('Month number:', sampleDate.format('MM'));
console.log('Day of month:', sampleDate.format('DD'));
console.log('Year:', sampleDate.format('YYYY'));
console.log('Quarter:', sampleDate.format('[Q]Q'));

// Custom formats
console.log('\n[ Custom Formats ]');
console.log('Log timestamp:', sampleDate.format('[LOG] YYYY-MM-DD HH:mm:ss'));
console.log('Filename format:', sampleDate.format('backup_YYYYMMDD_HHmmss'));
console.log('Human readable:', sampleDate.format('YYYY-MM-DD [at] HH:mm'));

// Different dates showcase
console.log('\n[ Multiple Dates ]');
const dates = [
  kairos('2024-01-01'),
  kairos('2024-03-15'),
  kairos('2024-07-04'),
  kairos('2024-12-31')
];

dates.forEach(date => {
  console.log(`${date.format('YYYY-MM-DD')} (${date.format('dddd')})`);
});

// UTC vs Local formatting
console.log('\n[ UTC vs Local ]');
const utcDate = kairos.utc('2024-06-15 12:00:00');
const localDate = kairos('2024-06-15 12:00:00');

console.log('UTC date:', utcDate.format('YYYY-MM-DD HH:mm [UTC]'));
console.log('Local date:', localDate.format('YYYY-MM-DD HH:mm [Local]'));

console.log('\n✅ Basic formatting examples completed successfully');