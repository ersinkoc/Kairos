/**
 * Advanced Plugin Usage
 * Combining multiple plugins for complex scenarios
 */

const kairos = require('../dist/index.js');

// Load all plugins
const plugins = {
  business: require('../dist/plugins/business/workday').default,
  calendar: require('../dist/plugins/calendar/calendar').default,
  duration: require('../dist/plugins/duration/duration').default,
  fiscal: require('../dist/plugins/fiscal/fiscal').default,
  format: require('../dist/plugins/format/format').default,
  holiday: require('../dist/plugins/holiday/holiday').default,
  parse: require('../dist/plugins/parse/flexible').default,
  range: require('../dist/plugins/range/range').default,
  relative: require('../dist/plugins/relative/relative').default,
  timezone: require('../dist/plugins/timezone/timezone').default
};

// Load all plugins
Object.values(plugins).forEach(plugin => kairos.use(plugin));

console.log('=== ADVANCED PLUGIN USAGE ===\n');

// Complex business logic
console.log('[ Project Timeline ]');
const projectStart = kairos('2024-06-01');
const projectEnd = projectStart.clone().addBusinessDays(45);
const projectRange = kairos.range(projectStart, projectEnd);

console.log('Project start:', projectStart.format('YYYY-MM-DD dddd'));
console.log('45 business days later:', projectEnd.format('YYYY-MM-DD dddd'));
console.log('Calendar days:', projectStart.diff(projectEnd, 'days'));
console.log('Includes July 4th:', projectRange.contains(kairos('2024-07-04')));

// Sprint planning
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
    workDays: start.businessDaysBetween(end)
  });
}

sprints.forEach(sprint => {
  console.log(`Sprint ${sprint.number}: ${sprint.start.format('MMM D')} - ${sprint.end.format('MMM D')} (${sprint.workDays} work days)`);
});

// Meeting scheduler
console.log('\n[ Meeting Scheduler ]');
const findNextMeetingSlot = (startDate, duration, constraints) => {
  let candidate = startDate.clone();
  
  while (true) {
    // Check if it's a business day
    if (!candidate.isBusinessDay()) {
      candidate = candidate.nextBusinessDay().hour(constraints.startHour);
      continue;
    }
    
    // Check if within business hours
    if (candidate.hour() < constraints.startHour) {
      candidate = candidate.hour(constraints.startHour).minute(0);
    } else if (candidate.hour() >= constraints.endHour - duration) {
      candidate = candidate.add(1, 'day').hour(constraints.startHour).minute(0);
      continue;
    }
    
    // Check for conflicts (simplified)
    const hasConflict = constraints.existingMeetings.some(meeting => {
      const meetingRange = kairos.range(meeting.start, meeting.end);
      const candidateEnd = candidate.clone().add(duration, 'hours');
      return meetingRange.overlaps(kairos.range(candidate, candidateEnd));
    });
    
    if (!hasConflict) {
      return candidate;
    }
    
    candidate = candidate.add(1, 'hour');
  }
};

const meetingConstraints = {
  startHour: 9,
  endHour: 17,
  existingMeetings: [
    { start: kairos('2024-06-15 10:00'), end: kairos('2024-06-15 11:00') },
    { start: kairos('2024-06-15 14:00'), end: kairos('2024-06-15 15:30') }
  ]
};

const nextSlot = findNextMeetingSlot(kairos('2024-06-15 09:00'), 2, meetingConstraints);
console.log('Next available 2-hour slot:', nextSlot.format('YYYY-MM-DD HH:mm'));

// Fiscal reporting
console.log('\n[ Fiscal Year Reporting ]');
const fiscalConfig = { startMonth: 4 }; // April fiscal year
const reportDate = kairos('2024-08-15');

console.log('Report date:', reportDate.format('YYYY-MM-DD'));
console.log('Calendar year:', reportDate.year());
console.log('Calendar quarter:', reportDate.quarter());
console.log('Fiscal year:', reportDate.fiscalYear(fiscalConfig));
console.log('Fiscal quarter:', reportDate.fiscalQuarter(fiscalConfig));

