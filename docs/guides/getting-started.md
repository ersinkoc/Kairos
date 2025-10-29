# Getting Started with Kairos

## Installation

```bash
npm install @oxog/kairos
```

## Basic Usage

### Creating Date Instances

```typescript
import kairos from '@oxog/kairos';

// Current date and time
const now = kairos();

// From string
const date = kairos('2024-06-15');

// From Date object
const fromDate = kairos(new Date());

// From components
const fromComponents = kairos({ year: 2024, month: 5, day: 15 });
```

### Formatting Dates

```typescript
const date = kairos('2024-06-15');

// Standard formats
console.log(date.format('YYYY-MM-DD'));        // 2024-06-15
console.log(date.format('MMMM Do, YYYY'));     // June 15th, 2024

// Custom formats
console.log(date.format('[Today is] dddd'));   // Today is Saturday
```

### Date Manipulation

```typescript
const date = kairos('2024-06-15');

// Add time
const tomorrow = date.add(1, 'day');
const nextWeek = date.add(1, 'week');
const nextMonth = date.add(1, 'month');

// Subtract time
const yesterday = date.subtract(1, 'day');
const lastWeek = date.subtract(1, 'week');

// Chain operations
const result = date.add(1, 'month').subtract(2, 'days');
```

## Using Plugins

```typescript
import kairos from '@oxog/kairos';
import businessDaysPlugin from '@oxog/kairos/plugins/business';
import holidayPlugin from '@oxog/kairos/plugins/holiday';

// Load plugins
kairos.use(businessDaysPlugin);
kairos.use(holidayPlugin);

// Use plugin features
const date = kairos('2024-06-15');
console.log(date.isBusinessDay()); // true/false
console.log(date.isHoliday());     // true/false
```

## Next Steps

- Check out the [API Reference](../api/README.md)
- Browse [Examples](../examples/README.md)
- Learn about [Plugin Development](plugin-development.md)
- Read [Best Practices](best-practices.md)
