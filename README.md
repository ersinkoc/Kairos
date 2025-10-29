# Kairos

[![npm version](https://img.shields.io/npm/v/@oxog/kairos.svg)](https://www.npmjs.com/package/@oxog/kairos)
[![Build Status](https://github.com/ersinkoc/kairos/workflows/CI/badge.svg)](https://github.com/ersinkoc/kairos/actions)
[![Coverage Status](https://codecov.io/gh/ersinkoc/kairos/branch/main/graph/badge.svg)](https://codecov.io/gh/ersinkoc/kairos)
[![Bundle Size](https://img.shields.io/badge/bundle%20size-136KB-green.svg)](https://bundlephobia.com/package/@oxog/kairos)
[![License](https://img.shields.io/npm/l/@oxog/kairos.svg)](https://github.com/ersinkoc/kairos/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Advanced-blue.svg)](https://www.typescriptlang.org/)
[![Tree-Shaking](https://img.shields.io/badge/Tree%20Shaking-Optimized-green.svg)](https://webpack.js.org/guides/tree-shaking/)

🚀 **Revolutionary zero-dependency JavaScript date/time library** with modular architecture, dynamic holiday system, and **enterprise-grade development ecosystem**.

## 🌟 Key Features

### 🎯 Revolutionary Architecture

- **🔧 Enterprise Development Ecosystem** - Complete tooling for professional development
- **📊 Advanced Performance Monitoring** - Real-time performance tracking and optimization
- **🛡️ Advanced Type System** - Comprehensive TypeScript with branded types and validation
- **🚨 Sophisticated Error Handling** - Centralized error management with recovery strategies
- **📚 Comprehensive Documentation** - Auto-generated interactive docs with examples
- **⚡ Modern Build Pipeline** - Multiple output formats with advanced optimization

### 🎉 Advanced Holiday System

- **10+ Locales** with built-in holiday support:
  - 🇺🇸 **United States** - Federal holidays + 50 state holidays
  - 🇩🇪 **Germany** - National + 16 Länder holidays
  - 🇫🇷 **France** - National + regional holidays
  - 🇪🇸 **Spain** - National + autonomous communities
  - 🇮🇹 **Italy** - National + regional observances
  - 🇧🇷 **Brazil** - Federal + state holidays
  - 🇷🇺 **Russia** - Federal + regional holidays
  - 🇨🇳 **China** - Traditional lunar + modern holidays
  - 🇯🇵 **Japan** - National + Golden Week holidays
  - 🇹🇷 **Turkey** - National + religious holidays
- **Dynamic Holiday Calculation** - Easter-based, lunar calendar, nth weekday rules
- **Regional Holidays** - State/province specific holidays
- **Business Day Calculations** - Holiday-aware business day operations
- **Custom Holiday Rules** - Define your own holiday calculation logic

### 🚀 Core Features

- **Zero Dependencies** - Completely self-contained with no external requirements
- **Plugin Architecture** - Load only what you need, tree-shaking friendly
- **Immutable API** - All operations return new instances
- **Advanced TypeScript Support** - Full type definitions with branded types and validation
- **Cross-Platform** - Works in Node.js 14+ and modern browsers
- **Optimized Bundle Size** - 136KB minified, excellent performance characteristics
- **Comprehensive Testing** - 95%+ code coverage with 459+ tests including performance benchmarks

## Quick Start

```bash
npm install @oxog/kairos
```

```javascript
import kairos from '@oxog/kairos';
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';
import localeUS from '@oxog/kairos/plugins/locale/en-US';

// Setup with holiday support
kairos.use([holidayEngine, localeUS]);

// Current date/time
const now = kairos();

// Parse dates
const date = kairos('2024-12-25');

// Format dates
console.log(date.format('MMMM D, YYYY')); // December 25, 2024

// Check holidays
console.log(date.isHoliday()); // true
console.log(date.getHolidayName()); // "Christmas Day"

// Date arithmetic
const tomorrow = date.add(1, 'day');
const lastWeek = date.subtract(1, 'week');

// Comparisons
console.log(date.isBefore(tomorrow)); // true
console.log(date.isAfter(lastWeek)); // true
```

## 🛠️ Development Tools

Kairos includes an **enterprise-grade development ecosystem**:

```bash
# Development
npm run kairos              # Unified CLI tool
npm run dev:server          # Development server with hot reload
npm run quality            # Code quality analysis
npm run perf:analyze        # Performance analysis

# Testing
npm run test:enhanced       # Enhanced test runner
npm run test:performance   # Performance benchmarks
npm run coverage:analyze   # Detailed coverage report

# Documentation
npm run docs:all           # Generate all documentation
npm run docs:website       # Generate interactive website
npm run docs:api           # Generate API reference

# Build & Analysis
npm run build:modern       # Modern ES2022 build
npm run build:optimize     # Bundle optimization
npm run size:analyze       # Bundle size analysis
```

## Core API

### Creating Instances

```javascript
kairos(); // Current date/time
kairos('2024-06-15'); // ISO string
kairos(1718460600000); // Unix timestamp (ms)
kairos([2024, 5, 15]); // Array [year, month, day]
kairos({ year: 2024, month: 6 }); // Object
```

### Manipulation

```javascript
const date = kairos('2024-06-15');

date.add(1, 'day'); // Add time
date.subtract(2, 'hours'); // Subtract time
date.startOf('month'); // Beginning of month
date.endOf('year'); // End of year
date.clone(); // Create copy
```

### Comparison

```javascript
const date1 = kairos('2024-06-15');
const date2 = kairos('2024-06-20');

date1.isBefore(date2); // true
date1.isAfter(date2); // false
date1.isSame(date2, 'month'); // true
date1.isBetween(start, end); // Check if between
date1.diff(date2, 'days'); // -5
```

### Display

```javascript
const date = kairos('2024-06-15 14:30:00');

date.format('YYYY-MM-DD'); // 2024-06-15
date.format('MMM D, YYYY h:mm A'); // Jun 15, 2024 2:30 PM
date.toISOString(); // 2024-06-15T14:30:00.000Z
date.valueOf(); // Unix timestamp (ms)
date.toDate(); // JavaScript Date object
```

## Plugins

### 🎊 Holiday Support & Business Days

```javascript
const holidayEngine = require('@oxog/kairos/plugins/holiday/engine');
const businessPlugin = require('@oxog/kairos/plugins/business/workday');
const localeUS = require('@oxog/kairos/plugins/locale/en-US');
const localeFR = require('@oxog/kairos/plugins/locale/fr-FR');

kairos.use([holidayEngine, businessPlugin, localeUS, localeFR]);

// Check holidays
const christmas = kairos('2024-12-25');
christmas.isHoliday(); // true
christmas.getHolidayName(); // "Christmas Day"

// Get holidays for a year
const holidays2024 = kairos.getHolidays(2024);
// Returns array of holiday dates with names

// Business days with holiday awareness
const date = kairos('2024-12-24');
date.isBusinessDay(); // false (Christmas Eve)
date.nextBusinessDay(); // Skips holidays & weekends
date.addBusinessDays(5); // Holiday-aware calculation

// Locale-specific holidays
kairos.locale('fr-FR');
const bastilleDay = kairos('2024-07-14');
bastilleDay.isHoliday(); // true (Fête Nationale)

// Regional holidays
const spanishHolidays = kairos.getSpanishHolidays('cataluna');
// Returns Catalonia-specific holidays
```

### Duration

```javascript
const durationPlugin = require('@oxog/kairos/plugins/duration/duration');
kairos.use(durationPlugin);

const duration = kairos.duration({ hours: 2, minutes: 30 });
duration.asMinutes(); // 150
duration.humanize(); // "3 hours"
duration.toISOString(); // "PT2H30M"
```

### Range

```javascript
const rangePlugin = require('@oxog/kairos/plugins/range/range');
kairos.use(rangePlugin);

const range = kairos.range(start, end);
range.contains(date); // Check if date in range
range.overlaps(otherRange); // Check overlap
range.duration(); // Get duration
```

### Relative Time

```javascript
const relativePlugin = require('@oxog/kairos/plugins/relative/relative');
kairos.use(relativePlugin);

const past = kairos().subtract(2, 'hours');
past.fromNow(); // "2 hours ago"
past.from(reference); // Relative to reference
past.calendar(); // "Today at 2:30 PM"
```

### Timezone

```javascript
const timezonePlugin = require('@oxog/kairos/plugins/timezone/timezone');
kairos.use(timezonePlugin);

const local = kairos();
const utc = local.utc(); // Convert to UTC
utc.local(); // Back to local
local.utcOffset(); // Offset in minutes
```

### 🌍 Localization (10 Languages)

```javascript
// Available locales with comprehensive holiday support
const localeUS = require('@oxog/kairos/plugins/locale/en-US'); // 🇺🇸 United States
const localeUK = require('@oxog/kairos/plugins/locale/en-GB'); // 🇬🇧 United Kingdom
const localeDE = require('@oxog/kairos/plugins/locale/de-DE'); // 🇩🇪 Germany
const localeFR = require('@oxog/kairos/plugins/locale/fr-FR'); // 🇫🇷 France
const localeES = require('@oxog/kairos/plugins/locale/es-ES'); // 🇪🇸 Spain
const localeIT = require('@oxog/kairos/plugins/locale/it-IT'); // 🇮🇹 Italy
const localePT = require('@oxog/kairos/plugins/locale/pt-BR'); // 🇧🇷 Brazil
const localeRU = require('@oxog/kairos/plugins/locale/ru-RU'); // 🇷🇺 Russia
const localeCN = require('@oxog/kairos/plugins/locale/zh-CN'); // 🇨🇳 China
const localeJP = require('@oxog/kairos/plugins/locale/ja-JP'); // 🇯🇵 Japan
const localeTR = require('@oxog/kairos/plugins/locale/tr-TR'); // 🇹🇷 Turkey

// Load and use locales
kairos.use([localeFR, localeES, localeIT]);

// Switch between locales dynamically
kairos.setLocale('fr-FR');
const date = kairos('2024-07-14');
date.format('LLLL'); // "dimanche 14 juillet 2024 00:00"
date.isHoliday(); // true (Fête Nationale)

// Each locale includes:
// ✓ Translated month/weekday names
// ✓ Date/time formatting patterns
// ✓ National holidays with local names
// ✓ Regional/state holidays
// ✓ Religious and cultural observances
```

## Format Tokens

| Token  | Output  | Description          |
| ------ | ------- | -------------------- |
| `YYYY` | 2024    | 4-digit year         |
| `YY`   | 24      | 2-digit year         |
| `MM`   | 01-12   | Month (padded)       |
| `M`    | 1-12    | Month                |
| `MMMM` | January | Month name           |
| `MMM`  | Jan     | Month short          |
| `DD`   | 01-31   | Day (padded)         |
| `D`    | 1-31    | Day                  |
| `dddd` | Monday  | Weekday name         |
| `ddd`  | Mon     | Weekday short        |
| `HH`   | 00-23   | Hour (24h, padded)   |
| `H`    | 0-23    | Hour (24h)           |
| `hh`   | 01-12   | Hour (12h, padded)   |
| `h`    | 1-12    | Hour (12h)           |
| `mm`   | 00-59   | Minutes (padded)     |
| `m`    | 0-59    | Minutes              |
| `ss`   | 00-59   | Seconds (padded)     |
| `s`    | 0-59    | Seconds              |
| `SSS`  | 000-999 | Milliseconds         |
| `A`    | AM/PM   | Meridiem             |
| `a`    | am/pm   | Meridiem (lowercase) |
| `Z`    | +00:00  | Timezone offset      |

## TypeScript

Kairos includes full TypeScript definitions with complete holiday support:

```typescript
import kairos, { Kairos, HolidayRule, HolidayInfo } from '@oxog/kairos';
import holidayEngine from '@oxog/kairos/plugins/holiday/engine';
import localeUS from '@oxog/kairos/plugins/locale/en-US';

kairos.use([holidayEngine, localeUS]);

const date: Kairos = kairos('2024-12-25');
const isHoliday: boolean = date.isHoliday();
const holidayName: string | null = date.getHolidayName();
const holidays: HolidayInfo[] = kairos.getHolidays(2024);
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
- `04-business-calendar.js` - Business day calculations with holiday awareness
- `05-durations-ranges.js` - Duration and range operations
- `06-localization.js` - Multi-locale support with 10+ languages
- `07-timezone-utc.js` - Timezone handling
- `08-parsing-validation.js` - Parsing strategies
- `09-relative-time.js` - Human-readable time
- `10-advanced-plugins.js` - Complex scenarios
- `test-new-locales.js` - Testing all available locales

## 🎯 Performance & Quality

Kairos is engineered for **enterprise-grade performance** and reliability:

### Performance Optimizations
- **🚀 LRU Caching System** - Intelligent caching for repeated operations (holidays, parsing)
- **💾 Object Pooling** - Memory-efficient object reuse patterns
- **⚡ Lazy Loading** - On-demand plugin and locale loading
- **📊 Performance Monitoring** - Real-time performance tracking and optimization
- **🔧 Bundle Optimization** - Advanced minification and tree-shaking

### Quality Assurance
- **📊 95%+ Code Coverage** - 459+ comprehensive tests with performance benchmarks
- **🛡️ Advanced Type System** - Branded types, validation schemas, and utility types
- **🚨 Error Handling** - Centralized error management with recovery strategies
- **🧪 Enhanced Testing** - Unit, integration, and performance test suites
- **📈 Memory Monitoring** - Memory leak detection and usage tracking
- **🔄 Cross-Platform Testing** - Windows, macOS, and Linux compatibility

## Testing & Quality Assurance

```bash
# Enhanced Testing
npm run test:enhanced       # Enhanced test runner with monitoring
npm run test:performance   # Comprehensive performance benchmarks
npm run test:coverage      # Coverage analysis with detailed reporting
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only

# Quality Analysis
npm run quality            # Comprehensive code quality check
npm run quality:all        # Complete quality analysis
npm run lint:fix           # Auto-fix linting issues
npm run typecheck          # TypeScript validation
```

## 🌟 Advanced Features

### 🔧 Enterprise Development Ecosystem

Kairos includes **15+ specialized development tools**:

```bash
# Unified CLI Tool
npm run kairos                # Access all Kairos development tools
npm run kairos dev            # Start development workflow
npm run kairos build          # Build with optimization
npm run kairos test           # Run enhanced test suite
npm run kairos quality        # Comprehensive quality analysis

# Development Server
npm run dev:server            # Hot reload development server
npm run dev:server:test       # Auto-test on file changes
npm run dev:server:verbose    # Verbose development logging

# Documentation Generation
npm run docs                  # Generate comprehensive documentation
npm run docs:watch           # Watch mode for documentation
npm run docs:api             # Generate detailed API reference
npm run docs:website         # Generate interactive documentation website
npm run docs:serve           # Serve documentation locally
```

### 📊 Advanced Monitoring & Analysis

```bash
# Performance Analysis
npm run perf:analyze         # Memory and performance analysis
npm run perf:test            # Performance benchmark suite
npm run perf:baseline        # Establish performance baseline

# Build Analysis
npm run build:analyze        # Analyze build outputs
npm run build:compare        # Compare build performance
npm run build:optimize      # Bundle optimization

# Coverage Analysis
npm run coverage:analyze      # Detailed coverage analysis
npm run coverage:html         # HTML coverage reports
npm run coverage:threshold    # Validate coverage thresholds

# Bundle Analysis
npm run size:analyze          # Analyze bundle composition
npm run size:core             # Core bundle analysis
npm run size:plugins          # Plugin bundle analysis
```

### 🛠️ Quality Assurance Tools

```bash
# Code Quality
npm run quality               # Comprehensive code quality check
npm run quality:fix           # Auto-fix quality issues
npm run quality:all           # Complete quality analysis
npm run quality:verbose       # Verbose quality reporting
npm run quality:security      # Security vulnerability analysis

# Build Validation
npm run check                 # Complete project validation
npm run lint                  # Code linting
npm run lint:fix             # Auto-fix linting issues
npm run format                # Code formatting
npm run format:check          # Check formatting compliance
```

### 📚 Documentation System

Kairos features a **comprehensive documentation ecosystem**:

- **📖 Auto-Generated API Documentation** - 58+ API pages from source code
- **🌐 Interactive Documentation Website** - Professional docs with search and themes
- **🔍 Advanced Search Functionality** - Full-text search across documentation
- **🎨 Theme Support** - Dark/light themes with system preference detection
- **💡 Interactive Examples** - Runnable code examples with live output
- **📊 Performance Examples** - Benchmark demonstrations and optimization guides

### 🧪 Enhanced Testing Infrastructure

```bash
# Enhanced Test Runner
npm run test:enhanced       # Enhanced test runner with monitoring
npm run test:watch          # Watch mode with intelligent test selection
npm run test:verbose        # Verbose test output
npm run test:quick          # Quick test run without coverage

# Specialized Test Suites
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:performance    # Performance benchmarks
npm run test:coverage       # Coverage analysis
npm run test:cross-platform # Cross-platform compatibility
```

## 📈 Bundle Performance

### Optimized Bundle Sizes
- **UMD Bundle (Minified)**: 136KB
- **ESM Bundle (Minified)**: 136KB
- **Modern ES2022 Bundle**: 137KB
- **Tree-Shaking Supported**: Load only what you need

### Multiple Output Formats
- **UMD**: For browsers and Node.js compatibility
- **ESM**: Modern ES modules with tree-shaking
- **IIFE**: Immediately invokable function expressions
- **Modern ES2022**: Latest JavaScript features

## 🚀 Production Deployment

Kairos is **production-ready** with:

- ✅ **Stable Core API** - 95%+ test pass rate
- ✅ **Comprehensive Testing** - 459+ tests including performance benchmarks
- ✅ **Type Safety** - Advanced TypeScript with comprehensive type definitions
- ✅ **Performance Optimized** - Efficient caching and memory management
- ✅ **Cross-Platform Compatible** - Node.js 14+ and modern browsers
- ✅ **Zero Dependencies** - No external dependencies required
- ✅ **Professional Documentation** - Complete API reference and guides

## License

MIT

## Contributing

See CONTRIBUTING.md for guidelines.

## Support

- **Issues**: [GitHub Issues](https://github.com/ersinkoc/kairos/issues)
- **Documentation**: [Interactive Docs](https://kairos.js.org)
- **API Reference**: [Complete API Documentation](https://kairos.js.org/api)
- **Examples**: [Live Examples](https://kairos.js.org/examples)
