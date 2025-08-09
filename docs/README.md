# Kairos Documentation

Welcome to the comprehensive documentation for Kairos - a revolutionary zero-dependency JavaScript date/time library.

## Quick Start

```bash
npm install @oxog/kairos
```

```javascript
import kairos from '@oxog/kairos';

const now = kairos();
console.log(now.format('YYYY-MM-DD HH:mm:ss'));
```

## Documentation Structure

### 📚 **Getting Started**
- [Installation & Setup](./getting-started.md) - Get up and running quickly
- [Basic Usage](./basic-usage.md) - Core concepts and operations
- [Migration Guide](../MIGRATION.md) - Migrating from other libraries

### 🔧 **API Reference**
- [Date Creation & Parsing](./api/date-creation.md)
- [Formatting](./api/formatting.md)  
- [Date Arithmetic](./api/arithmetic.md)
- [Comparisons](./api/comparisons.md)
- [Validation](./api/validation.md)
- [Full API Reference](../API.md)

### 🧩 **Plugin System**
- [Plugin Overview](./plugins/overview.md) - Understanding the plugin architecture
- [Duration Plugin](./plugins/duration.md) - Time duration calculations
- [Business Days](./plugins/business.md) - Business day logic with holiday support
- [Timezone Operations](./plugins/timezone.md) - Advanced timezone handling
- [Holiday Calculations](./plugins/holidays.md) - Holiday detection and management
- [Parsing Plugins](./plugins/parsing.md) - Extended date format parsing
- [Locale Support](./plugins/locales.md) - Internationalization

### 💡 **Examples**
- [Basic Examples](./examples/basic.md) - Common use cases and patterns
- [Advanced Examples](./examples/advanced.md) - Complex scenarios and applications
- [Plugin Examples](./examples/plugins.md) - Using plugins effectively

### ⚡ **Advanced Topics**
- [Performance Optimization](./advanced/performance.md)
- [Tree Shaking](./advanced/tree-shaking.md)
- [TypeScript Integration](./advanced/typescript.md)
- [Custom Plugins](./advanced/custom-plugins.md)

### 📖 **Additional Resources**
- [Changelog](../CHANGELOG.md) - Version history and updates
- [Contributing](../CONTRIBUTING.md) - How to contribute to Kairos
- [Security](../SECURITY.md) - Security policies and reporting

## Key Features

✅ **Zero Dependencies** - No external dependencies, minimal bundle size  
✅ **Modular Architecture** - Use only what you need with tree-shaking support  
✅ **TypeScript Native** - Built with TypeScript, full type definitions included  
✅ **Plugin System** - Extensible with a powerful plugin ecosystem  
✅ **Immutable Operations** - All operations return new instances  
✅ **Holiday Support** - Built-in holiday calculations for multiple locales  
✅ **Business Day Logic** - Advanced business day calculations  
✅ **Cross-Platform** - Works in browsers, Node.js, and edge environments

## Quick Examples

### Basic Usage
```javascript
import kairos from '@oxog/kairos';

// Current time
const now = kairos();

// From string
const date = kairos('2024-01-15 14:30:00');

// Formatting
console.log(date.format('YYYY-MM-DD'));  // "2024-01-15"
console.log(date.format('MM/DD/YYYY'));  // "01/15/2024"

// Arithmetic
const tomorrow = now.add(1, 'day');
const lastWeek = now.subtract(1, 'week');

// Comparisons
console.log(tomorrow.isAfter(now));  // true
console.log(lastWeek.isBefore(now)); // true
```

### With Plugins
```javascript
import kairos from '@oxog/kairos';
import durationPlugin from '@oxog/kairos/plugins/duration/duration';
import businessPlugin from '@oxog/kairos/plugins/business/workday';

// Load plugins
kairos.use([durationPlugin, businessPlugin]);

// Duration calculations
const duration = kairos.duration({ hours: 2, minutes: 30 });
console.log(duration.humanize()); // "2 hours, 30 minutes"

// Business day calculations
const nextBusinessDay = kairos().nextBusinessDay();
const businessDays = startDate.businessDaysBetween(endDate);
```

## Browser Support

- **Chrome** 60+
- **Firefox** 60+  
- **Safari** 12+
- **Edge** 79+
- **Node.js** 14+

## Bundle Sizes

| Configuration | Size (min) | Size (gzip) |
|---------------|------------|-------------|
| Core only | 15KB | 5KB |
| Core + Duration | 18KB | 6KB |
| Core + Business Days | 23KB | 7KB |
| Common plugins | 45KB | 12KB |
| Full bundle | 85KB | 22KB |

## Community

- **Issues**: [GitHub Issues](https://github.com/oxog/kairos/issues)
- **Discussions**: [GitHub Discussions](https://github.com/oxog/kairos/discussions)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

MIT License - see [LICENSE](../LICENSE) for details.

---

**Ready to get started?** → [Installation & Setup](./getting-started.md)