# Basic Usage Guide

## Date Creation

### Current Date/Time
```javascript
import kairos from '@oxog/kairos';

// Current local time
const now = kairos();

// Current UTC time
const utcNow = kairos.utc();
```

### From String
```javascript
// ISO format (recommended)
const date1 = kairos('2024-01-15');
const date2 = kairos('2024-01-15T14:30:00');
const date3 = kairos('2024-01-15T14:30:00Z');

// Various formats (with parsing plugins)
const date4 = kairos('01/15/2024');
const date5 = kairos('15.01.2024');
const date6 = kairos('January 15, 2024');
```

### From Timestamp
```javascript
// Unix timestamp (milliseconds)
const date1 = kairos(1640995200000);

// Unix timestamp (seconds) - use unix helper
const date2 = kairos.unix(1640995200);
```

### From Object
```javascript
const date = kairos({
  year: 2024,
  month: 1,    // 1-indexed (January = 1)
  day: 15,
  hour: 14,
  minute: 30,
  second: 45
});
```

## Date Components

### Getting Values
```javascript
const date = kairos('2024-01-15 14:30:45');

console.log(date.year());        // 2024
console.log(date.month());       // 1 (January)
console.log(date.date());        // 15
console.log(date.day());         // 1 (Monday, 0=Sunday)
console.log(date.hour());        // 14
console.log(date.minute());      // 30
console.log(date.second());      // 45
console.log(date.millisecond()); // 0
```

### Setting Values
```javascript
const date = kairos('2024-01-15 14:30:45');

// All setters return new instances
const newDate = date
  .year(2025)
  .month(6)
  .date(20)
  .hour(10)
  .minute(15)
  .second(30);

console.log(newDate.format()); // "2025-06-20T10:15:30"
```

## Formatting

### Common Patterns
```javascript
const date = kairos('2024-01-15 14:30:45');

// Default
console.log(date.format()); // "2024-01-15"

// Common formats
console.log(date.format('YYYY-MM-DD')); // "2024-01-15"
console.log(date.format('YYYY-MM-DD HH:mm:ss')); // "2024-01-15 14:30:45"
console.log(date.format('MM/DD/YYYY')); // "01/15/2024"
console.log(date.format('DD.MM.YYYY')); // "15.01.2024"
```

### Format Tokens
| Token | Output | Description |
|-------|--------|-------------|
| YYYY | 2024 | 4-digit year |
| MM | 01 | 2-digit month |
| DD | 15 | 2-digit date |
| HH | 14 | 2-digit hour (24h) |
| mm | 30 | 2-digit minute |
| ss | 45 | 2-digit second |
| SSS | 000 | 3-digit millisecond |

### Custom Formatting
```javascript
const date = kairos('2024-01-15 14:30:45');

// With text
console.log(date.format('[Today is] YYYY-MM-DD')); 
// "Today is 2024-01-15"

// File naming
console.log(date.format('backup_YYYYMMDD_HHmmss'));
// "backup_20240115_143045"
```

## Date Arithmetic

### Adding Time
```javascript
const date = kairos('2024-01-01');

// Add different units
console.log(date.add(1, 'day').format());    // "2024-01-02"
console.log(date.add(1, 'week').format());   // "2024-01-08"
console.log(date.add(1, 'month').format());  // "2024-02-01"
console.log(date.add(1, 'year').format());   // "2025-01-01"

// Add hours/minutes
console.log(date.add(2, 'hours').format('HH:mm'));   // "02:00"
console.log(date.add(30, 'minutes').format('HH:mm')); // "00:30"
```

### Subtracting Time
```javascript
const date = kairos('2024-01-15');

console.log(date.subtract(1, 'day').format());   // "2024-01-14"
console.log(date.subtract(1, 'week').format());  // "2024-01-08"
console.log(date.subtract(1, 'month').format()); // "2023-12-15"
```

### Method Chaining
```javascript
const result = kairos('2024-01-01')
  .add(1, 'month')
  .add(15, 'days')
  .subtract(2, 'hours')
  .format('YYYY-MM-DD HH:mm');

console.log(result); // "2024-02-15 22:00"
```

## Date Comparisons

