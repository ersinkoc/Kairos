/**
 * Durations and Date Ranges
 * Working with time durations and date ranges
 */

const kairos = require('../dist/index.js');
const durationPlugin = require('../dist/plugins/duration/duration').default;
const rangePlugin = require('../dist/plugins/range/range').default;

// Load plugins
kairos.use(durationPlugin);
kairos.use(rangePlugin);

console.log('=== DURATIONS & RANGES ===\n');

// Creating durations
console.log('[ Creating Durations ]');
const duration1 = kairos.duration({ hours: 2, minutes: 30 });
const duration2 = kairos.duration({ days: 7 });
const duration3 = kairos.duration({ years: 1, months: 6, days: 15 });
const duration4 = kairos.duration(5000); // 5 seconds in milliseconds

console.log('2.5 hours:', duration1.humanize());
console.log('7 days:', duration2.humanize());
console.log('1.5 years:', duration3.humanize());
console.log('5 seconds:', duration4.humanize());

// Duration arithmetic
console.log('\n[ Duration Arithmetic ]');
const dur1 = kairos.duration({ hours: 3, minutes: 45 });
const dur2 = kairos.duration({ hours: 1, minutes: 30 });
const added = kairos.duration(dur1.asMilliseconds() + dur2.asMilliseconds());
const subtracted = kairos.duration(dur1.asMilliseconds() - dur2.asMilliseconds());

console.log('Duration 1:', dur1.humanize());
console.log('Duration 2:', dur2.humanize());
console.log('Added:', added.humanize());
console.log('Subtracted:', subtracted.humanize());

// Duration conversions
console.log('\n[ Duration Conversions ]');
const sampleDuration = kairos.duration({ days: 2, hours: 12, minutes: 30 });
console.log('Duration:', sampleDuration.humanize());
console.log('As milliseconds:', sampleDuration.asMilliseconds());
console.log('As seconds:', sampleDuration.asSeconds());
console.log('As minutes:', sampleDuration.asMinutes());
console.log('As hours:', sampleDuration.asHours());
console.log('As days:', sampleDuration.asDays());

// ISO 8601 durations
console.log('\n[ ISO 8601 Durations ]');
const isoDuration1 = kairos.duration('P1Y2M3DT4H5M6S');
const isoDuration2 = kairos.duration('PT1H30M');
const isoDuration3 = kairos.duration('P7D');

console.log('P1Y2M3DT4H5M6S:', isoDuration1.humanize());
console.log('PT1H30M:', isoDuration2.humanize());
console.log('P7D:', isoDuration3.humanize());
console.log('To ISO:', kairos.duration({ hours: 2, minutes: 15 }).toISOString());

// Duration from dates
console.log('\n[ Duration Between Dates ]');
const meeting1 = kairos('2024-06-15 09:00:00');
const meeting2 = kairos('2024-06-15 11:30:00');
const meetingDuration = kairos.duration(meeting2.diff(meeting1));

console.log('Meeting start:', meeting1.format('HH:mm'));
console.log('Meeting end:', meeting2.format('HH:mm'));
console.log('Duration:', meetingDuration.humanize());
console.log('In minutes:', meetingDuration.asMinutes(), 'minutes');

// Date ranges
console.log('\n[ Date Ranges ]');
const rangeStart = kairos('2024-06-01');
const rangeEnd = kairos('2024-06-30');
const range = kairos.range(rangeStart, rangeEnd);

console.log('Range:', rangeStart.format('MMM D'), 'to', rangeEnd.format('MMM D, YYYY'));
console.log('Contains June 15:', range.contains(kairos('2024-06-15')));
console.log('Contains July 1:', range.contains(kairos('2024-07-01')));
console.log('Duration:', kairos.duration(range.duration()).humanize());

// Range operations
console.log('\n[ Range Operations ]');
const range1 = kairos.range(kairos('2024-06-01'), kairos('2024-06-15'));
const range2 = kairos.range(kairos('2024-06-10'), kairos('2024-06-20'));

console.log('Range 1:', range1.start.format('MMM D'), '-', range1.end.format('MMM D'));
console.log('Range 2:', range2.start.format('MMM D'), '-', range2.end.format('MMM D'));
console.log('Overlaps:', range1.overlaps(range2));

// Generate date series
console.log('\n[ Date Series ]');
const seriesStart = kairos('2024-06-01');
const seriesEnd = kairos('2024-06-07');
const dailySeries = [];
let current = seriesStart.clone();

while (current.isSameOrBefore(seriesEnd)) {
  dailySeries.push(current.format('MMM D'));
  current = current.add(1, 'day');
}
console.log('Daily series:', dailySeries.join(', '));

// Working with intervals
console.log('\n[ Time Intervals ]');
const shift1Start = kairos('2024-06-15 08:00:00');
const shift1End = kairos('2024-06-15 16:00:00');
const shift2Start = kairos('2024-06-15 16:00:00');
const shift2End = kairos('2024-06-16 00:00:00');

const shift1Duration = kairos.duration(shift1End.diff(shift1Start));
const shift2Duration = kairos.duration(shift2End.diff(shift2Start));

console.log('Shift 1:', shift1Start.format('HH:mm'), '-', shift1End.format('HH:mm'));
console.log('Duration:', shift1Duration.asHours(), 'hours');
console.log('Shift 2:', shift2Start.format('HH:mm'), '-', shift2End.format('HH:mm'));
console.log('Duration:', shift2Duration.asHours(), 'hours');

// Recurring intervals
console.log('\n[ Recurring Intervals ]');
const recurStart = kairos('2024-06-01');
const occurrences = [];

for (let i = 0; i < 5; i++) {
  const occurrence = recurStart.add(i * 7, 'days');
  occurrences.push(occurrence.format('MMM D'));
}
console.log('Weekly occurrences:', occurrences.join(', '));

// Duration formatting
console.log('\n[ Duration Formatting ]');
const complexDuration = kairos.duration({ 
  days: 3, 
  hours: 14, 
  minutes: 25, 
  seconds: 45 
});

console.log('Full duration:', complexDuration.humanize());
console.log('Total hours:', complexDuration.asHours().toFixed(2), 'hours');
console.log('Components:');
console.log('  Days:', Math.floor(complexDuration.asDays()));
console.log('  Hours:', complexDuration.hours());
console.log('  Minutes:', complexDuration.minutes());
console.log('  Seconds:', complexDuration.seconds());

// Time tracking example
console.log('\n[ Time Tracking ]');
const taskStart = kairos('2024-06-15 09:15:00');
const taskEnd = kairos('2024-06-15 13:45:30');
const taskDuration = kairos.duration(taskEnd.diff(taskStart));

console.log('Task started:', taskStart.format('HH:mm:ss'));
console.log('Task ended:', taskEnd.format('HH:mm:ss'));
console.log('Time spent:', taskDuration.humanize());
console.log('Billable hours:', (taskDuration.asHours()).toFixed(2));