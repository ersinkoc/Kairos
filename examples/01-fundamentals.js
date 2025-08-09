/**
 * Kairos Fundamentals
 * Core concepts and basic operations
 */

import kairos from '../dist/index.js';

console.log('=== KAIROS FUNDAMENTALS ===\n');

// Instance creation methods
console.log('[ Instance Creation ]');
const current = kairos();
const fromString = kairos('2024-07-20 15:45:30');
const fromMillis = kairos(Date.now());
const fromComponents = kairos({ year: 2024, month: 7, day: 20, hour: 15, minute: 45 });

console.log('Current time:', current.format('YYYY-MM-DD HH:mm:ss'));
console.log('From string:', fromString.format('YYYY-MM-DD HH:mm:ss'));
console.log('From milliseconds:', fromMillis.format('YYYY-MM-DD HH:mm:ss'));
console.log('From components:', fromComponents.format('YYYY-MM-DD HH:mm:ss'));

// Accessing date parts
console.log('\n[ Accessing Components ]');
const moment = kairos('2024-08-25 18:30:45.123');
console.log('Full date:', moment.format('YYYY-MM-DD HH:mm:ss.SSS'));
console.log('Components:');
console.log('  Year:', moment.year());
console.log('  Month (1-12):', moment.month());
console.log('  Day:', moment.date());
console.log('  Weekday (0=Sun):', moment.day());
console.log('  Hour:', moment.hour());
console.log('  Minute:', moment.minute());
console.log('  Second:', moment.second());
console.log('  Millisecond:', moment.millisecond());

// Modifying dates
console.log('\n[ Modifying Dates ]');
const initial = kairos('2024-03-10 12:00:00');
console.log('Initial:', initial.format('YYYY-MM-DD HH:mm:ss'));

const modified = initial
  .year(2025)
  .month(6)
  .date(15)
  .hour(18)
  .minute(30);

console.log('Modified:', modified.format('YYYY-MM-DD HH:mm:ss'));
console.log('Original unchanged:', initial.format('YYYY-MM-DD HH:mm:ss'));

// Arithmetic operations
console.log('\n[ Arithmetic ]');
const start = kairos('2024-01-01');
console.log('Start:', start.format('YYYY-MM-DD'));
console.log('Plus 45 days:', start.add(45, 'days').format('YYYY-MM-DD'));
console.log('Plus 3 months:', start.add(3, 'months').format('YYYY-MM-DD'));
console.log('Minus 2 weeks:', start.subtract(2, 'weeks').format('YYYY-MM-DD'));
console.log('Plus 1.5 years:', start.add(1.5, 'years').format('YYYY-MM-DD'));

// Method chaining
console.log('\n[ Method Chaining ]');
const result = kairos('2024-01-01')
  .add(6, 'months')
  .subtract(1, 'week')
  .add(3, 'days')
  .hour(14)
  .minute(30);

console.log('Chained result:', result.format('YYYY-MM-DD HH:mm'));

// Clone for safety
console.log('\n[ Cloning ]');
const source = kairos('2024-05-15');
const copy = source.clone();
const modified2 = copy.add(10, 'days');

console.log('Source:', source.format('YYYY-MM-DD'));
console.log('Copy after modification:', modified2.format('YYYY-MM-DD'));
console.log('Source still unchanged:', source.format('YYYY-MM-DD'));

// Working with invalid dates
console.log('\n[ Invalid Date Handling ]');
const valid = kairos('2024-01-15');
const invalid1 = kairos('invalid string');
const invalid2 = kairos('2024-13-45'); // Invalid month and day

console.log('Valid date:', valid.format('YYYY-MM-DD'), '- isValid:', valid.isValid());
console.log('Invalid string: isValid:', invalid1.isValid());
console.log('Invalid date: isValid:', invalid2.isValid());

// Native conversions
console.log('\n[ Native Conversions ]');
const kairosDate = kairos('2024-06-15 14:30:00');
console.log('ISO String:', kairosDate.toISOString());
console.log('Unix timestamp (ms):', kairosDate.valueOf());
console.log('JavaScript Date:', kairosDate.toDate());
console.log('Unix seconds:', Math.floor(kairosDate.valueOf() / 1000));