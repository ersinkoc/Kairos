# Kairos Documentation

## Overview

Kairos is a revolutionary zero-dependency JavaScript date/time library with modular architecture and dynamic holiday system.

## Quick Links

- [Getting Started](guides/getting-started.md)
- [API Reference](api/README.md)
- [Examples](examples/README.md)
- [Plugins](plugins/README.md)
- [Migration Guide](guides/migration-guide.md)

## Documentation Structure

### API Reference
- [Core API](api/core/) - Main Kairos class and core functionality
- [Plugin API](api/plugins/) - Plugin-specific documentation
- [Type Definitions](api/types/) - TypeScript types and interfaces
- [Utilities](api/utils/) - Utility functions and helpers

### Examples
- [Basic Usage](examples/basic-usage.md) - Getting started examples
- [Plugin System](examples/plugin-system.md) - Plugin architecture examples
- [Business Days](examples/business-days.md) - Business day calculations
- [Localization](examples/localization.md) - Locale-specific functionality
- [Date Formatting](examples/date-formatting.md) - Formatting examples
- [Date Parsing](examples/date-parsing.md) - Parsing examples
- [Performance Tips](examples/performance.md) - Performance optimization

### Guides
- [Getting Started](guides/getting-started.md) - Installation and setup
- [Plugin Development](guides/plugin-development.md) - Creating custom plugins
- [Migration Guide](guides/migration-guide.md) - Migrating from other libraries
- [Best Practices](guides/best-practices.md) - Recommended patterns
- [Troubleshooting](guides/troubleshooting.md) - Common issues and solutions

## Quick Start

```bash
npm install @oxog/kairos
```

```typescript
import kairos from '@oxog/kairos';

const date = kairos('2024-06-15');
const formatted = date.format('YYYY-MM-DD');
const isHoliday = date.isHoliday();
```

## Features

- 🚀 **Zero Dependencies** - No external dependencies
- 🔧 **Modular Architecture** - Plugin-based extensibility
- 📅 **Holiday System** - Dynamic holiday calculations
- 🌍 **Localization** - Multi-language support
- ⚡ **High Performance** - Optimized for speed
- 📦 **Tree Shakeable** - Only bundle what you use
- 🎯 **TypeScript** - Full TypeScript support
- 🔄 **Immutable** - Safe date manipulation

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Ersin Koc](https://github.com/ersinkoc)
