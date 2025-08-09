# Migration Guide

Migrating to Kairos from other date libraries.

## From Moment.js

### Basic Usage

**Moment.js:**
```javascript
const moment = require('moment');
const now = moment();
const date = moment('2024-06-15');
```

**Kairos:**
```javascript
const kairos = require('@oxog/kairos');
const now = kairos();
const date = kairos('2024-06-15');
```

### Date Manipulation

**Moment.js:**
```javascript
date.add(1, 'days');        // Mutates
date.subtract(2, 'hours');  // Mutates
date.startOf('month');      // Mutates
```

**Kairos:**
```javascript
date.add(1, 'day');         // Returns new instance
date.subtract(2, 'hours');  // Returns new instance
date.startOf('month');      // Returns new instance
```

### Formatting

**Moment.js:**
```javascript
date.format('YYYY-MM-DD');
date.format('MMM Do YYYY');
date.toISOString();
```

**Kairos:**
```javascript
date.format('YYYY-MM-DD');
date.format('MMM D YYYY');  // Note: 'Do' requires format plugin
date.toISOString();
```

### Comparison

**Moment.js:**
```javascript
date1.isBefore(date2);
date1.isAfter(date2);
date1.isSame(date2, 'day');
date1.diff(date2, 'days');
```

**Kairos:**
```javascript
date1.isBefore(date2);
date1.isAfter(date2);
date1.isSame(date2, 'day');
date1.diff(date2, 'days');
```

### Plugins

**Moment.js:**
```javascript
// Built-in features
moment.duration(1000);
moment().fromNow();
moment().calendar();
```

**Kairos:**
```javascript
// Load plugins as needed
const durationPlugin = require('@oxog/kairos/plugins/duration/duration');
const relativePlugin = require('@oxog/kairos/plugins/relative/relative');
kairos.use(durationPlugin);
kairos.use(relativePlugin);

kairos.duration(1000);
kairos().fromNow();
kairos().calendar();
```

## From Day.js

### Basic Setup

**Day.js:**
```javascript
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);
```

**Kairos:**
```javascript
const kairos = require('@oxog/kairos');
const timezonePlugin = require('@oxog/kairos/plugins/timezone/timezone');
kairos.use(timezonePlugin);
```

### Key Differences

1. **Plugin Names**: Different plugin organization
2. **Immutability**: Both are immutable
3. **Size**: Kairos core is similar size to Day.js
4. **TypeScript**: Both have full TS support

### Common Operations

**Day.js:**
```javascript
dayjs().add(1, 'day');
dayjs().format('YYYY-MM-DD');
dayjs().startOf('month');
dayjs.utc();
```

**Kairos:**
```javascript
kairos().add(1, 'day');
kairos().format('YYYY-MM-DD');
kairos().startOf('month');
kairos.utc();
```

## From date-fns

### Function vs Object

**date-fns (functional):**
```javascript
import { format, addDays, startOfMonth } from 'date-fns';

const now = new Date();
const tomorrow = addDays(now, 1);
const formatted = format(now, 'yyyy-MM-dd');
const monthStart = startOfMonth(now);
```

**Kairos (object-oriented):**
```javascript
const kairos = require('@oxog/kairos');

const now = kairos();
const tomorrow = now.add(1, 'day');
const formatted = now.format('YYYY-MM-DD');
const monthStart = now.startOf('month');
```

### Key Advantages

1. **Chaining**: Kairos supports method chaining
2. **Parsing**: Better parsing without additional libraries
3. **Plugins**: Modular architecture
4. **Immutability**: Built-in immutable operations

### Common Conversions

| date-fns | Kairos |
|----------|--------|
| `new Date()` | `kairos()` |
| `format(date, 'yyyy-MM-dd')` | `date.format('YYYY-MM-DD')` |
| `addDays(date, 5)` | `date.add(5, 'days')` |
| `subDays(date, 5)` | `date.subtract(5, 'days')` |
| `startOfDay(date)` | `date.startOf('day')` |
| `endOfDay(date)` | `date.endOf('day')` |
| `isBefore(date1, date2)` | `date1.isBefore(date2)` |
| `isAfter(date1, date2)` | `date1.isAfter(date2)` |
| `differenceInDays(date1, date2)` | `date1.diff(date2, 'days')` |
| `isValid(date)` | `date.isValid()` |

