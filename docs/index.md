# Kairos Documentation

Welcome to Kairos - a revolutionary zero-dependency JavaScript date/time library with modular architecture.

## Quick Navigation

### Getting Started
- [Installation & Setup](./getting-started.md)
- [Basic Usage](./basic-usage.md)
- [Migration Guide](../MIGRATION.md)

### Core Features
- [Date Creation & Parsing](./api/date-creation.md)
- [Formatting](./api/formatting.md)
- [Date Arithmetic](./api/arithmetic.md)
- [Comparisons](./api/comparisons.md)
- [Validation](./api/validation.md)

### Plugins
- [Plugin System Overview](./plugins/overview.md)
- [Business Days](./plugins/business.md)
- [Durations](./plugins/duration.md)
- [Timezone Operations](./plugins/timezone.md)
- [Holiday Calculations](./plugins/holidays.md)
- [Parsing Plugins](./plugins/parsing.md)
- [Locale Support](./plugins/locales.md)

### Examples
- [Basic Examples](./examples/basic.md)
- [Advanced Use Cases](./examples/advanced.md)
- [Plugin Examples](./examples/plugins.md)

### Advanced Topics
- [Performance Optimization](./advanced/performance.md)
- [Tree Shaking](./advanced/tree-shaking.md)
- [TypeScript Integration](./advanced/typescript.md)
- [Custom Plugins](./advanced/custom-plugins.md)

### Reference
- [Full API Reference](../API.md)
- [Changelog](../CHANGELOG.md)
- [Contributing](../CONTRIBUTING.md)

## Key Features

✅ **Zero Dependencies** - No external dependencies, minimal bundle size  
✅ **Modular Architecture** - Use only what you need with tree-shaking support  
✅ **TypeScript Native** - Built with TypeScript, full type definitions included  
✅ **Plugin System** - Extensible with a powerful plugin ecosystem  
✅ **Immutable Operations** - All operations return new instances  
✅ **Holiday Support** - Built-in holiday calculations for multiple locales  
✅ **Business Day Logic** - Advanced business day calculations  
✅ **Cross-Platform** - Works in browsers, Node.js, and edge environments

## Quick Example

```javascript
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration';

// Load plugins as needed
kairos.use(durationPlugin);

// Basic usage
const now = kairos();
const birthday = kairos('1990-05-15');
const age = kairos.duration(now.valueOf() - birthday.valueOf());

console.log(`Age: ${age.humanize()}`);
// Output: "Age: 34 years, 2 months, 3 weeks, 5 days"

// Date arithmetic
const nextWeek = now.add(1, 'week');
const lastMonth = now.subtract(1, 'month');

// Formatting
console.log(now.format('YYYY-MM-DD HH:mm:ss'));
// Output: "2024-08-09 22:25:30"

// Comparisons
console.log(nextWeek.isAfter(now)); // true
console.log(birthday.isBefore(now)); // true
```

## Installation

```bash
npm install @oxog/kairos
```

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+
- Node.js 14+

## Bundle Sizes

| Format | Size (min) | Size (gzip) |
|--------|------------|-------------|
| Core only | 15KB | 5KB |
| With common plugins | 45KB | 12KB |
| Full bundle | 85KB | 22KB |

## License

MIT License - see [LICENSE](../LICENSE) for details.