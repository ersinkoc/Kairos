/**
 * Comparison and Query Operations
 * Checking relationships between dates
 */

import kairos from '../dist/index.js';

console.log('=== COMPARISON & QUERIES ===\n');

// Basic comparisons
console.log('[ Basic Comparisons ]');
const early = kairos('2024-01-15 10:00:00');
const late = kairos('2024-08-20 15:30:00');
const same1 = kairos('2024-05-10 12:00:00');
const same2 = kairos('2024-05-10 12:00:00');

console.log('Early:', early.format('YYYY-MM-DD HH:mm'));
console.log('Late:', late.format('YYYY-MM-DD HH:mm'));
console.log('Early < Late:', early.isBefore(late));
console.log('Late > Early:', late.isAfter(early));
console.log('Same dates equal:', same1.isSame(same2));

// Granular comparisons
console.log('\n[ Granular Comparisons ]');
const date1 = kairos('2024-05-15 10:30:00');
const date2 = kairos('2024-05-15 16:45:00');

console.log('Date1:', date1.format('YYYY-MM-DD HH:mm'));
console.log('Date2:', date2.format('YYYY-MM-DD HH:mm'));
console.log('Same millisecond:', date1.isSame(date2));
console.log('Same day:', date1.isSame(date2, 'day'));
console.log('Same month:', date1.isSame(date2, 'month'));
console.log('Same year:', date1.isSame(date2, 'year'));

// Inclusive comparisons (using basic methods)
console.log('\n[ Inclusive Comparisons ]');
const ref = kairos('2024-06-01');
const exact = kairos('2024-06-01');
const after = kairos('2024-06-02');

console.log('Reference:', ref.format('YYYY-MM-DD'));
console.log('Same date is same-or-before:', exact.isSame(ref) || exact.isBefore(ref));
console.log('Same date is same-or-after:', exact.isSame(ref) || exact.isAfter(ref));
console.log('Later date is same-or-after:', after.isSame(ref) || after.isAfter(ref));

// Range checking
console.log('\n[ Range Checking ]');
const rangeStart = kairos('2024-01-01');
const rangeEnd = kairos('2024-12-31');
const inside = kairos('2024-06-15');
const outside = kairos('2025-01-15');
const boundary = kairos('2024-12-31');

console.log('Range:', rangeStart.format('YYYY-MM-DD'), 'to', rangeEnd.format('YYYY-MM-DD'));
console.log('June 15 in range:', inside.isAfter(rangeStart) && inside.isBefore(rangeEnd));
console.log('Jan 2025 in range:', outside.isAfter(rangeStart) && outside.isBefore(rangeEnd));
console.log('Dec 31 in range (exclusive):', boundary.isAfter(rangeStart) && boundary.isBefore(rangeEnd));
console.log('Dec 31 in range (inclusive):', (boundary.isAfter(rangeStart) || boundary.isSame(rangeStart)) && (boundary.isBefore(rangeEnd) || boundary.isSame(rangeEnd)));

// Time differences
console.log('\n[ Time Differences ]');
const event1 = kairos('2024-01-01 09:00:00');
const event2 = kairos('2024-01-15 17:30:00');

console.log('Event 1:', event1.format('YYYY-MM-DD HH:mm'));
console.log('Event 2:', event2.format('YYYY-MM-DD HH:mm'));
const diffMs = event2.valueOf() - event1.valueOf();
console.log('Difference in milliseconds:', diffMs);
console.log('Difference in seconds:', Math.floor(diffMs / 1000));
console.log('Difference in minutes:', Math.floor(diffMs / (1000 * 60)));
console.log('Difference in hours:', Math.floor(diffMs / (1000 * 60 * 60)));
console.log('Difference in days:', Math.floor(diffMs / (1000 * 60 * 60 * 24)));
console.log('Difference in weeks:', Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)));

// Precise differences
console.log('\n[ Precise Differences ]');
const precise1 = kairos('2024-03-10 14:25:30');
const precise2 = kairos('2024-03-10 16:45:15');

console.log('Time 1:', precise1.format('HH:mm:ss'));
console.log('Time 2:', precise2.format('HH:mm:ss'));
const preciseDiffMs = precise2.valueOf() - precise1.valueOf();
const hours = Math.floor(Math.abs(preciseDiffMs) / (1000 * 60 * 60));
const minutes = Math.floor((Math.abs(preciseDiffMs) % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((Math.abs(preciseDiffMs) % (1000 * 60)) / 1000);
console.log(`Precise difference: ${hours}h ${minutes}m ${seconds}s`);

// Period boundaries
console.log('\n[ Period Boundaries ]');
const sample = kairos('2024-06-15 14:30:45.500');

console.log('Original:', sample.format('YYYY-MM-DD HH:mm:ss.SSS'));
console.log('Start of second:', sample.startOf('second').format('HH:mm:ss.SSS'));
console.log('Start of minute:', sample.startOf('minute').format('HH:mm:ss'));
console.log('Start of hour:', sample.startOf('hour').format('HH:mm:ss'));
console.log('Start of day:', sample.startOf('day').format('YYYY-MM-DD HH:mm:ss'));
console.log('Start of week:', sample.startOf('week').format('YYYY-MM-DD'));
console.log('Start of month:', sample.startOf('month').format('YYYY-MM-DD'));
console.log('Start of quarter:', sample.startOf('quarter').format('YYYY-MM-DD'));
console.log('Start of year:', sample.startOf('year').format('YYYY-MM-DD'));

console.log('\nEnd boundaries:');
console.log('End of day:', sample.endOf('day').format('YYYY-MM-DD HH:mm:ss.SSS'));
console.log('End of month:', sample.endOf('month').format('YYYY-MM-DD'));
console.log('End of year:', sample.endOf('year').format('YYYY-MM-DD'));

// Finding extremes
console.log('\n[ Finding Extremes ]');
const dates = [
  kairos('2024-03-15'),
  kairos('2024-01-01'), 
  kairos('2024-12-31'),
  kairos('2024-06-15'),
  kairos('2024-09-10')
];

console.log('Date list:', dates.map(d => d.format('YYYY-MM-DD')).join(', '));

const earliest = dates.reduce((min, d) => d.isBefore(min) ? d : min);
const latest = dates.reduce((max, d) => d.isAfter(max) ? d : max);

console.log('Earliest date:', earliest.format('YYYY-MM-DD'));
console.log('Latest date:', latest.format('YYYY-MM-DD'));