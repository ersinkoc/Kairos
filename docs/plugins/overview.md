# Plugin System Overview

Kairos uses a modular plugin architecture that allows you to load only the features you need, keeping bundle sizes minimal and performance optimal.

## Core Concepts

### 1. Modular Design
- **Core**: Essential date operations (creation, formatting, arithmetic, comparisons)
- **Plugins**: Extended functionality (durations, business days, holidays, etc.)
- **Tree Shaking**: Unused plugins are automatically excluded from your bundle

### 2. Plugin Types
- **Instance Methods**: Add methods to date instances (e.g., `date.addBusinessDays()`)
- **Static Methods**: Add methods to the main kairos object (e.g., `kairos.duration()`)
- **Utilities**: Internal functionality used by other plugins

### 3. Dependency Management
- Plugins can depend on other plugins
- Dependencies are automatically validated
- Clear error messages for missing dependencies

## Loading Plugins

### Single Plugin
```javascript
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';

kairos.use(durationPlugin);

// Now you can use duration features
const duration = kairos.duration({ hours: 2, minutes: 30 });
```

### Multiple Plugins
```javascript
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';
import businessPlugin from '@oxog/kairos/plugins/business/workday';

// Load multiple plugins at once
kairos.use([durationPlugin, businessPlugin]);

// Or load them individually
kairos.use(durationPlugin);
kairos.use(businessPlugin);
```

### Plugin Dependencies
Some plugins depend on others. Kairos will automatically validate dependencies:

```javascript
import kairos from '@oxog/kairos';
import businessPlugin from '@oxog/kairos/plugins/business/workday';

// This will fail because business plugin requires holiday-engine
kairos.use(businessPlugin);
// Error: Plugin business-workday depends on holiday-engine which is not installed

// Load dependencies first
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';
kairos.use(holidayEngine);
kairos.use(businessPlugin); // Now works
```

## Available Plugins

### Core Plugins

#### Duration Plugin
Adds duration support for time calculations.

```javascript
import durationPlugin from '@oxog/kairos/plugins/duration/duration';
kairos.use(durationPlugin);

const duration = kairos.duration({ hours: 2, minutes: 30 });
console.log(duration.humanize()); // "2 hours, 30 minutes"
```

**Methods Added:**
- `kairos.duration()` - Create durations
- Instance methods for duration calculations

#### Range Plugin
Adds date range functionality.

```javascript
import rangePlugin from '@oxog/kairos/plugins/range/range';
kairos.use(rangePlugin);

const range = kairos.range(startDate, endDate);
console.log(range.contains(testDate));
```

**Methods Added:**
- `kairos.range()` - Create date ranges
- Range manipulation methods

### Business Plugins

#### Business Days Plugin
Adds business day calculations with holiday support.

```javascript
import businessPlugin from '@oxog/kairos/plugins/business/workday';
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';

kairos.use([holidayEngine, businessPlugin]);

const nextBusinessDay = kairos().nextBusinessDay();
const businessDaysBetween = startDate.businessDaysBetween(endDate);
```

**Methods Added:**
- `.isBusinessDay()` - Check if date is a business day
- `.nextBusinessDay()` - Get next business day
- `.previousBusinessDay()` - Get previous business day
- `.addBusinessDays()` - Add business days
- `.businessDaysBetween()` - Count business days between dates

#### Fiscal Plugin
Adds fiscal year and quarter calculations.

```javascript
import fiscalPlugin from '@oxog/kairos/plugins/business/fiscal';
kairos.use(fiscalPlugin);

const fiscalYear = kairos().fiscalYear({ startMonth: 4 }); // April start
const fiscalQuarter = kairos().fiscalQuarter({ startMonth: 4 });
```

### Parsing Plugins

#### Flexible Parser
Adds support for various date formats.

```javascript
import flexibleParser from '@oxog/kairos/plugins/parse/flexible';
kairos.use(flexibleParser);

const date1 = kairos('06/15/2024');     // MM/DD/YYYY
const date2 = kairos('15.06.2024');     // DD.MM.YYYY
const date3 = kairos('June 15, 2024');  // Natural language
```

#### RFC 2822 Parser
Adds support for RFC 2822 email date format.

```javascript
import rfc2822Parser from '@oxog/kairos/plugins/parse/rfc2822';
kairos.use(rfc2822Parser);

const date = kairos('Mon, 15 Jun 2024 14:30:00 GMT');
```

#### Unix Parser
Adds enhanced Unix timestamp support.

```javascript
import unixParser from '@oxog/kairos/plugins/parse/unix';
kairos.use(unixParser);

const date1 = kairos.unix(1640995200);        // Seconds
const date2 = kairos.fromUnix(1640995200000); // Milliseconds
```

### Holiday Plugins

#### Holiday Engine
Core holiday calculation engine (required by other holiday plugins).

```javascript
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';
kairos.use(holidayEngine);

// Provides foundation for holiday calculations
```

