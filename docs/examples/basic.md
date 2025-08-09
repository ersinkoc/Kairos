# Basic Examples

This page shows practical examples using Kairos core functionality.

## Date Creation Examples

### Current Date and Time
```javascript
import kairos from '@oxog/kairos';

// Current local time
const now = kairos();
console.log('Current time:', now.format('YYYY-MM-DD HH:mm:ss'));

// Current UTC time
const utcNow = kairos.utc();
console.log('UTC time:', utcNow.format('YYYY-MM-DD HH:mm:ss'));
```

### Parsing Various Formats
```javascript
// ISO formats
const iso1 = kairos('2024-01-15');
const iso2 = kairos('2024-01-15T14:30:00');
const iso3 = kairos('2024-01-15T14:30:00Z');

// With parsing plugins
import flexibleParser from '@oxog/kairos/plugins/parse/flexible';
kairos.use(flexibleParser);

const us = kairos('01/15/2024');
const european = kairos('15.01.2024');
const natural = kairos('January 15, 2024');
```

## Formatting Examples

### Common Date Formats
```javascript
const date = kairos('2024-01-15 14:30:45');

console.log('ISO:', date.format('YYYY-MM-DD'));
console.log('US:', date.format('MM/DD/YYYY'));
console.log('European:', date.format('DD.MM.YYYY'));
console.log('Full:', date.format('YYYY-MM-DD HH:mm:ss'));
```

### Custom Formatting
```javascript
const date = kairos('2024-01-15 14:30:45');

// Log timestamps
console.log(date.format('[LOG] YYYY-MM-DD HH:mm:ss.SSS'));
// Output: "LOG 2024-01-15 14:30:45.000"

// File naming
console.log(date.format('backup_YYYYMMDD_HHmmss[.sql]'));
// Output: "backup_20240115_143045.sql"

// Human readable
console.log(date.format('YYYY-MM-DD [at] HH:mm'));
// Output: "2024-01-15 at 14:30"
```

## Date Arithmetic Examples

### Age Calculator
```javascript
function calculateAge(birthdate) {
  const birth = kairos(birthdate);
  const now = kairos();
  
  if (!birth.isValid()) {
    throw new Error('Invalid birthdate');
  }
  
  const diffMs = now.valueOf() - birth.valueOf();
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  
  return {
    years,
    totalDays: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
    birthdate: birth.format('YYYY-MM-DD'),
    nextBirthday: birth.year(now.year()).isAfter(now) 
      ? birth.year(now.year())
      : birth.year(now.year() + 1)
  };
}

const age = calculateAge('1990-05-15');
console.log(`Age: ${age.years} years`);
console.log(`Next birthday: ${age.nextBirthday.format('YYYY-MM-DD')}`);
```

### Project Timeline
```javascript
function createProjectTimeline(startDate, durationWeeks) {
  const start = kairos(startDate);
  const end = start.add(durationWeeks, 'weeks');
  
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
    totalDays: Math.floor((end.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24)),
    milestones: {
      quarterPoint: start.add(Math.floor(durationWeeks / 4), 'weeks'),
      halfway: start.add(Math.floor(durationWeeks / 2), 'weeks'),
      threeQuarter: start.add(Math.floor(durationWeeks * 3 / 4), 'weeks')
    }
  };
}

const project = createProjectTimeline('2024-01-01', 12);
console.log('Project timeline:', project);
```

## Comparison Examples

### Event Scheduler
```javascript
class EventScheduler {
  constructor() {
    this.events = [];
  }
  
  addEvent(name, datetime) {
    const eventDate = kairos(datetime);
    
    if (!eventDate.isValid()) {
      throw new Error('Invalid event date');
    }
    
    if (eventDate.isBefore(kairos())) {
      throw new Error('Cannot schedule events in the past');
    }
    
    this.events.push({
      name,
      date: eventDate,
      id: Date.now()
    });
    
    this.events.sort((a, b) => a.date.valueOf() - b.date.valueOf());
  }
  
  getUpcomingEvents(days = 7) {
    const now = kairos();
    const cutoff = now.add(days, 'days');
    
    return this.events.filter(event => 
      event.date.isAfter(now) && event.date.isBefore(cutoff)
    );
  }
  
  getEventsOn(date) {
    const targetDate = kairos(date);
    
    return this.events.filter(event =>
      event.date.isSame(targetDate, 'day')
    );
  }
}

const scheduler = new EventScheduler();
scheduler.addEvent('Team Meeting', '2024-01-15 14:00:00');
scheduler.addEvent('Project Deadline', '2024-01-20 17:00:00');

console.log('Upcoming events:', scheduler.getUpcomingEvents());
```

### Date Range Checker
```javascript
function isWithinBusinessHours(datetime, startHour = 9, endHour = 17) {
  const date = kairos(datetime);
  const hour = date.hour();
  const dayOfWeek = date.day();
  
  // Check if it's a weekday (Monday = 1, Friday = 5)
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  
  // Check if within business hours
  const isBusinessHour = hour >= startHour && hour < endHour;
  
  return {
    isBusinessDay: isWeekday,
    isBusinessHour,
    isWithinBusinessHours: isWeekday && isBusinessHour,
    dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    hour
  };
}

console.log(isWithinBusinessHours('2024-01-15 14:30:00')); // Monday 2:30 PM
console.log(isWithinBusinessHours('2024-01-13 14:30:00')); // Saturday 2:30 PM
console.log(isWithinBusinessHours('2024-01-15 20:30:00')); // Monday 8:30 PM
```