### Basic Comparisons
```javascript
const date1 = kairos('2024-01-01');
const date2 = kairos('2024-01-15');

console.log(date1.isBefore(date2)); // true
console.log(date2.isAfter(date1));  // true
console.log(date1.isSame(date1));   // true
```

### Granular Comparisons
```javascript
const date1 = kairos('2024-01-15 10:00:00');
const date2 = kairos('2024-01-15 15:00:00');

console.log(date1.isSame(date2));           // false (different times)
console.log(date1.isSame(date2, 'day'));    // true (same day)
console.log(date1.isSame(date2, 'month'));  // true (same month)
console.log(date1.isSame(date2, 'year'));   // true (same year)
```

### Combined Comparisons
```javascript
const date = kairos('2024-01-15');
const reference = kairos('2024-01-15');

// Same or before
const isSameOrBefore = date.isSame(reference) || date.isBefore(reference);

// Same or after  
const isSameOrAfter = date.isSame(reference) || date.isAfter(reference);

// Between dates
const start = kairos('2024-01-01');
const end = kairos('2024-12-31');
const isBetween = date.isAfter(start) && date.isBefore(end);
```

## Period Operations

### Start/End of Period
```javascript
const date = kairos('2024-01-15 14:30:45');

// Start of periods
console.log(date.startOf('year').format());   // "2024-01-01 00:00:00"
console.log(date.startOf('month').format());  // "2024-01-01 00:00:00"
console.log(date.startOf('week').format());   // "2024-01-14 00:00:00"
console.log(date.startOf('day').format());    // "2024-01-15 00:00:00"

// End of periods
console.log(date.endOf('day').format());      // "2024-01-15 23:59:59.999"
console.log(date.endOf('month').format());    // "2024-01-31 23:59:59.999"
console.log(date.endOf('year').format());     // "2024-12-31 23:59:59.999"
```

## Validation

### Basic Validation
```javascript
const valid = kairos('2024-01-15');
const invalid = kairos('not-a-date');

console.log(valid.isValid());   // true
console.log(invalid.isValid()); // false
```

### Safe Operations
```javascript
function safeFormat(dateString) {
  const date = kairos(dateString);
  
  if (!date.isValid()) {
    return 'Invalid date';
  }
  
  return date.format('YYYY-MM-DD');
}

console.log(safeFormat('2024-01-15')); // "2024-01-15"
console.log(safeFormat('invalid'));    // "Invalid date"
```

## Cloning

### Creating Copies
```javascript
const original = kairos('2024-01-15');
const copy = original.clone();

// Modifications don't affect original
const modified = copy.add(1, 'day');

console.log(original.format()); // "2024-01-15" (unchanged)
console.log(modified.format()); // "2024-01-16"
```

## Conversion

### To Native Objects
```javascript
const date = kairos('2024-01-15 14:30:45');

// To JavaScript Date
const jsDate = date.toDate();

// To ISO string
const isoString = date.toISOString();

// To timestamp
const timestamp = date.valueOf(); // or date.getTime()

// To Unix timestamp (seconds)
const unixSeconds = Math.floor(timestamp / 1000);
```

## Best Practices

### 1. Always Check Validity
```javascript
const date = kairos(userInput);
if (!date.isValid()) {
  throw new Error('Invalid date input');
}
```

### 2. Use Immutable Operations
```javascript
// Good - creates new instance
const tomorrow = today.add(1, 'day');

// Avoid mutation patterns from other libraries
```

### 3. Chain Operations Efficiently
```javascript
// Good - single chain
const result = kairos('2024-01-01')
  .add(1, 'month')
  .startOf('month')
  .format('YYYY-MM-DD');

// Less efficient - multiple assignments
const date = kairos('2024-01-01');
const withMonth = date.add(1, 'month');
const startOfMonth = withMonth.startOf('month');
const formatted = startOfMonth.format('YYYY-MM-DD');
```

### 4. Use Appropriate Granularity
```javascript
// When you only need date comparison
if (date1.isSame(date2, 'day')) {
  // More efficient than millisecond precision
}
```

## Next Steps

- [Plugin System Overview](./plugins/overview.md)
- [Advanced Examples](./examples/advanced.md)
- [API Reference](../API.md)