# Getting Started with Kairos

## Installation

### NPM
```bash
npm install @oxog/kairos
```

### Yarn
```bash
yarn add @oxog/kairos
```

### CDN
```html
<script src="https://unpkg.com/@oxog/kairos/dist/kairos.umd.min.js"></script>
```

## Basic Import

### ES Modules
```javascript
import kairos from '@oxog/kairos';

const now = kairos();
console.log(now.format('YYYY-MM-DD'));
```

### CommonJS
```javascript
const kairos = require('@oxog/kairos').default;

const now = kairos();
console.log(now.format('YYYY-MM-DD'));
```

### Browser Global
```html
<script src="https://unpkg.com/@oxog/kairos/dist/kairos.umd.min.js"></script>
<script>
  const now = window.kairos();
  console.log(now.format('YYYY-MM-DD'));
</script>
```

## Core Concepts

### 1. Immutable Operations
All Kairos operations return new instances, never modifying the original:

```javascript
const original = kairos('2024-01-01');
const modified = original.add(1, 'month');

console.log(original.format('YYYY-MM-DD')); // "2024-01-01" - unchanged
console.log(modified.format('YYYY-MM-DD')); // "2024-02-01" - new instance
```

### 2. Plugin System
Kairos uses a modular plugin system. Load only what you need:

```javascript
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration';
import businessPlugin from '@oxog/kairos/plugins/business/workday';

// Load plugins
kairos.use([durationPlugin, businessPlugin]);

// Now you can use plugin features
const duration = kairos.duration({ hours: 2, minutes: 30 });
console.log(duration.humanize()); // "2 hours, 30 minutes"
```

### 3. TypeScript Support
Kairos is built with TypeScript and includes full type definitions:

```typescript
import kairos, { KairosDate } from '@oxog/kairos';

const date: KairosDate = kairos('2024-01-01');
const formatted: string = date.format('YYYY-MM-DD');
```

## Quick Examples

### Date Creation
```javascript
// Current time
const now = kairos();

// From string
const date1 = kairos('2024-01-01');
const date2 = kairos('2024-01-01 15:30:00');

// From timestamp
const date3 = kairos(1640995200000);

// UTC dates
const utc = kairos.utc('2024-01-01 12:00:00');
```

### Formatting
```javascript
const date = kairos('2024-01-15 14:30:45');

console.log(date.format()); // "2024-01-15" (default)
console.log(date.format('YYYY-MM-DD HH:mm:ss')); // "2024-01-15 14:30:45"
console.log(date.format('MM/DD/YYYY')); // "01/15/2024"
console.log(date.format('DD.MM.YYYY')); // "15.01.2024"
```

### Date Arithmetic
```javascript
const date = kairos('2024-01-01');

console.log(date.add(1, 'day').format());    // "2024-01-02"
console.log(date.add(1, 'week').format());   // "2024-01-08"
console.log(date.add(1, 'month').format());  // "2024-02-01"
console.log(date.add(1, 'year').format());   // "2025-01-01"

console.log(date.subtract(1, 'day').format()); // "2023-12-31"
```

### Comparisons
```javascript
const date1 = kairos('2024-01-01');
const date2 = kairos('2024-01-15');

console.log(date1.isBefore(date2)); // true
console.log(date2.isAfter(date1));  // true
console.log(date1.isSame(date1));   // true

// Same with granularity
console.log(date1.isSame(date2, 'month')); // true
console.log(date1.isSame(date2, 'day'));   // false
```

### Validation
```javascript
const valid = kairos('2024-01-01');
const invalid = kairos('invalid-date');

console.log(valid.isValid());   // true
console.log(invalid.isValid()); // false

// Safe operations
if (date.isValid()) {
  console.log(date.format('YYYY-MM-DD'));
}
```

## Next Steps

- [Basic Usage Guide](./basic-usage.md)
- [Plugin System Overview](./plugins/overview.md)
- [API Reference](../API.md)
- [Examples](./examples/basic.md)