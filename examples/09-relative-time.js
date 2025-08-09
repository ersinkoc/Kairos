/**
 * Relative Time Display
 * Human-readable time differences and relative formatting
 */

const kairos = require('../dist/index.js');
const relativePlugin = require('../dist/plugins/relative/relative').default;
const durationPlugin = require('../dist/plugins/duration/duration').default;

// Load plugins
kairos.use(relativePlugin);
kairos.use(durationPlugin);

console.log('=== RELATIVE TIME ===\n');

// From now
console.log('[ From Now ]');
const now = kairos();
const times = [
  { date: now.clone().subtract(5, 'seconds'), label: '5 seconds ago' },
  { date: now.clone().subtract(1, 'minute'), label: '1 minute ago' },
  { date: now.clone().subtract(5, 'minutes'), label: '5 minutes ago' },
  { date: now.clone().subtract(1, 'hour'), label: '1 hour ago' },
  { date: now.clone().subtract(3, 'hours'), label: '3 hours ago' },
  { date: now.clone().subtract(1, 'day'), label: '1 day ago' },
  { date: now.clone().subtract(3, 'days'), label: '3 days ago' },
  { date: now.clone().subtract(1, 'week'), label: '1 week ago' },
  { date: now.clone().subtract(1, 'month'), label: '1 month ago' },
  { date: now.clone().subtract(1, 'year'), label: '1 year ago' },
  { date: now.clone().add(5, 'minutes'), label: 'in 5 minutes' },
  { date: now.clone().add(1, 'hour'), label: 'in 1 hour' },
  { date: now.clone().add(1, 'day'), label: 'tomorrow' },
  { date: now.clone().add(1, 'week'), label: 'next week' },
  { date: now.clone().add(1, 'month'), label: 'next month' }
];

times.forEach(item => {
  console.log(`Expected: ${item.label.padEnd(15)} -> fromNow():`, item.date.fromNow());
});

// To now
console.log('\n[ To Now ]');
const pastEvent = now.clone().subtract(2, 'weeks');
const futureEvent = now.clone().add(2, 'weeks');

console.log('Past event (2 weeks ago):');
console.log('  fromNow():', pastEvent.fromNow());
console.log('  toNow():', pastEvent.toNow());

console.log('Future event (in 2 weeks):');
console.log('  fromNow():', futureEvent.fromNow());
console.log('  toNow():', futureEvent.toNow());

// From another date
console.log('\n[ From Another Date ]');
const reference = kairos('2024-06-15 12:00:00');
const comparisons = [
  reference.clone().subtract(1, 'hour'),
  reference.clone().subtract(1, 'day'),
  reference.clone().add(1, 'week'),
  reference.clone().add(1, 'month')
];

console.log('Reference:', reference.format('YYYY-MM-DD HH:mm'));
comparisons.forEach(date => {
  console.log(`${date.format('YYYY-MM-DD HH:mm')} ->`, date.from(reference));
});

// Without suffix
console.log('\n[ Without Suffix ]');
const past = now.clone().subtract(3, 'days');
const future = now.clone().add(3, 'days');

console.log('3 days ago:');
console.log('  With suffix:', past.fromNow());
console.log('  Without suffix:', past.fromNow(true));

console.log('In 3 days:');
console.log('  With suffix:', future.fromNow());
console.log('  Without suffix:', future.fromNow(true));

// Calendar time
console.log('\n[ Calendar Time ]');
const calendarDates = [
  { date: now.clone().subtract(2, 'days'), label: '2 days ago' },
  { date: now.clone().subtract(1, 'day'), label: 'yesterday' },
  { date: now.clone(), label: 'today' },
  { date: now.clone().add(1, 'day'), label: 'tomorrow' },
  { date: now.clone().add(2, 'days'), label: '2 days from now' },
  { date: now.clone().add(1, 'week'), label: 'next week' },
  { date: now.clone().subtract(1, 'week'), label: 'last week' }
];

calendarDates.forEach(item => {
  console.log(`${item.label.padEnd(15)} ->`, item.date.calendar());
});

