# Kairos API Documentation

A comprehensive date and time manipulation library with a powerful plugin system.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Core API](#core-api)
  - [Constructor](#constructor)
  - [Getters and Setters](#getters-and-setters)
  - [Date Manipulation](#date-manipulation)
  - [Comparison](#comparison)
  - [Formatting](#formatting)
  - [Conversion](#conversion)
- [Plugin System](#plugin-system)
- [Built-in Plugins](#built-in-plugins)
  - [Duration Plugin](#duration-plugin)
  - [Range Plugin](#range-plugin)
  - [Business Day Plugin](#business-day-plugin)
  - [Holiday Plugin](#holiday-plugin)
  - [Calendar Plugin](#calendar-plugin)
  - [Relative Time Plugin](#relative-time-plugin)
- [Localization](#localization)
- [TypeScript Support](#typescript-support)

## Installation

```bash
npm install @oxog/kairos
```

## Basic Usage

```typescript
import kairos from '@oxog/kairos';

// Create instances
const now = kairos();
const specific = kairos('2024-01-15');
const fromTimestamp = kairos(1640995200000);

// Manipulate dates
const tomorrow = now.add(1, 'day');
const nextMonth = specific.add(1, 'month');

// Format dates
console.log(now.format('YYYY-MM-DD HH:mm:ss'));
console.log(specific.format('DD/MM/YYYY'));
```

## Core API

### Constructor

```typescript
kairos(input?: KairosInput): KairosInstance
```

Creates a new Kairos instance from various input types:

- `undefined` - Current date/time
- `Date` - JavaScript Date object
- `number` - Timestamp (milliseconds since Unix epoch)
- `string` - Date string (ISO 8601, YYYY-MM-DD, etc.)
- `KairosInstance` - Another Kairos instance

**Examples:**

```typescript
kairos();                    // Current date/time
kairos(new Date());          // From Date object
kairos(1640995200000);       // From timestamp
kairos('2024-01-01');        // From date string
kairos('2024-01-01T12:00');  // From datetime string
```

### Getters and Setters

All getters return the current value when called without arguments, or a new instance when called with a value.

#### year(value?: number): number | KairosInstance

Gets or sets the year (1-9999).

```typescript
const date = kairos('2024-06-15');
console.log(date.year()); // 2024
const newYear = date.year(2025);
console.log(newYear.year()); // 2025
```

#### month(value?: number): number | KairosInstance

Gets or sets the month (1-12, where 1 = January).

```typescript
const date = kairos('2024-06-15');
console.log(date.month()); // 6 (June)
const december = date.month(12);
console.log(december.month()); // 12 (December)
```

#### date(value?: number): number | KairosInstance

Gets or sets the day of month (1-31).

```typescript
const date = kairos('2024-06-15');
console.log(date.date()); // 15
const day25 = date.date(25);
console.log(day25.date()); // 25
```

#### day(): number

Gets the day of the week (0-6, where 0 = Sunday, 1 = Monday, ..., 6 = Saturday).

```typescript
const date = kairos('2024-06-17'); // Monday
console.log(date.day()); // 1
```

#### hour(value?: number): number | KairosInstance

Gets or sets the hour (0-23).

```typescript
const date = kairos('2024-06-15T14:30:00');
console.log(date.hour()); // 14
const morning = date.hour(9);
console.log(morning.hour()); // 9
```

#### minute(value?: number): number | KairosInstance

Gets or sets the minute (0-59).

```typescript
const date = kairos('2024-06-15T14:30:00');
console.log(date.minute()); // 30
const quarter = date.minute(15);
console.log(quarter.minute()); // 15
```

#### second(value?: number): number | KairosInstance

Gets or sets the second (0-59).

```typescript
const date = kairos('2024-06-15T14:30:25');
console.log(date.second()); // 25
const precise = date.second(0);
console.log(precise.second()); // 0
```

#### millisecond(value?: number): number | KairosInstance

Gets or sets the millisecond (0-999).

```typescript
const date = kairos('2024-06-15T14:30:25.123');
console.log(date.millisecond()); // 123
const rounded = date.millisecond(0);
console.log(rounded.millisecond()); // 0
```

### Date Manipulation

#### add(amount: number, unit: string): KairosInstance

Adds the specified amount of time to the date. Returns a new instance.

**Units:** `year`, `month`, `week`, `day`, `hour`, `minute`, `second`, `millisecond`  
**Unit Aliases:** `y`, `M`, `w`, `d`, `h`, `m`, `s`, `ms`

```typescript
const date = kairos('2024-01-15');
const nextWeek = date.add(1, 'week');
const nextMonth = date.add(2, 'months');
const yesterday = date.add(-1, 'day'); // Negative amounts subtract
```

#### subtract(amount: number, unit: string): KairosInstance

Subtracts the specified amount of time from the date.

```typescript
const date = kairos('2024-01-15');
const lastWeek = date.subtract(1, 'week');
const twoMonthsAgo = date.subtract(2, 'months');
```

#### startOf(unit: string): KairosInstance

Returns a new instance set to the start of the specified time unit.

```typescript
const date = kairos('2024-06-15T14:30:45.123');
console.log(date.startOf('year'));   // 2024-01-01T00:00:00.000
console.log(date.startOf('month'));  // 2024-06-01T00:00:00.000
console.log(date.startOf('day'));    // 2024-06-15T00:00:00.000
console.log(date.startOf('hour'));   // 2024-06-15T14:00:00.000
```

#### endOf(unit: string): KairosInstance

Returns a new instance set to the end of the specified time unit.

```typescript
const date = kairos('2024-06-15T14:30:45.123');
console.log(date.endOf('year'));   // 2024-12-31T23:59:59.999
console.log(date.endOf('month'));  // 2024-06-30T23:59:59.999
console.log(date.endOf('day'));    // 2024-06-15T23:59:59.999
console.log(date.endOf('hour'));   // 2024-06-15T14:59:59.999
```

### Comparison

#### isBefore(other: KairosInstance): boolean

Checks if this date is before another date.

```typescript
const date1 = kairos('2024-01-01');
const date2 = kairos('2024-01-02');
console.log(date1.isBefore(date2)); // true
console.log(date2.isBefore(date1)); // false
```

#### isAfter(other: KairosInstance): boolean

Checks if this date is after another date.

```typescript
const date1 = kairos('2024-01-01');
const date2 = kairos('2024-01-02');
console.log(date2.isAfter(date1)); // true
console.log(date1.isAfter(date2)); // false
```

#### isSame(other: KairosInstance): boolean

Checks if this date is the same as another date (same timestamp).

```typescript
const date1 = kairos('2024-01-01T12:00:00');
const date2 = kairos('2024-01-01T12:00:00');
const date3 = kairos('2024-01-01T12:00:01');
console.log(date1.isSame(date2)); // true
console.log(date1.isSame(date3)); // false
```

### Formatting

#### format(template?: string): string

Formats the date according to the specified template. Default: `'YYYY-MM-DD'`

**Format Tokens:**
- `YYYY` - 4-digit year
- `MM` - 2-digit month (01-12)
- `DD` - 2-digit day of month (01-31)
- `HH` - 2-digit hour (00-23)
- `mm` - 2-digit minute (00-59)
- `ss` - 2-digit second (00-59)

```typescript
const date = kairos('2024-06-15T14:30:25');
console.log(date.format());                    // '2024-06-15'
console.log(date.format('YYYY-MM-DD HH:mm'));  // '2024-06-15 14:30'
console.log(date.format('DD/MM/YYYY'));        // '15/06/2024'
console.log(date.format('HH:mm:ss'));          // '14:30:25'
```

### Conversion

#### toDate(): Date

Returns a native JavaScript Date object.

```typescript
const kairos = kairos('2024-01-01');
const nativeDate = kairos.toDate();
console.log(nativeDate instanceof Date); // true
```

#### toISOString(): string

Returns the ISO 8601 string representation.

```typescript
const date = kairos('2024-01-01T12:00:00');
console.log(date.toISOString()); // '2024-01-01T12:00:00.000Z'
```

#### valueOf(): number

Returns the primitive numeric value (timestamp).

```typescript
const date = kairos('2024-01-01');
console.log(date.valueOf()); // 1704067200000
```

#### clone(): KairosInstance

Creates a new instance with the same date/time.

```typescript
const original = kairos('2024-01-01');
const copy = original.clone();
console.log(original.valueOf() === copy.valueOf()); // true
console.log(original === copy); // false (different instances)
```

## Plugin System

Kairos uses a powerful plugin system for extending functionality.

### Installing Plugins

```typescript
import kairos from '@oxog/kairos';
import businessPlugin from '@oxog/kairos/plugins/business';
import holidayPlugin from '@oxog/kairos/plugins/holidays';

// Install single plugin
kairos.use(businessPlugin);

// Install multiple plugins
kairos.use([businessPlugin, holidayPlugin]);

// Now use extended functionality
const date = kairos('2024-01-15');
console.log(date.isBusinessDay());
```

### Static Methods

Plugins can add static methods to the main kairos object:

```typescript
// Added by business plugin
const businessDays = kairos.getBusinessDaysInMonth(2024, 1);

// Added by duration plugin
const duration = kairos.duration('P1Y2M3DT4H5M6S');
```

## Built-in Plugins

### Duration Plugin

Provides duration support with ISO 8601 parsing and arithmetic operations.

```typescript
import durationPlugin from '@oxog/kairos/plugins/duration';
kairos.use(durationPlugin);

// Create durations
const dur1 = kairos.duration(5000);                      // 5 seconds
const dur2 = kairos.duration('P1Y2M3DT4H5M6S');          // ISO 8601
const dur3 = kairos.duration({ hours: 2, minutes: 30 }); // Object format

// Duration arithmetic
const sum = dur1.add(dur2);
const diff = dur3.subtract(dur1);
const doubled = dur2.multiply(2);

// Use with dates
const date = kairos('2024-01-01');
const later = date.addDuration(dur3);
const duration = date.duration(later);
```

### Range Plugin

Provides date range functionality with iteration and filtering.

```typescript
import rangePlugin from '@oxog/kairos/plugins/range';
kairos.use(rangePlugin);

// Create ranges
const start = kairos('2024-01-01');
const end = kairos('2024-01-31');
const range = start.range(end);

// Iterate over dates
for (const date of range) {
  console.log(date.format('YYYY-MM-DD'));
}

// Filter dates
const weekends = range.filter(date => date.day() === 0 || date.day() === 6);
const businessDays = range.businessDays();
const mondays = range.weekday(1);

// Range operations
const overlapping = range1.intersection(range2);
const combined = range1.union(range2);
const contains = range.includes(someDate);
```

### Business Day Plugin

Provides business day calculations with configurable weekends and holidays.

```typescript
import businessPlugin from '@oxog/kairos/plugins/business';
kairos.use(businessPlugin);

const date = kairos('2024-01-12'); // Friday

// Business day checks
console.log(date.isBusinessDay());    // true
console.log(date.isWeekend());        // false

// Navigation
const nextBusiness = date.nextBusinessDay();     // Tuesday (skips MLK Day)
const prevBusiness = date.previousBusinessDay(); // Thursday

// Arithmetic
const plus5Business = date.addBusinessDays(5);
const businessCount = date.businessDaysBetween(nextBusiness);

// Settlement dates (T+N)
const t1Settlement = date.settlementDate(1);
const t3Settlement = date.settlementDate(3);

// Static methods
const businessDays = kairos.getBusinessDaysInMonth(2024, 1);
const nthBusinessDay = kairos.getNthBusinessDay(2024, 1, 15);
const lastBusinessDay = kairos.getLastBusinessDay(2024, 1);
```

### Holiday Plugin

Provides comprehensive holiday support with multiple calculation types.

```typescript
import holidayPlugin from '@oxog/kairos/plugins/holidays';
kairos.use(holidayPlugin);

const date = kairos('2024-07-04');

// Holiday checks
console.log(date.isHoliday());          // true (Independence Day)
console.log(date.isNationalHoliday());  // true
console.log(date.isReligiousHoliday()); // false

// Get holiday information
const holidays = date.getHolidays();
const holiday = date.getHoliday();
console.log(holiday.name); // "Independence Day"

// Navigation
const nextHoliday = date.nextHoliday();
const prevHoliday = date.previousHoliday();

// Holiday types supported:
// - Fixed dates (New Year's Day, Christmas, etc.)
// - Nth weekday (MLK Day, Presidents Day, etc.)
// - Easter-based (Good Friday, Easter Monday, etc.)
// - Lunar calendar (Chinese New Year, etc.)
// - Relative holidays (Black Friday, etc.)
```

### Calendar Plugin

Provides calendar-related functionality like quarters, week numbers, etc.

```typescript
import calendarPlugin from '@oxog/kairos/plugins/calendar';
kairos.use(calendarPlugin);

const date = kairos('2024-06-15');

// Calendar information
console.log(date.quarter());        // 2 (Q2)
console.log(date.weekOfYear());     // 24
console.log(date.dayOfYear());      // 167
console.log(date.weeksInYear());    // 52

// Navigation
const startOfQuarter = date.startOf('quarter');
const endOfQuarter = date.endOf('quarter');
const quarterStart = date.startOfQuarter();
const quarterEnd = date.endOfQuarter();

// Week calculations
const weekStart = date.startOfWeek();  // Sunday by default
const weekEnd = date.endOfWeek();      // Saturday by default
const isoWeek = date.isoWeek();        // ISO week number
```

### Relative Time Plugin

Provides human-readable relative time functionality.

```typescript
import relativeTimePlugin from '@oxog/kairos/plugins/relative-time';
kairos.use(relativeTimePlugin);

const date = kairos('2024-01-01');

// Relative to now
console.log(date.fromNow());  // "2 months ago" (example)
console.log(date.toNow());    // "in 2 months" (example)

// Custom relative time
const other = kairos('2024-06-01');
console.log(date.from(other)); // "5 months ago"
console.log(date.to(other));   // "in 5 months"

// Humanized durations
const duration = kairos.duration({ hours: 2, minutes: 30 });
console.log(duration.humanize()); // "2 hours, 30 minutes"
```

## Localization

Kairos supports multiple locales with country-specific holidays and formatting.

```typescript
import localeUS from '@oxog/kairos/plugins/locale/en-US';
import localeDE from '@oxog/kairos/plugins/locale/de-DE';
import localeTR from '@oxog/kairos/plugins/locale/tr-TR';
import localeJP from '@oxog/kairos/plugins/locale/ja-JP';

kairos.use([localeUS, localeDE, localeTR, localeJP]);

// Set locale
kairos.locale('en-US');

const date = kairos('2024-01-15');

// Locale-specific holidays
console.log(date.isHoliday()); // true (Martin Luther King Jr. Day in US)

// Switch locale
kairos.locale('de-DE');
console.log(date.isHoliday()); // false (not a holiday in Germany)

// Locale-specific formatting (with extended formatting plugins)
kairos.locale('en-US');
console.log(date.format('L'));  // "01/15/2024" (US format)

kairos.locale('de-DE');
console.log(date.format('L'));  // "15.01.2024" (German format)
```

### Available Locales

- **en-US** - United States (Federal holidays)
- **de-DE** - Germany (German public holidays)
- **tr-TR** - Turkey (Turkish national and religious holidays)
- **ja-JP** - Japan (Japanese national holidays)

## TypeScript Support

Kairos is built with TypeScript and provides comprehensive type definitions.

```typescript
import kairos, { KairosInstance, Duration, DateRange } from '@oxog/kairos';
import type { KairosPlugin, BusinessDayConfig } from '@oxog/kairos/types';

// Type-safe usage
const date: KairosInstance = kairos('2024-01-01');
const duration: Duration = kairos.duration({ hours: 2 });
const range: DateRange = date.range(date.add(1, 'month'));

// Plugin development
const myPlugin: KairosPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install(kairos, utils) {
    kairos.extend({
      myMethod(): string {
        return 'Hello from my plugin!';
      }
    });
  }
};

// Configuration types
const config: BusinessDayConfig = {
  weekends: [0, 6],
  holidays: [
    {
      id: 'new-year',
      name: 'New Year',
      type: 'fixed',
      rule: { month: 1, day: 1 }
    }
  ]
};
```

## Advanced Usage

### Custom Plugins

Create your own plugins to extend Kairos functionality:

```typescript
import type { KairosPlugin } from '@oxog/kairos/types';

const myPlugin: KairosPlugin = {
  name: 'my-awesome-plugin',
  version: '1.0.0',
  size: 1024, // Optional: bundle size in bytes
  dependencies: ['other-plugin'], // Optional: plugin dependencies
  
  install(kairos, utils) {
    // Extend instance methods
    kairos.extend({
      isAwesome(): boolean {
        return true;
      },
      
      getAwesomeDate(): KairosInstance {
        return this.add(1, 'year');
      }
    });
    
    // Add static methods
    kairos.addStatic?.({
      createAwesome(): KairosInstance {
        return kairos('2024-01-01');
      }
    });
  }
};

kairos.use(myPlugin);

// Use your plugin
const date = kairos();
console.log(date.isAwesome()); // true
const awesome = kairos.createAwesome();
```

### Performance Tips

1. **Use caching** - Business day calculations are cached automatically
2. **Avoid repeated parsing** - Store parsed instances rather than strings
3. **Use appropriate precision** - Don't use millisecond precision if not needed
4. **Batch operations** - Use ranges for multiple date operations

```typescript
// Good: Parse once, use many times
const baseDate = kairos('2024-01-01');
const dates = Array.from({ length: 100 }, (_, i) => 
  baseDate.add(i, 'days')
);

// Better: Use ranges for iteration
const range = baseDate.range(baseDate.add(100, 'days'));
const businessDays = range.businessDays();

// Good: Cache business day calculator
const calculator = kairos.createBusinessDayCalculator({
  weekends: [0, 6],
  holidays: myHolidays
});
```

---

*This documentation covers the core API and built-in plugins. For more examples and advanced usage, see the [examples](../examples/) directory.*