## From Native Date

### Creating Dates

**Native Date:**
```javascript
const now = new Date();
const date = new Date('2024-06-15');
const timestamp = new Date(1718460600000);
```

**Kairos:**
```javascript
const now = kairos();
const date = kairos('2024-06-15');
const timestamp = kairos(1718460600000);
```

### Getting Components

**Native Date:**
```javascript
date.getFullYear();
date.getMonth();        // 0-11
date.getDate();
date.getDay();
date.getHours();
date.getMinutes();
date.getSeconds();
date.getMilliseconds();
```

**Kairos:**
```javascript
date.year();
date.month();          // 1-12 (more intuitive!)
date.date();
date.day();
date.hour();
date.minute();
date.second();
date.millisecond();
```

### Setting Components

**Native Date (mutates):**
```javascript
date.setFullYear(2025);
date.setMonth(5);      // June (0-indexed)
date.setDate(15);
```

**Kairos (immutable):**
```javascript
date.year(2025);       // Returns new instance
date.month(6);         // June (1-indexed)
date.date(15);         // Returns new instance
```

### Date Math

**Native Date:**
```javascript
const tomorrow = new Date(date);
tomorrow.setDate(tomorrow.getDate() + 1);

const nextMonth = new Date(date);
nextMonth.setMonth(nextMonth.getMonth() + 1);
```

**Kairos:**
```javascript
const tomorrow = date.add(1, 'day');
const nextMonth = date.add(1, 'month');
```

## Migration Checklist

### Step 1: Install Kairos
```bash
npm install @oxog/kairos
```

### Step 2: Update Imports
```javascript
// Old
const moment = require('moment');
const dayjs = require('dayjs');
import { format } from 'date-fns';

// New
const kairos = require('@oxog/kairos');
```

### Step 3: Load Required Plugins
```javascript
// Identify features you use and load corresponding plugins
const businessPlugin = require('@oxog/kairos/plugins/business/workday');
const durationPlugin = require('@oxog/kairos/plugins/duration/duration');
const relativePlugin = require('@oxog/kairos/plugins/relative/relative');

kairos.use(businessPlugin);
kairos.use(durationPlugin);
kairos.use(relativePlugin);
```

### Step 4: Update Method Calls
- Change mutation patterns to immutable
- Update method names where different
- Adjust month indexing if coming from native Date

### Step 5: Update Format Strings
- Review format tokens for differences
- Update locale-specific formats

### Step 6: Test Thoroughly
- Run existing tests
- Check edge cases
- Verify timezone handling
- Test locale-specific features

## Common Gotchas

### 1. Month Indexing
- Native Date: 0-11
- Moment/Day.js: 0-11 in arrays, 1-12 in objects
- **Kairos: Always 1-12** (more intuitive)

### 2. Immutability
- Moment.js mutates by default
- **Kairos always returns new instances**

### 3. Plugin Loading
- Moment.js/Day.js: Some features built-in
- **Kairos: Load only what you need**

### 4. Format Tokens
- Small differences in token names
- Check the format token reference

### 5. Timezone Handling
- Different approach than Moment.js zones
- Simpler than date-fns-tz

## Performance Comparison

| Library | Core Size | With Features | Tree-shaking |
|---------|-----------|---------------|--------------|
| Moment.js | 67KB | 232KB | No |
| Day.js | 7KB | ~20KB | Limited |
| date-fns | N/A | Varies | Yes |
| **Kairos** | **14KB** | **~112KB** | **Yes** |

## Getting Help

- Check the [API documentation](./API.md)
- Review [examples](./examples/)
- Open an [issue](https://github.com/ersinkoc/kairos/issues)
- Read the [FAQ](#faq)

## FAQ

**Q: Can I use Kairos with React/Vue/Angular?**
A: Yes, Kairos works with all JavaScript frameworks.

**Q: Is Kairos compatible with Moment.js plugins?**
A: No, but equivalent Kairos plugins are available.

**Q: How do I handle timezones?**
A: Use the timezone plugin for UTC/local conversions.

**Q: Can I extend Kairos with custom plugins?**
A: Yes, see the plugin development guide.

**Q: Is Kairos production-ready?**
A: Yes, with comprehensive tests and stable API.