const fiscalQ1Start = kairos().month(4).date(1).startOf('day');
const fiscalQ1End = fiscalQ1Start.clone().add(3, 'months').subtract(1, 'day').endOf('day');
console.log('Fiscal Q1:', fiscalQ1Start.format('MMM D'), '-', fiscalQ1End.format('MMM D'));

// Multi-timezone coordination
console.log('\n[ Global Team Coordination ]');
const teams = [
  { location: 'New York', offset: -240 },    // EDT
  { location: 'London', offset: 60 },        // BST
  { location: 'Tokyo', offset: 540 },        // JST
  { location: 'Sydney', offset: 600 }        // AEST
];

const meetingUTC = kairos.utc('2024-06-15 14:00:00');
console.log('Meeting scheduled (UTC):', meetingUTC.format('HH:mm'));

teams.forEach(team => {
  const localTime = meetingUTC.clone().utcOffset(team.offset);
  const workHours = localTime.hour() >= 9 && localTime.hour() < 17;
  console.log(`${team.location}: ${localTime.format('HH:mm')} ${workHours ? '✓' : '✗ Outside work hours'}`);
});

// Deadline tracking
console.log('\n[ Deadline Tracking ]');
const tasks = [
  { name: 'Design Review', due: kairos().add(2, 'hours') },
  { name: 'Code Deploy', due: kairos().add(1, 'day') },
  { name: 'Sprint Review', due: kairos().endOf('week') },
  { name: 'Monthly Report', due: kairos().endOf('month') },
  { name: 'Q2 Planning', due: kairos().month(6).endOf('month') }
];

tasks.forEach(task => {
  const now = kairos();
  const timeLeft = kairos.duration(task.due.diff(now));
  const status = task.due.isBefore(now) ? 'OVERDUE' : 
                 task.due.diff(now, 'hours') < 24 ? 'URGENT' : 'PENDING';
  
  console.log(`${task.name}: ${status} - ${task.due.fromNow()}`);
});

// Historical data analysis
console.log('\n[ Historical Analysis ]');
const dataPoints = [];
const startAnalysis = kairos('2024-01-01');

for (let i = 0; i < 12; i++) {
  const month = startAnalysis.clone().add(i, 'months');
  dataPoints.push({
    month: month.format('MMM YYYY'),
    quarter: `Q${month.quarter()}`,
    days: month.daysInMonth(),
    businessDays: month.businessDaysBetween(month.clone().endOf('month'))
  });
}

console.log('Monthly breakdown:');
dataPoints.forEach(point => {
  console.log(`${point.month} (${point.quarter}): ${point.days} days, ${point.businessDays} business days`);
});

// Event recurrence
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
      case 'biweekly':
        current = current.add(2, 'weeks');
        break;
      case 'monthly':
        current = current.add(1, 'month');
        break;
      case 'quarterly':
        current = current.add(3, 'months');
        break;
    }
  }
  
  return events;
};

const standup = generateRecurring(kairos('2024-06-03 09:00'), 'daily', 5);
console.log('Daily standup times:');
standup.forEach(time => console.log('  ', time.format('ddd MMM D [at] HH:mm')));

// Complex duration calculations
console.log('\n[ Work Log Analysis ]');
const workLogs = [
  { start: kairos('2024-06-10 09:00'), end: kairos('2024-06-10 17:30') },
  { start: kairos('2024-06-11 08:45'), end: kairos('2024-06-11 18:15') },
  { start: kairos('2024-06-12 09:15'), end: kairos('2024-06-12 17:00') },
  { start: kairos('2024-06-13 09:00'), end: kairos('2024-06-13 16:45') },
  { start: kairos('2024-06-14 08:30'), end: kairos('2024-06-14 15:30') }
];

let totalWork = 0;
workLogs.forEach((log, index) => {
  const duration = kairos.duration(log.end.diff(log.start));
  totalWork += duration.asMilliseconds();
  console.log(`Day ${index + 1}: ${duration.asHours().toFixed(2)} hours`);
});

const totalDuration = kairos.duration(totalWork);
console.log(`Total: ${totalDuration.asHours().toFixed(2)} hours`);
console.log(`Average: ${(totalDuration.asHours() / workLogs.length).toFixed(2)} hours/day`);