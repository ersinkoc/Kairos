# Date Parsing

Parsing dates from various formats

## Example

```typescript
import kairos from '@oxog/kairos';

// Parse ISO 8601 strings
const isoDate = kairos('2024-06-15T14:30:45.123Z');
console.log(isoDate.format('YYYY-MM-DD HH:mm:ss')); // 2024-06-15 14:30:45

// Parse standard date strings
const standardDate = kairos('2024/06/15');
console.log(standardDate.format('YYYY-MM-DD'));     // 2024-06-15

// Parse human-readable dates
const humanDate = kairos('June 15, 2024');
console.log(humanDate.format('YYYY-MM-DD'));        // 2024-06-15

// Parse with time
const withTime = kairos('2024-06-15 14:30');
console.log(withTime.format('YYYY-MM-DD HH:mm'));   // 2024-06-15 14:30

// Parse relative dates
const relative = kairos('yesterday');
console.log(relative.format('YYYY-MM-DD'));         // Yesterday's date

// Parse Unix timestamps
const timestamp = kairos(1718434245000); // June 15, 2024 14:30:45
console.log(timestamp.format('YYYY-MM-DD HH:mm:ss')); // 2024-06-15 14:30:45

// Parse Date objects
const dateObj = new Date(2024, 5, 15); // Note: month is 0-indexed
const fromObj = kairos(dateObj);
console.log(fromObj.format('YYYY-MM-DD'));          // 2024-06-15

// Parse arrays [year, month, day, hour, minute, second]
const fromArray = kairos([2024, 5, 15, 14, 30, 45]);
console.log(fromArray.format('YYYY-MM-DD HH:mm:ss')); // 2024-06-15 14:30:45

// Validate parsing
try {
  const invalid = kairos('invalid date');
  console.log('This will not be reached');
} catch (error) {
  console.log('Invalid date detected:', error.message);
}

// Check if parsed correctly
const parsed = kairos('2024-02-30'); // Invalid date
console.log(parsed.isValid());        // false
console.log(parsed.getErrors());      // Validation errors
```

