# Basic Usage

Getting started with Kairos date manipulation

## Example

```typescript
import kairos from '@oxog/kairos';

// Create a date instance
const date = kairos('2024-06-15');

// Format dates
console.log(date.format('YYYY-MM-DD'));           // '2024-06-15'
console.log(date.format('MMMM Do, YYYY'));        // 'June 15th, 2024'

// Add time
const tomorrow = date.add(1, 'day');
const nextWeek = date.add(1, 'week');
const nextMonth = date.add(1, 'month');

// Subtract time
const yesterday = date.subtract(1, 'day');
const lastWeek = date.subtract(1, 'week');

// Get date components
console.log(date.year());     // 2024
console.log(date.month());    // 5 (0-indexed)
console.log(date.date());     // 15
console.log(date.day());      // 6 (Saturday)

// Check date properties
console.log(date.isWeekend());      // true
console.log(date.isLeapYear());     // true
console.log(date.daysInMonth());    // 30
```