## Period Operations Examples

### Weekly Report Generator
```javascript
function generateWeeklyReport(weekStart) {
  const start = kairos(weekStart).startOf('week');
  const end = start.endOf('week');
  
  const days = [];
  let current = start.clone();
  
  while (current.isSameOrBefore(end, 'day')) {
    days.push({
      date: current.format('YYYY-MM-DD'),
      dayName: current.format('dddd'),
      isWeekend: current.day() === 0 || current.day() === 6
    });
    current = current.add(1, 'day');
  }
  
  return {
    weekOf: start.format('YYYY-MM-DD'),
    period: `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`,
    days,
    weekday_count: days.filter(d => !d.isWeekend).length,
    weekend_count: days.filter(d => d.isWeekend).length
  };
}

const report = generateWeeklyReport('2024-01-15');
console.log('Weekly report:', report);
```

### Monthly Calendar
```javascript
function generateMonthCalendar(year, month) {
  const firstDay = kairos().year(year).month(month).startOf('month');
  const lastDay = firstDay.endOf('month');
  
  const calendar = [];
  let current = firstDay.clone();
  
  // Go to start of week
  while (current.day() !== 0) { // Sunday = 0
    current = current.subtract(1, 'day');
  }
  
  // Generate 6 weeks worth of days
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    
    for (let day = 0; day < 7; day++) {
      weekDays.push({
        date: current.format('YYYY-MM-DD'),
        day: current.date(),
        isCurrentMonth: current.month() === month,
        isToday: current.isSame(kairos(), 'day'),
        isWeekend: current.day() === 0 || current.day() === 6
      });
      
      current = current.add(1, 'day');
    }
    
    calendar.push(weekDays);
  }
  
  return {
    year,
    month,
    monthName: firstDay.format('MMMM'),
    daysInMonth: lastDay.date(),
    calendar
  };
}

const calendar = generateMonthCalendar(2024, 1); // January 2024
console.log('Calendar:', calendar);
```

## Validation Examples

### Form Date Validator
```javascript
class DateValidator {
  static isValidDate(dateString) {
    const date = kairos(dateString);
    return date.isValid();
  }
  
  static isInFuture(dateString) {
    const date = kairos(dateString);
    return date.isValid() && date.isAfter(kairos());
  }
  
  static isInPast(dateString) {
    const date = kairos(dateString);
    return date.isValid() && date.isBefore(kairos());
  }
  
  static isBetween(dateString, startDate, endDate) {
    const date = kairos(dateString);
    const start = kairos(startDate);
    const end = kairos(endDate);
    
    return date.isValid() && start.isValid() && end.isValid() &&
           date.isAfter(start) && date.isBefore(end);
  }
  
  static isMinAge(birthdate, minAge) {
    const birth = kairos(birthdate);
    const cutoffDate = kairos().subtract(minAge, 'years');
    
    return birth.isValid() && birth.isBefore(cutoffDate);
  }
}

// Usage examples
console.log(DateValidator.isValidDate('2024-01-15')); // true
console.log(DateValidator.isValidDate('invalid'));    // false
console.log(DateValidator.isInFuture('2025-01-01'));  // true
console.log(DateValidator.isMinAge('1990-01-01', 18)); // true
```

### Safe Date Operations
```javascript
function safeDateOperation(dateString, operation) {
  const date = kairos(dateString);
  
  if (!date.isValid()) {
    return {
      success: false,
      error: 'Invalid date string',
      input: dateString
    };
  }
  
  try {
    const result = operation(date);
    return {
      success: true,
      result: result.format('YYYY-MM-DD HH:mm:ss'),
      input: dateString
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      input: dateString
    };
  }
}

// Examples
const result1 = safeDateOperation('2024-01-15', date => date.add(1, 'month'));
const result2 = safeDateOperation('invalid-date', date => date.add(1, 'month'));

console.log('Valid operation:', result1);
console.log('Invalid operation:', result2);
```

## Time Zone Examples

### Meeting Time Converter
```javascript
function convertMeetingTime(utcTime, timezones) {
  const meetingTime = kairos.utc(utcTime);
  
  if (!meetingTime.isValid()) {
    throw new Error('Invalid UTC time');
  }
  
  return timezones.map(tz => ({
    location: tz.name,
    time: meetingTime.clone().add(tz.offset, 'hours').format('HH:mm'),
    date: meetingTime.clone().add(tz.offset, 'hours').format('YYYY-MM-DD'),
    isWorkingHours: (() => {
      const localHour = meetingTime.clone().add(tz.offset, 'hours').hour();
      return localHour >= 9 && localHour < 17;
    })()
  }));
}

const timezones = [
  { name: 'New York', offset: -5 },
  { name: 'London', offset: 0 },
  { name: 'Tokyo', offset: 9 },
  { name: 'Sydney', offset: 11 }
];

const meetingTimes = convertMeetingTime('2024-01-15 14:00:00', timezones);
console.log('Meeting times:', meetingTimes);
```

## Next Steps

- [Advanced Examples](./advanced.md)
- [Plugin Examples](./plugins.md)
- [API Reference](../API.md)