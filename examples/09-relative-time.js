/**
 * Relative Time and Duration Display
 * Basic relative time calculations
 */

import kairos from '../dist/index.js';
import durationPlugin from '../dist/plugins/duration/duration.js';

// Load plugins
kairos.use(durationPlugin);

console.log('=== RELATIVE TIME BASICS ===\n');

// Simple relative calculations
console.log('[ Basic Time Differences ]');
const now = kairos();
const pastTimes = [
  now.clone().subtract(5, 'minutes'),
  now.clone().subtract(1, 'hour'),
  now.clone().subtract(1, 'day'),
  now.clone().subtract(1, 'week')
];

pastTimes.forEach((time, index) => {
  const diffMs = now.valueOf() - time.valueOf();
  const duration = kairos.duration(diffMs);
  console.log(`${index + 1}. ${duration.humanize()} ago`);
});

// Future times
console.log('\n[ Future Times ]');
const futureTimes = [
  now.clone().add(15, 'minutes'),
  now.clone().add(2, 'hours'),
  now.clone().add(3, 'days'),
  now.clone().add(1, 'month')
];

futureTimes.forEach((time, index) => {
  const diffMs = time.valueOf() - now.valueOf();
  const duration = kairos.duration(diffMs);
  console.log(`${index + 1}. In ${duration.humanize()}`);
});

// Duration calculations
console.log('\n[ Duration Calculations ]');
const start = kairos('2024-06-15 09:00:00');
const end = kairos('2024-06-15 17:30:00');
const workDuration = kairos.duration(end.valueOf() - start.valueOf());

console.log(`Work day: ${start.format('HH:mm')} to ${end.format('HH:mm')}`);
console.log(`Duration: ${workDuration.humanize()}`);
console.log(`In hours: ${workDuration.asHours().toFixed(2)} hours`);
console.log(`In minutes: ${workDuration.asMinutes()} minutes`);

// Time until events
console.log('\n[ Time Until Events ]');
const events = [
  { name: 'End of day', time: now.clone().hour(17).minute(0).second(0) },
  { name: 'Weekend', time: now.clone().endOf('week') },
  { name: 'End of month', time: now.clone().endOf('month') },
  { name: 'New Year', time: kairos('2025-01-01') }
];

events.forEach(event => {
  if (event.time.isAfter(now)) {
    const timeLeft = kairos.duration(event.time.valueOf() - now.valueOf());
    console.log(`${event.name}: ${timeLeft.humanize()} remaining`);
  } else {
    const timePassed = kairos.duration(now.valueOf() - event.time.valueOf());
    console.log(`${event.name}: ${timePassed.humanize()} ago`);
  }
});

// Age calculation
console.log('\n[ Age Calculation ]');
const birthdate = kairos('1990-05-15');
const age = kairos.duration(now.valueOf() - birthdate.valueOf());
console.log(`Born: ${birthdate.format('YYYY-MM-DD')}`);
console.log(`Age: ${Math.floor(age.asDays() / 365)} years old`);
console.log(`Exact age: ${age.humanize()}`);

// Meeting duration tracker
console.log('\n[ Meeting Duration ]');
const meetings = [
  { name: 'Daily Standup', start: '09:00', end: '09:15' },
  { name: 'Project Review', start: '10:30', end: '11:30' },
  { name: 'Lunch Break', start: '12:00', end: '13:00' },
  { name: 'Team Meeting', start: '15:00', end: '16:00' }
];

let totalMeetingTime = 0;

meetings.forEach(meeting => {
  const startTime = kairos(`2024-06-15 ${meeting.start}:00`);
  const endTime = kairos(`2024-06-15 ${meeting.end}:00`);
  const duration = kairos.duration(endTime.valueOf() - startTime.valueOf());
  totalMeetingTime += duration.asMilliseconds();
  
  console.log(`${meeting.name}: ${duration.humanize()}`);
});

const totalDuration = kairos.duration(totalMeetingTime);
console.log(`Total meeting time: ${totalDuration.humanize()}`);

// Countdown examples
console.log('\n[ Countdowns ]');
const deadlines = [
  kairos().add(1, 'hour'),
  kairos().add(5, 'hours'),
  kairos().add(2, 'days'),
  kairos().add(1, 'week')
];

deadlines.forEach((deadline, index) => {
  const timeLeft = kairos.duration(deadline.valueOf() - now.valueOf());
  console.log(`Deadline ${index + 1}: ${timeLeft.humanize()} remaining`);
});

console.log('\n✅ Relative time examples completed successfully');