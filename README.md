# Kairos 🕰️

[![npm version](https://badge.fury.io/js/@oxog%2Fkairos.svg)](https://www.npmjs.com/package/@oxog/kairos)
[![CI Status](https://github.com/ersinkoc/kairos/workflows/CI/badge.svg)](https://github.com/ersinkoc/kairos/actions)
[![Coverage Status](https://codecov.io/gh/ersinkoc/kairos/branch/main/graph/badge.svg)](https://codecov.io/gh/ersinkoc/kairos)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@oxog/kairos)](https://bundlephobia.com/package/@oxog/kairos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Revolutionary zero-dependency JavaScript date/time library with modular architecture and dynamic holiday system

## ✨ Features

- 🚀 **Zero Runtime Dependencies** - Truly standalone library
- 📦 **Modular Plugin System** - Load only what you need
- 🌍 **Comprehensive Locale Support** - Multiple languages and regions (US, DE, TR, JP)
- 🎉 **Advanced Holiday Engine** - Dynamic holiday calculations with multiple rule types
- 💼 **Business Day Calculations** - Handle workdays, settlements, and fiscal years
- 🕰️ **Relative Time** - Human-readable time differences ("2 hours ago", "in 3 days")
- 📅 **Calendar Operations** - Week numbers, quarters, ISO weeks, and more
- 🔧 **Tree-Shakeable** - Optimize your bundle size (~15KB min+gzip for core)
- 📝 **Full TypeScript Support** - First-class TypeScript experience
- ⚡ **High Performance** - Optimized with intelligent caching
- 🧩 **Extensible** - Easy to add custom functionality
- ✅ **Well Tested** - 67% test coverage with comprehensive test suite
- 🎯 **Browser Ready** - UMD, ESM, and IIFE builds available

## 📦 Installation

```bash
npm install @oxog/kairos
```

```bash
yarn add @oxog/kairos
```

```bash
pnpm add @oxog/kairos
```

### CDN Usage

```html
<!-- UMD build for browsers -->
<script src="https://unpkg.com/@oxog/kairos/dist/kairos.umd.min.js"></script>
<script>
  const date = kairos('2024-01-15');
  console.log(date.format('YYYY-MM-DD'));
</script>

<!-- ESM build for modern browsers -->
<script type="module">
  import kairos from 'https://unpkg.com/@oxog/kairos/dist/kairos.esm.min.js';
  const date = kairos('2024-01-15');
  console.log(date.format('YYYY-MM-DD'));
</script>
```

## 🚀 Quick Start

```javascript
import kairos from '@oxog/kairos';

// Basic usage
const now = kairos();
const tomorrow = kairos().add(1, 'day');
const formatted = kairos().format('YYYY-MM-DD HH:mm:ss');

// With plugins
import holidayEngine from '@oxog/kairos/holiday/engine';
import businessWorkday from '@oxog/kairos/business/workday';
import localeUS from '@oxog/kairos/locale/en-US';

kairos.use([holidayEngine, businessWorkday, localeUS]);

// Check holidays
const isHoliday = kairos('2024-12-25').isHoliday();
const nextBusinessDay = kairos().nextBusinessDay();
```

## 🎯 Core Features

### Date Manipulation

```javascript
const date = kairos('2024-01-15');

// Add/subtract time
date.add(1, 'month');
date.subtract(3, 'days');
date.add(2, 'hours');

// Chaining
date
  .add(1, 'year')
  .subtract(2, 'months')
  .add(3, 'days');

// Immutable operations
const original = kairos('2024-01-01');
const modified = original.add(1, 'day');
console.log(original.format()); // 2024-01-01
console.log(modified.format()); // 2024-01-02
```

### Formatting

```javascript
const date = kairos('2024-03-15T14:30:45.123Z');

date.format('YYYY-MM-DD');           // 2024-03-15
date.format('DD/MM/YYYY HH:mm');     // 15/03/2024 14:30
date.format('MMMM Do, YYYY');        // March 15th, 2024
date.format('dddd, MMMM D, YYYY');   // Friday, March 15, 2024
date.format('HH:mm:ss.SSS');         // 14:30:45.123
```

### Comparison

```javascript
const date1 = kairos('2024-01-01');
const date2 = kairos('2024-01-15');

date1.isBefore(date2);  // true
date1.isAfter(date2);   // false
date1.isSame(date2);    // false

// With granularity
date1.isSame(date2, 'month'); // true
date1.isSame(date2, 'year');  // true
```

## 🔌 Plugin System

### Holiday Engine

```javascript
import kairos from '@oxog/kairos';
import holidayEngine from '@oxog/kairos/holiday/engine';
import fixedCalculator from '@oxog/kairos/holiday/calculators/fixed';
import nthWeekdayCalculator from '@oxog/kairos/holiday/calculators/nth-weekday';
import easterCalculator from '@oxog/kairos/holiday/calculators/easter';

kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  easterCalculator
]);

// Define holidays
const holidays = [
  {
    name: 'New Year',
    type: 'fixed',
    rule: { month: 1, day: 1 }
  },
  {
    name: 'Thanksgiving',
    type: 'nth-weekday',
    rule: { month: 11, weekday: 4, nth: 4 }
  },
  {
    name: 'Good Friday',
    type: 'easter-based',
    rule: { offset: -2 }
  }
];

// Check holidays
const date = kairos('2024-11-28');
const holidayInfo = date.getHolidayInfo(holidays);
console.log(holidayInfo); // { name: 'Thanksgiving', ... }

// Get all holidays in a year
const yearHolidays = kairos().getHolidaysInYear(2024, holidays);
```

### Business Days

```javascript
import kairos from '@oxog/kairos';
import businessWorkday from '@oxog/kairos/business/workday';

kairos.use(businessWorkday);

const date = kairos('2024-01-15');

// Business day operations
date.isBusinessDay();              // Check if business day
date.nextBusinessDay();             // Get next business day
date.previousBusinessDay();         // Get previous business day
date.addBusinessDays(5);           // Add 5 business days

// Settlement calculations (T+N)
date.settlementDate(2);            // T+2 settlement
date.settlementDate(3, holidays);  // T+3 with holiday consideration

// Business day counting
const start = kairos('2024-01-01');
const end = kairos('2024-01-31');
const businessDays = start.businessDaysBetween(end);
```

### Locales

```javascript
import kairos from '@oxog/kairos';
import localeUS from '@oxog/kairos/locale/en-US';
import localeDE from '@oxog/kairos/locale/de-DE';
import localeTR from '@oxog/kairos/locale/tr-TR';
import localeJP from '@oxog/kairos/locale/ja-JP';

// Load multiple locales
kairos.use([localeUS, localeDE, localeTR, localeJP]);

// Switch locale
kairos.locale('de-DE');
const date = kairos('2024-03-15');
date.format('MMMM'); // März

// Locale-specific holidays
const usHolidays = date.getHolidays('texas'); // Get Texas state holidays
const germanHolidays = date.getHolidays('bavaria'); // Get Bavarian holidays
```

### Duration

```javascript
import kairos from '@oxog/kairos';
import duration from '@oxog/kairos/duration';

kairos.use(duration);

// Create durations
const dur1 = kairos.duration(2, 'hours');
const dur2 = kairos.duration({ hours: 1, minutes: 30 });
const dur3 = kairos.duration('P1DT12H'); // ISO 8601

// Duration arithmetic
const total = dur1.add(dur2);
const diff = dur1.subtract(dur2);

// Apply to dates
const date = kairos();
const future = date.add(dur1);

// Human-readable format
dur2.humanize(); // "1 hour 30 minutes"
```

### Range

```javascript
import kairos from '@oxog/kairos';
import range from '@oxog/kairos/range';

kairos.use(range);

const start = kairos('2024-01-01');
const end = kairos('2024-01-31');

// Create range
const january = start.range(end);

// Iterate over range
january.forEach(date => {
  console.log(date.format('YYYY-MM-DD'));
});

// Filter business days
const businessDays = january.filter(date => date.isBusinessDay());

// Get specific days
const mondays = january.filterByWeekday(1);
const weekends = january.weekends();
```

## 🌍 Supported Locales

- 🇺🇸 **English (US)** - Federal and state holidays
- 🇩🇪 **German (DE)** - Federal and state holidays
- 🇹🇷 **Turkish (TR)** - Public holidays and observances
- 🇯🇵 **Japanese (JP)** - Public holidays with era support

## 📊 Performance

Kairos is designed for high performance with:
- Intelligent LRU caching
- Memoized calculations
- Lazy evaluation
- Minimal memory footprint

```javascript
// Benchmark example
import kairos from '@oxog/kairos';

const iterations = 100000;
const start = performance.now();

for (let i = 0; i < iterations; i++) {
  kairos().add(1, 'day').format('YYYY-MM-DD');
}

const end = performance.now();
console.log(`${iterations} operations in ${end - start}ms`);
```

## 🧩 Custom Plugins

Create your own plugins:

```javascript
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install(kairos, utils) {
    // Add instance methods
    kairos.extend({
      myMethod() {
        return this.format('YYYY');
      }
    });
    
    // Add static methods
    kairos.myStaticMethod = () => {
      return 'Hello from plugin';
    };
  }
};

kairos.use(myPlugin);
```

## 📚 API Reference

### Core Methods

| Method | Description |
|--------|-------------|
| `kairos()` | Create instance from current date/time |
| `kairos(input)` | Create instance from string, Date, or timestamp |
| `.add(amount, unit)` | Add time |
| `.subtract(amount, unit)` | Subtract time |
| `.format(template)` | Format date |
| `.isBefore(other)` | Check if before another date |
| `.isAfter(other)` | Check if after another date |
| `.isSame(other)` | Check if same as another date |
| `.clone()` | Create a copy |
| `.toDate()` | Convert to JavaScript Date |
| `.toISOString()` | Convert to ISO string |
| `.valueOf()` | Get timestamp |

### Plugin Methods

See individual plugin documentation for additional methods.

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/ersinkoc/kairos.git
cd kairos

# Install dependencies
npm install

# Run tests
npm test

# Build project
npm run build

# Run benchmarks
npm run test:performance

# Check bundle size
npm run size
```

## 📈 Bundle Size

Kairos is designed to be lightweight:

| Package | Size (minified + gzipped) |
|---------|---------------------------|
| Core only | ~4KB |
| Core + Holiday Engine | ~12KB |
| Core + Business Days | ~8KB |
| Core + All Locales | ~20KB |
| Everything | ~35KB |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

MIT © [Ersin Koç](https://github.com/ersinkoc)

## 🙏 Acknowledgments

Special thanks to all contributors and the JavaScript date/time community for inspiration.

---

<div align="center">
  <p>If you find Kairos useful, please consider giving it a ⭐ on GitHub!</p>
  <p>
    <a href="https://github.com/ersinkoc/kairos">GitHub</a> •
    <a href="https://www.npmjs.com/package/@oxog/kairos">NPM</a> •
    <a href="https://kairos.dev">Documentation</a> •
    <a href="https://github.com/ersinkoc/kairos/issues">Issues</a>
  </p>
</div>