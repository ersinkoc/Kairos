/**
 * Core Date Operations
 * Advanced examples using core functionality
 */

import kairos from '../dist/index.js';
import durationPlugin from '../dist/plugins/duration/duration.js';

// Load plugins
kairos.use(durationPlugin);

console.log('=== ADVANCED DATE OPERATIONS ===\n');

// Project timeline calculations
console.log('[ Project Timeline ]');
const projectStart = kairos('2024-06-01');
const projectEnd = projectStart.clone().add(45, 'days');

console.log('Project start:', projectStart.format('YYYY-MM-DD dddd'));
console.log('45 days later:', projectEnd.format('YYYY-MM-DD dddd'));
console.log('Calendar days:', Math.floor((projectEnd.valueOf() - projectStart.valueOf()) / (1000 * 60 * 60 * 24)));

// Sprint planning simulation
console.log('\n[ Sprint Planning ]');
const sprintStart = kairos('2024-06-03'); // Monday
const sprintDuration = 2; // weeks
const sprints = [];

for (let i = 0; i < 4; i++) {
  const start = sprintStart.clone().add(i * sprintDuration, 'weeks');
  const end = start.clone().add(sprintDuration, 'weeks').subtract(1, 'day');
  sprints.push({
    number: i + 1,
    start: start,
    end: end,
    days: Math.floor((end.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24)) + 1
  });
}

sprints.forEach(sprint => {
  console.log(`Sprint ${sprint.number}: ${sprint.start.format('MMM D')} - ${sprint.end.format('MMM D')} (${sprint.days} days)`);
});

// Time tracking
console.log('\n[ Time Tracking ]');
const workLogs = [
  { start: kairos('2024-06-10 09:00'), end: kairos('2024-06-10 17:30') },
  { start: kairos('2024-06-11 08:45'), end: kairos('2024-06-11 18:15') },
  { start: kairos('2024-06-12 09:15'), end: kairos('2024-06-12 17:00') },
  { start: kairos('2024-06-13 09:00'), end: kairos('2024-06-13 16:45') },
  { start: kairos('2024-06-14 08:30'), end: kairos('2024-06-14 15:30') }
];

let totalWork = 0;
workLogs.forEach((log, index) => {
  const duration = kairos.duration(log.end.valueOf() - log.start.valueOf());
  totalWork += duration.asMilliseconds();
  console.log(`Day ${index + 1}: ${duration.asHours().toFixed(2)} hours`);
});

const totalDuration = kairos.duration(totalWork);
console.log(`Total: ${totalDuration.asHours().toFixed(2)} hours`);
console.log(`Average: ${(totalDuration.asHours() / workLogs.length).toFixed(2)} hours/day`);

// Deadline tracking
console.log('\n[ Deadline Tracking ]');
const now = kairos();
const tasks = [
  { name: 'Design Review', due: now.clone().add(2, 'hours') },
  { name: 'Code Deploy', due: now.clone().add(1, 'day') },
  { name: 'Sprint Review', due: now.clone().endOf('week') },
  { name: 'Monthly Report', due: now.clone().endOf('month') }
];

tasks.forEach(task => {
  const timeLeft = kairos.duration(task.due.valueOf() - now.valueOf());
  const status = task.due.isBefore(now) ? 'OVERDUE' : 
                 (task.due.valueOf() - now.valueOf()) / (1000 * 60 * 60) < 24 ? 'URGENT' : 'PENDING';
  
  console.log(`${task.name}: ${status} - ${timeLeft.humanize()} remaining`);
});

// Monthly analysis
console.log('\n[ Monthly Analysis ]');
const dataPoints = [];
const startAnalysis = kairos('2024-01-01');

for (let i = 0; i < 12; i++) {
  const month = startAnalysis.clone().add(i, 'months');
  dataPoints.push({
    month: month.format('MMM YYYY'),
    quarter: `Q${Math.ceil(month.month() / 3)}`,
    days: new Date(month.year(), month.month(), 0).getDate()
  });
}

console.log('Monthly breakdown:');
dataPoints.forEach(point => {
  console.log(`${point.month} (${point.quarter}): ${point.days} days`);
});

// Event scheduling
console.log('\n[ Event Recurrence ]');
const generateRecurring = (start, pattern, count) => {
  const events = [];
  let current = start.clone();
  
  for (let i = 0; i < count; i++) {
    events.push(current.clone());
    
    switch (pattern) {
      case 'daily':
        current = current.add(1, 'day');
        break;
      case 'weekly':
        current = current.add(1, 'week');
        break;
      case 'monthly':
        current = current.add(1, 'month');
        break;
    }
  }
  
  return events;
};

const standup = generateRecurring(kairos('2024-06-03 09:00'), 'weekly', 4);
console.log('Weekly standup times:');
standup.forEach(time => console.log('  ', time.format('ddd MMM D [at] HH:mm')));

// Date calculations
console.log('\n[ Date Calculations ]');
const today = kairos();
const calculations = [
  { name: 'Start of week', date: today.clone().startOf('week') },
  { name: 'End of week', date: today.clone().endOf('week') },
  { name: 'Start of month', date: today.clone().startOf('month') },
  { name: 'End of month', date: today.clone().endOf('month') },
  { name: '30 days ago', date: today.clone().subtract(30, 'days') },
  { name: '90 days from now', date: today.clone().add(90, 'days') }
];

calculations.forEach(calc => {
  console.log(`${calc.name}: ${calc.date.format('YYYY-MM-DD dddd')}`);
});

// Time zone examples
console.log('\n[ Multi-timezone Times ]');
const meetingUTC = kairos.utc('2024-06-15 14:00:00');
const timezones = [
  { location: 'UTC', offset: 0 },
  { location: 'New York', offset: -300 },
  { location: 'London', offset: 60 },
  { location: 'Tokyo', offset: 540 }
];

console.log('Meeting scheduled (UTC):', meetingUTC.format('HH:mm'));
timezones.forEach(tz => {
  const offsetHours = tz.offset / 60;
  const localTime = meetingUTC.clone().add(offsetHours, 'hours');
  console.log(`${tz.location}: ${localTime.format('HH:mm')}`);
});

console.log('\n✅ Advanced operations completed successfully');