#### Holiday Plugin
Adds holiday detection and management.

```javascript
import holidayPlugin from '@oxog/kairos/plugins/holiday/holiday';
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';

kairos.use([holidayEngine, holidayPlugin]);

const isHoliday = kairos('2024-12-25').isHoliday();
const holidayInfo = kairos('2024-12-25').getHoliday();
```

### Locale Plugins

#### Locale Support
Adds localization for different regions.

```javascript
import enUS from '@oxog/kairos/plugins/locale/en-US';
import deDE from '@oxog/kairos/plugins/locale/de-DE';

kairos.use([enUS, deDE]);

kairos.locale('de-DE');
const germanDate = kairos().format('MMMM'); // German month names
```

### Time Zone Plugins

#### Timezone Plugin
Adds enhanced timezone functionality.

```javascript
import timezonePlugin from '@oxog/kairos/plugins/timezone/timezone';
kairos.use(timezonePlugin);

const nyTime = kairos().tz('America/New_York');
const utcTime = kairos().utc();
```

### Relative Time Plugin

#### Relative Time
Adds human-readable relative time formatting.

```javascript
import relativePlugin from '@oxog/kairos/plugins/relative/relative-time';
kairos.use(relativePlugin);

const relativeTime = kairos().subtract(1, 'hour').fromNow(); // "an hour ago"
const calendar = kairos().calendar(); // "Today at 2:30 PM"
```

## Plugin Performance

### Bundle Size Impact
| Plugin | Size (min) | Features |
|--------|------------|----------|
| duration | 3KB | Duration calculations |
| business | 5KB | Business day logic |
| holiday-engine | 8KB | Holiday calculations |
| parse-flexible | 4KB | Flexible date parsing |
| timezone | 6KB | Timezone operations |
| relative-time | 3KB | Relative formatting |

### Loading Strategy

#### Lazy Loading (Recommended)
```javascript
// Load plugins only when needed
async function loadBusinessFeatures() {
  const [businessPlugin, holidayEngine] = await Promise.all([
    import('@oxog/kairos/plugins/business/workday'),
    import('@oxog/kairos/plugins/holiday/engine')
  ]);
  
  kairos.use([holidayEngine.default, businessPlugin.default]);
}
```

#### Bundle Optimization
```javascript
// Create custom builds with only needed plugins
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';
import businessPlugin from '@oxog/kairos/plugins/business/workday';

// Tree shaking will exclude unused plugins
kairos.use([durationPlugin, businessPlugin]);

export default kairos;
```

## Creating Custom Plugins

### Plugin Structure
```javascript
export default {
  name: 'my-custom-plugin',
  version: '1.0.0',
  size: 1024, // bytes (optional)
  dependencies: ['other-plugin'], // optional
  
  install(kairos, utils) {
    // Add instance methods
    kairos.extend({
      myMethod() {
        return this.format('YYYY-MM-DD');
      }
    });
    
    // Add static methods
    kairos.addStatic({
      myStaticMethod() {
        return kairos();
      }
    });
  }
};
```

### Plugin Utilities
The `utils` parameter provides helpful utilities:

```javascript
install(kairos, utils) {
  const { cache, memoize, validateInput, throwError } = utils;
  
  // Use cache for performance
  const expensiveOperation = memoize((input) => {
    // Heavy calculation
    return result;
  });
  
  // Validate inputs
  kairos.extend({
    myMethod(input) {
      if (!utils.validateInput(input, 'date')) {
        utils.throwError('Invalid date input', 'INVALID_INPUT');
      }
      // Method logic
    }
  });
}
```

## Best Practices

### 1. Load Only What You Need
```javascript
// Good - minimal bundle
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';
kairos.use(durationPlugin);

// Avoid - loading unnecessary plugins
import kairos from '@oxog/kairos';
import * as allPlugins from '@oxog/kairos/plugins';
kairos.use(Object.values(allPlugins));
```

### 2. Check Dependencies
```javascript
// Always load dependencies in correct order
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';
import businessPlugin from '@oxog/kairos/plugins/business/workday';

kairos.use(holidayEngine); // Load dependency first
kairos.use(businessPlugin);
```

### 3. Performance Considerations
```javascript
// Load plugins at application startup, not in hot paths
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';

// During app initialization
kairos.use(durationPlugin);

// In your application code - plugins already loaded
function calculateDuration(start, end) {
  return kairos.duration(end.valueOf() - start.valueOf());
}
```

### 4. Type Safety (TypeScript)
```typescript
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';
import type { KairosDate, Duration } from '@oxog/kairos';

kairos.use(durationPlugin);

const date: KairosDate = kairos();
const duration: Duration = kairos.duration({ hours: 1 });
```

## Next Steps

- [Business Days Plugin](./business.md)
- [Duration Plugin](./duration.md)
- [Holiday Plugin](./holidays.md)
- [Creating Custom Plugins](../advanced/custom-plugins.md)