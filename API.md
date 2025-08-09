# Kairos API Reference

Complete API documentation for Kairos date library.

## Table of Contents

- [Core API](#core-api)
- [Constructor](#constructor)
- [Getters](#getters)
- [Setters](#setters)
- [Manipulation](#manipulation)
- [Comparison](#comparison)
- [Display](#display)
- [Query](#query)
- [Plugins](#plugins)

## Core API

### Constructor

#### `kairos(input?, format?)`

Creates a new Kairos instance.

**Parameters:**
- `input` (optional): Date input in various formats
  - `undefined`: Current date/time
  - `string`: Date string to parse
  - `number`: Unix timestamp (milliseconds)
  - `Date`: JavaScript Date object
  - `Array`: [year, month, day, hour, minute, second, ms]
  - `Object`: { year, month, day, hour, minute, second, millisecond }
- `format` (optional): Format string for parsing

**Returns:** Kairos instance

**Examples:**
```javascript
kairos()                          // Now
kairos('2024-06-15')             // ISO date
kairos(1718460600000)            // Unix timestamp
kairos(new Date())               // From Date object
kairos([2024, 5, 15])            // Array (month is 0-indexed)
kairos({ year: 2024, month: 6 }) // Object (month is 1-indexed)
```

### Getters

#### `year()`
Returns the year (4 digits).

#### `month()`
Returns the month (1-12).

#### `date()`
Returns the day of month (1-31).

#### `day()`
Returns the day of week (0-6, Sunday = 0).

#### `hour()`
Returns the hour (0-23).

#### `minute()`
Returns the minute (0-59).

#### `second()`
Returns the second (0-59).

#### `millisecond()`
Returns the millisecond (0-999).

### Setters

All setters return a new Kairos instance (immutable).

#### `year(value)`
Sets the year.

#### `month(value)`
Sets the month (1-12).

#### `date(value)`
Sets the day of month.

#### `day(value)`
Sets the day of week.

#### `hour(value)`
Sets the hour.

#### `minute(value)`
Sets the minute.

#### `second(value)`
Sets the second.

#### `millisecond(value)`
Sets the millisecond.

### Manipulation

#### `add(value, unit)`
Adds time to the date.

**Parameters:**
- `value`: Amount to add
- `unit`: Unit of time ('year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond')

**Returns:** New Kairos instance

#### `subtract(value, unit)`
Subtracts time from the date.

**Parameters:**
- `value`: Amount to subtract
- `unit`: Unit of time

**Returns:** New Kairos instance

#### `startOf(unit)`
Sets to start of specified unit.

**Parameters:**
- `unit`: Unit ('year', 'month', 'week', 'day', 'hour', 'minute', 'second')

**Returns:** New Kairos instance

#### `endOf(unit)`
Sets to end of specified unit.

**Parameters:**
- `unit`: Unit

**Returns:** New Kairos instance

#### `clone()`
Creates a copy of the instance.

**Returns:** New Kairos instance

### Comparison

#### `isBefore(date, unit?)`
Checks if date is before another.

**Parameters:**
- `date`: Date to compare with
- `unit` (optional): Granularity

**Returns:** Boolean

#### `isAfter(date, unit?)`
Checks if date is after another.

**Parameters:**
- `date`: Date to compare with
- `unit` (optional): Granularity

**Returns:** Boolean

#### `isSame(date, unit?)`
Checks if date is same as another.

**Parameters:**
- `date`: Date to compare with
- `unit` (optional): Granularity

**Returns:** Boolean

#### `isSameOrBefore(date, unit?)`
Checks if date is same or before another.

**Returns:** Boolean

#### `isSameOrAfter(date, unit?)`
Checks if date is same or after another.

**Returns:** Boolean

#### `isBetween(start, end, unit?, inclusivity?)`
Checks if date is between two dates.

**Parameters:**
- `start`: Start date
- `end`: End date
- `unit` (optional): Granularity
- `inclusivity` (optional): '()', '[]', '(]', '[)'

**Returns:** Boolean

#### `diff(date, unit?, precise?)`
Gets difference between dates.

**Parameters:**
- `date`: Date to compare with
- `unit` (optional): Unit for result
- `precise` (optional): Include decimals

**Returns:** Number

### Display

#### `format(template?)`
Formats the date.

**Parameters:**
- `template` (optional): Format string with tokens

**Returns:** String

#### `toISOString()`
Returns ISO 8601 string.

**Returns:** String

#### `toDate()`
Returns JavaScript Date object.

**Returns:** Date

#### `valueOf()`
Returns Unix timestamp (milliseconds).

**Returns:** Number

#### `toString()`
Returns string representation.

**Returns:** String

### Query

#### `isValid()`
Checks if date is valid.

**Returns:** Boolean

#### `isLeapYear()`
Checks if year is leap year.

**Returns:** Boolean

#### `daysInMonth()`
Gets days in current month.

**Returns:** Number

#### `daysInYear()`
Gets days in current year.

**Returns:** Number

## Plugin APIs

### Business Days Plugin

#### `isBusinessDay()`
Checks if date is a business day.

#### `isHoliday()`
Checks if date is a holiday.

#### `nextBusinessDay()`
Gets next business day.

#### `previousBusinessDay()`
Gets previous business day.

#### `addBusinessDays(days)`
Adds business days.

#### `subtractBusinessDays(days)`
Subtracts business days.

#### `businessDaysBetween(date)`
Counts business days between dates.

### Calendar Plugin

#### `week()`
Gets week of year.

#### `isoWeek()`
Gets ISO week of year.

#### `weekOfMonth()`
Gets week of month.

#### `quarter()`
Gets quarter (1-4).

#### `dayOfYear()`
Gets day of year.

#### `weekYear()`
Gets week year.

### Duration Plugin

#### `kairos.duration(input)`
Creates duration.

**Parameters:**
- `input`: Number (ms), Object, or ISO string

#### Duration Methods:
- `asMilliseconds()`
- `asSeconds()`
- `asMinutes()`
- `asHours()`
- `asDays()`
- `asWeeks()`
- `asMonths()`
- `asYears()`
- `humanize()`
- `toISOString()`

### Fiscal Plugin

#### `fiscalYear(config?)`
Gets fiscal year.

**Parameters:**
- `config`: { startMonth: number }

#### `fiscalQuarter(config?)`
Gets fiscal quarter.

### Holiday Plugin

#### `getHoliday()`
Gets holiday information.

**Returns:** { name, type } or null

#### `getHolidays()`
Gets all holidays for the year.

### Locale Plugin

#### `kairos.locale(name, locale)`
Registers a locale.

#### `kairos.setLocale(name)`
Sets active locale.

#### `kairos.getLocale()`
Gets active locale name.

### Parse Plugins

Enable various parsing strategies:
- ISO 8601
- RFC 2822
- Unix timestamps
- Flexible parsing

### Range Plugin

#### `kairos.range(start, end)`
Creates date range.

#### Range Methods:
- `contains(date)`
- `overlaps(range)`
- `duration()`
- `start`
- `end`

### Relative Plugin

#### `fromNow(withoutSuffix?)`
Gets relative time from now.

#### `from(date, withoutSuffix?)`
Gets relative time from date.

#### `toNow(withoutSuffix?)`
Gets relative time to now.

#### `to(date, withoutSuffix?)`
Gets relative time to date.

#### `calendar(reference?)`
Gets calendar time.

### Timezone Plugin

#### `utc()`
Converts to UTC mode.

#### `local()`
Converts to local mode.

#### `isUTC()`
Checks if in UTC mode.

#### `utcOffset(offset?)`
Gets/sets UTC offset in minutes.

## Format Tokens

| Token | Output | Description |
|-------|--------|-------------|
| **Year** | | |
| `YYYY` | 2024 | 4-digit year |
| `YY` | 24 | 2-digit year |
| **Month** | | |
| `MMMM` | January | Full month name |
| `MMM` | Jan | Short month name |
| `MM` | 01-12 | 2-digit month |
| `M` | 1-12 | Month |
| **Day** | | |
| `DD` | 01-31 | 2-digit day |
| `D` | 1-31 | Day of month |
| `Do` | 1st | Day with ordinal |
| **Weekday** | | |
| `dddd` | Monday | Full weekday |
| `ddd` | Mon | Short weekday |
| `d` | 0-6 | Day of week |
| **Hour** | | |
| `HH` | 00-23 | 2-digit hour (24h) |
| `H` | 0-23 | Hour (24h) |
| `hh` | 01-12 | 2-digit hour (12h) |
| `h` | 1-12 | Hour (12h) |
| **Minute** | | |
| `mm` | 00-59 | 2-digit minute |
| `m` | 0-59 | Minute |
| **Second** | | |
| `ss` | 00-59 | 2-digit second |
| `s` | 0-59 | Second |
| **Millisecond** | | |
| `SSS` | 000-999 | 3-digit millisecond |
| `SS` | 00-99 | 2-digit centisecond |
| `S` | 0-9 | Decisecond |
| **Period** | | |
| `A` | AM/PM | Uppercase meridiem |
| `a` | am/pm | Lowercase meridiem |
| **Quarter** | | |
| `Q` | 1-4 | Quarter |
| **Week** | | |
| `w` | 1-53 | Week of year |
| `ww` | 01-53 | 2-digit week |
| **Other** | | |
| `DDD` | 1-365 | Day of year |
| `DDDD` | 001-365 | 3-digit day of year |
| `x` | 1234567890123 | Unix ms |
| `X` | 1234567890 | Unix seconds |
| `Z` | +00:00 | Timezone offset |
| `ZZ` | +0000 | Timezone offset (no colon) |

## Type Definitions

```typescript
interface Kairos {
  // Core methods
  year(): number;
  year(value: number): Kairos;
  month(): number;
  month(value: number): Kairos;
  // ... etc
  
  // Plugin methods are added dynamically
  [key: string]: any;
}

interface KairosStatic {
  (input?: any, format?: string): Kairos;
  use(plugin: KairosPlugin): void;
  // Static plugin methods
  [key: string]: any;
}

interface KairosPlugin {
  name: string;
  install(kairos: KairosStatic, utils: any): void;
}
```