// With reference time for calendar
console.log('\n[ Calendar with Reference ]');
const calRef = kairos('2024-06-15 14:00:00');
const calDates = [
  kairos('2024-06-14 10:00:00'),
  kairos('2024-06-15 10:00:00'),
  kairos('2024-06-15 18:00:00'),
  kairos('2024-06-16 10:00:00'),
  kairos('2024-06-22 10:00:00')
];

console.log('Reference:', calRef.format('YYYY-MM-DD HH:mm'));
calDates.forEach(date => {
  console.log(`${date.format('YYYY-MM-DD HH:mm')} ->`, date.calendar(calRef));
});

// Duration humanization
console.log('\n[ Duration Humanization ]');
const durations = [
  { ms: 1000, label: '1 second' },
  { ms: 60000, label: '1 minute' },
  { ms: 3600000, label: '1 hour' },
  { ms: 86400000, label: '1 day' },
  { ms: 604800000, label: '1 week' },
  { ms: 2592000000, label: '30 days' },
  { ms: 31536000000, label: '1 year' },
  { ms: 90000, label: '1.5 minutes' },
  { ms: 5400000, label: '1.5 hours' },
  { ms: 93784000, label: '1 day, 2 hours, 3 minutes' }
];

durations.forEach(item => {
  const duration = kairos.duration(item.ms);
  console.log(`${item.label.padEnd(25)} ->`, duration.humanize());
});

// Thresholds and rounding
console.log('\n[ Time Thresholds ]');
const thresholdTests = [
  { seconds: 44, expected: 'a few seconds' },
  { seconds: 45, expected: 'a minute' },
  { seconds: 89, expected: 'a minute' },
  { seconds: 90, expected: '2 minutes' },
  { minutes: 44, expected: '44 minutes' },
  { minutes: 45, expected: 'an hour' },
  { hours: 21, expected: '21 hours' },
  { hours: 22, expected: 'a day' },
  { days: 25, expected: '25 days' },
  { days: 26, expected: 'a month' }
];

thresholdTests.forEach(test => {
  let date;
  if (test.seconds) date = now.clone().subtract(test.seconds, 'seconds');
  else if (test.minutes) date = now.clone().subtract(test.minutes, 'minutes');
  else if (test.hours) date = now.clone().subtract(test.hours, 'hours');
  else if (test.days) date = now.clone().subtract(test.days, 'days');
  
  const value = Object.values(test)[0];
  const unit = Object.keys(test)[0];
  console.log(`${value} ${unit} ago -> ${date.fromNow()}`);
});

// Custom messages
console.log('\n[ Activity Timestamps ]');
const activities = [
  { name: 'Email sent', time: now.clone().subtract(5, 'minutes') },
  { name: 'Document saved', time: now.clone().subtract(1, 'hour') },
  { name: 'Meeting started', time: now.clone().subtract(2, 'hours') },
  { name: 'Project created', time: now.clone().subtract(3, 'days') },
  { name: 'Last login', time: now.clone().subtract(1, 'week') }
];

activities.forEach(activity => {
  console.log(`${activity.name}: ${activity.time.fromNow()}`);
});

// Time until events
console.log('\n[ Time Until Events ]');
const events = [
  { name: 'Coffee break', time: now.clone().add(15, 'minutes') },
  { name: 'Lunch', time: now.clone().add(2, 'hours') },
  { name: 'End of workday', time: now.clone().hour(17).minute(0).second(0) },
  { name: 'Weekend', time: now.clone().endOf('week') },
  { name: 'End of month', time: now.clone().endOf('month') }
];

events.forEach(event => {
  console.log(`${event.name}: ${event.time.fromNow()}`);
});

// Precise relative time
console.log('\n[ Precise Relative Time ]');
const preciseRef = kairos('2024-06-15 12:00:00');
const preciseTimes = [
  preciseRef.clone().add(1, 'second'),
  preciseRef.clone().add(30, 'seconds'),
  preciseRef.clone().add(1, 'minute').add(30, 'seconds'),
  preciseRef.clone().add(1, 'hour').add(15, 'minutes'),
  preciseRef.clone().add(1, 'day').add(6, 'hours')
];

console.log('Reference:', preciseRef.format('HH:mm:ss'));
preciseTimes.forEach(time => {
  const diff = time.diff(preciseRef);
  const duration = kairos.duration(diff);
  console.log(`${time.format('HH:mm:ss')} -> ${duration.humanize()} later`);
});