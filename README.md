# Kairos

A lightweight, zero-dependency JavaScript library for date and time manipulation with a powerful plugin architecture.

## Features

- **Zero Dependencies** - Completely self-contained with no external requirements
- **Plugin Architecture** - Load only what you need, tree-shaking friendly
- **Immutable API** - All operations return new instances
- **TypeScript Support** - Full type definitions included
- **Cross-Platform** - Works in Node.js 14+ and modern browsers
- **Lightweight** - Core ~14KB, all plugins ~112KB minified + gzipped

## Quick Start

```bash
npm install @oxog/kairos
```

```javascript
const kairos = require('@oxog/kairos');

// Current date/time
const now = kairos();

// Parse dates
const date = kairos('2024-06-15');

// Format dates
console.log(date.format('MMMM D, YYYY')); // June 15, 2024

// Date arithmetic
const tomorrow = date.add(1, 'day');
const lastWeek = date.subtract(1, 'week');

// Comparisons
console.log(date.isBefore(tomorrow)); // true
console.log(date.isAfter(lastWeek)); // true
```

## Core API

### Creating Instances

```javascript
kairos()                           // Current date/time
kairos('2024-06-15')              // ISO string
kairos(1718460600000)             // Unix timestamp (ms)
kairos([2024, 5, 15])             // Array [year, month, day]
kairos({ year: 2024, month: 6 })  // Object
```

### Manipulation

```javascript
const date = kairos('2024-06-15');

date.add(1, 'day')        // Add time
date.subtract(2, 'hours') // Subtract time
date.startOf('month')     // Beginning of month
date.endOf('year')        // End of year
date.clone()              // Create copy
```

### Comparison

```javascript
const date1 = kairos('2024-06-15');
const date2 = kairos('2024-06-20');

date1.isBefore(date2)              // true
date1.isAfter(date2)               // false
date1.isSame(date2, 'month')       // true
date1.isBetween(start, end)        // Check if between
date1.diff(date2, 'days')          // -5
```

### Display

```javascript
const date = kairos('2024-06-15 14:30:00');

date.format('YYYY-MM-DD')          // 2024-06-15
date.format('MMM D, YYYY h:mm A')  // Jun 15, 2024 2:30 PM
date.toISOString()                  // 2024-06-15T14:30:00.000Z
date.valueOf()                      // Unix timestamp (ms)
date.toDate()                       // JavaScript Date object
```

## Plugins

### Business Days

```javascript
const businessPlugin = require('@oxog/kairos/plugins/business/workday');
kairos.use(businessPlugin);

const date = kairos('2024-06-14');
date.isBusinessDay()               // true/false
date.nextBusinessDay()              // Next working day
date.addBusinessDays(5)             // Add 5 working days
date.businessDaysBetween(end)      // Count working days
```

### Duration

```javascript
const durationPlugin = require('@oxog/kairos/plugins/duration/duration');
kairos.use(durationPlugin);

const duration = kairos.duration({ hours: 2, minutes: 30 });
duration.asMinutes()                // 150
duration.humanize()                  // "3 hours"
duration.toISOString()               // "PT2H30M"
```

### Range

```javascript
const rangePlugin = require('@oxog/kairos/plugins/range/range');
kairos.use(rangePlugin);

const range = kairos.range(start, end);
range.contains(date)                // Check if date in range
range.overlaps(otherRange)          // Check overlap
range.duration()                     // Get duration
```

### Relative Time

```javascript
const relativePlugin = require('@oxog/kairos/plugins/relative/relative');
kairos.use(relativePlugin);

const past = kairos().subtract(2, 'hours');
past.fromNow()                      // "2 hours ago"
past.from(reference)                // Relative to reference
past.calendar()                     // "Today at 2:30 PM"
```

### Timezone

```javascript
const timezonePlugin = require('@oxog/kairos/plugins/timezone/timezone');
kairos.use(timezonePlugin);

const local = kairos();
const utc = local.utc();            // Convert to UTC
utc.local()                         // Back to local
local.utcOffset()                   // Offset in minutes
```

### Localization

```javascript
const enUS = require('@oxog/kairos/plugins/locale/en-US');
const deDE = require('@oxog/kairos/plugins/locale/de-DE');

kairos.locale('en-US', enUS);
kairos.locale('de-DE', deDE);

kairos.setLocale('de-DE');
const date = kairos('2024-06-15');
date.format('LLLL');                // Localized format
```

## Format Tokens

| Token | Output | Description |
|-------|--------|-------------|
| `YYYY` | 2024 | 4-digit year |
| `YY` | 24 | 2-digit year |
| `MM` | 01-12 | Month (padded) |
| `M` | 1-12 | Month |
| `MMMM` | January | Month name |
| `MMM` | Jan | Month short |
| `DD` | 01-31 | Day (padded) |
| `D` | 1-31 | Day |
| `dddd` | Monday | Weekday name |
| `ddd` | Mon | Weekday short |
| `HH` | 00-23 | Hour (24h, padded) |
| `H` | 0-23 | Hour (24h) |
| `hh` | 01-12 | Hour (12h, padded) |
| `h` | 1-12 | Hour (12h) |
| `mm` | 00-59 | Minutes (padded) |
| `m` | 0-59 | Minutes |
| `ss` | 00-59 | Seconds (padded) |
| `s` | 0-59 | Seconds |
| `SSS` | 000-999 | Milliseconds |
| `A` | AM/PM | Meridiem |
| `a` | am/pm | Meridiem (lowercase) |
| `Z` | +00:00 | Timezone offset |

## TypeScript

Kairos includes full TypeScript definitions:

```typescript
import kairos, { Kairos } from '@oxog/kairos';

const date: Kairos = kairos('2024-06-15');
const year: number = date.year();
const formatted: string = date.format('YYYY-MM-DD');
```

## Browser Usage

```html
<script src="https://unpkg.com/@oxog/kairos/dist/kairos.min.js"></script>
<script>
  const date = kairos('2024-06-15');
  console.log(date.format('MMMM D, YYYY'));
</script>
```

## Examples

See the `examples/` directory for detailed usage examples:

- `01-fundamentals.js` - Core concepts and basic operations
- `02-comparison-queries.js` - Date comparisons and queries
- `03-formatting-display.js` - Formatting options
- `04-business-calendar.js` - Business day calculations
- `05-durations-ranges.js` - Duration and range operations
- `06-localization.js` - Multi-locale support
- `07-timezone-utc.js` - Timezone handling
- `08-parsing-validation.js` - Parsing strategies
- `09-relative-time.js` - Human-readable time
- `10-advanced-plugins.js` - Complex scenarios

## Performance

Kairos is optimized for performance:

- Intelligent caching for repeated operations
- Minimal object creation
- Efficient algorithms
- Tree-shaking support for smaller bundles

## Testing

```bash
npm test           # Run all tests
npm run test:unit  # Unit tests only
npm run test:perf  # Performance tests
npm run coverage   # Coverage report
```

## License

MIT

## Contributing

See CONTRIBUTING.md for guidelines.

## Support

- Issues: [GitHub Issues](https://github.com/ersinkoc/kairos/issues)
- Documentation: [GitHub Wiki](https://github.com/ersinkoc/kairos/wiki)