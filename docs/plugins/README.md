# Plugin System

Kairos uses a modular plugin architecture that allows you to load only the functionality you need.

## Available Plugins

### Core Plugins
- **Business Days**: Business day calculations and fiscal year support
- **Holiday Engine**: Dynamic holiday calculation with multiple strategies
- **Locale System**: Multi-language support and localization
- **Date Parsing**: Various parsing strategies (ISO, RFC2822, Unix, flexible)
- **Date Formatting**: Advanced formatting with token support

### Extended Plugins
- **Duration**: Time duration calculations and manipulation
- **Date Range**: Range operations and calculations
- **Relative Time**: Relative time formatting and parsing
- **Timezone**: Timezone support and conversions
- **Calendar**: Calendar systems and utilities

## Using Plugins

```typescript
import kairos from '@oxog/kairos';
import businessPlugin from '@oxog/kairos/plugins/business';
import holidayPlugin from '@oxog/kairos/plugins/holiday';

// Load plugins
kairos.use(businessPlugin);
kairos.use(holidayPlugin);

// Use plugin features
const date = kairos('2024-06-15');
console.log(date.isBusinessDay());
console.log(date.isHoliday());
```

## Creating Custom Plugins

See the [Plugin Development Guide](../guides/plugin-development.md) for detailed information on creating custom plugins.
