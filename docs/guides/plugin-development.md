# Plugin Development Guide

## Plugin Architecture

Kairos uses a plugin architecture that allows extending functionality in a modular way.

## Creating a Plugin

A plugin is an object that implements the `KairosPlugin` interface:

```typescript
interface KairosPlugin {
  name: string;
  version: string;
  install?: (core: KairosCore) => void;
  methods?: Record<string, Function>;
  staticMethods?: Record<string, Function>;
  parseHandlers?: Array<ParseHandler>;
  formatHandlers?: Array<FormatHandler>;
  localeData?: Record<string, any>;
}
```

## Example Plugin

```typescript
const weatherPlugin = {
  name: 'weather',
  version: '1.0.0',

  methods: {
    isSunny() {
      // Custom weather logic
      return this._date.getMonth() >= 5 && this._date.getMonth() <= 8;
    },

    getSeason() {
      const month = this._date.getMonth();
      if (month >= 2 && month <= 4) return 'Spring';
      if (month >= 5 && month <= 7) return 'Summer';
      if (month >= 8 && month <= 10) return 'Fall';
      return 'Winter';
    }
  },

  staticMethods: {
    getSeasons() {
      return ['Spring', 'Summer', 'Fall', 'Winter'];
    }
  }
};

kairos.use(weatherPlugin);
```

## Plugin Types

### Method Plugins
Add instance methods to Kairos instances.

### Static Method Plugins
Add static methods to the main kairos function.

### Parse Handler Plugins
Add custom date parsing logic.

### Format Handler Plugins
Add custom date formatting tokens.

### Locale Data Plugins
Add localization data.

## Best Practices

1. **Namespace your plugin**: Use descriptive method names
2. **Handle edge cases**: Validate inputs and handle errors
3. **Document your plugin**: Provide clear examples
4. **Test thoroughly**: Include unit tests
5. **Version management**: Use semantic versioning
