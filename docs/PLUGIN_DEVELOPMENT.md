# Plugin Development Guide

This guide covers how to create custom plugins for Kairos, extending its functionality with new methods, features, and capabilities.

## Table of Contents

- [Plugin Architecture](#plugin-architecture)
- [Basic Plugin Structure](#basic-plugin-structure)
- [Plugin Interface](#plugin-interface)
- [Extending Instance Methods](#extending-instance-methods)
- [Adding Static Methods](#adding-static-methods)
- [Plugin Dependencies](#plugin-dependencies)
- [Utilities](#utilities)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Testing Plugins](#testing-plugins)

## Plugin Architecture

Kairos uses a modular plugin system where each plugin can:

1. **Extend instance methods** - Add new methods to Kairos instances
2. **Add static methods** - Add new methods to the main kairos function
3. **Register dependencies** - Depend on other plugins
4. **Use utilities** - Access caching, validation, and other utilities
5. **Store metadata** - Include version, size, and description information

## Basic Plugin Structure

Every plugin must implement the `KairosPlugin` interface:

```typescript
import type { KairosPlugin } from '@oxog/kairos/types';

const myPlugin: KairosPlugin = {
  name: 'my-plugin',           // Required: unique plugin identifier
  version: '1.0.0',            // Optional: plugin version
  size: 1024,                  // Optional: bundle size in bytes
  dependencies: [],            // Optional: required plugins
  description: 'My plugin',    // Optional: description

  install(kairos, utils) {
    // Plugin installation logic here
  }
};

export default myPlugin;
```

## Plugin Interface

```typescript
interface KairosPlugin {
  /** Unique plugin name */
  name: string;
  
  /** Plugin version (semver) */
  version?: string;
  
  /** Bundle size in bytes */
  size?: number;
  
  /** Array of required plugin names */
  dependencies?: string[];
  
  /** Plugin description */
  description?: string;
  
  /** Installation function */
  install(kairos: KairosStatic, utils: PluginUtils): void;
}
```

## Extending Instance Methods

Add new methods to Kairos instances using `kairos.extend()`:

```typescript
const instanceMethodsPlugin: KairosPlugin = {
  name: 'instance-methods-example',
  
  install(kairos, utils) {
    kairos.extend({
      // Simple method
      isWeekend(): boolean {
        const day = this.day();
        return day === 0 || day === 6;
      },
      
      // Method with parameters
      addWeekdays(count: number): KairosInstance {
        let current = this.clone();
        let added = 0;
        
        while (added < count) {
          current = current.add(1, 'day');
          if (!current.isWeekend()) {
            added++;
          }
        }
        
        return current;
      },
      
      // Method returning different types based on parameters
      businessDay(offset?: number): boolean | KairosInstance {
        if (offset === undefined) {
          return !this.isWeekend();
        }
        
        return this.addWeekdays(offset);
      }
    });
  }
};
```

### Instance Method Context

Instance methods have access to the current Kairos instance through `this`:

```typescript
kairos.extend({
  customMethod(): string {
    // `this` refers to the KairosInstance
    const year = this.year();
    const month = this.month();
    const day = this.date();
    
    return `${year}-${month}-${day}`;
  }
});
```

## Adding Static Methods

Add new methods to the main kairos function using `kairos.addStatic()`:

```typescript
const staticMethodsPlugin: KairosPlugin = {
  name: 'static-methods-example',
  
  install(kairos, utils) {
    kairos.addStatic?.({
      // Create specific dates
      easter(year: number): KairosInstance {
        // Easter calculation logic
        const easter = calculateEaster(year);
        return kairos(easter);
      },
      
      // Utility methods
      isLeapYear(year: number): boolean {
        return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
      },
      
      // Factory methods
      createRange(start: any, end: any): DateRange {
        return new DateRange(kairos(start).toDate(), kairos(end).toDate());
      }
    });
  }
};

// Usage:
// kairos.easter(2024)
// kairos.isLeapYear(2024)
// kairos.createRange('2024-01-01', '2024-12-31')
```

## Plugin Dependencies

Specify dependencies on other plugins:

```typescript
const dependentPlugin: KairosPlugin = {
  name: 'dependent-plugin',
  dependencies: ['business-days', 'holidays'],
  
  install(kairos, utils) {
    kairos.extend({
      nextBusinessHoliday(): KairosInstance {
        // This plugin can safely use methods from business-days and holidays plugins
        let current = this.clone();
        
        while (true) {
          current = current.nextBusinessDay();
          if (current.isHoliday()) {
            return current;
          }
        }
      }
    });
  }
};
```

The plugin system will:
1. Check that all dependencies are installed before installing your plugin
2. Throw an error if dependencies are missing
3. Install dependencies in the correct order

## Utilities

The `utils` parameter provides helpful utilities:

```typescript
const utilityPlugin: KairosPlugin = {
  name: 'utility-example',
  
  install(kairos, utils) {
    kairos.extend({
      cachedMethod(): string {
        const cacheKey = `method-${this.valueOf()}`;
        
        // Use the cache
        if (utils.cache.has(cacheKey)) {
          return utils.cache.get(cacheKey);
        }
        
        const result = expensiveOperation();
        utils.cache.set(cacheKey, result);
        return result;
      },
      
      validateInput(input: any): boolean {
        // Use validation utilities
        if (!utils.validateInput(input, 'date')) {
          utils.throwError('Invalid date input', 'INVALID_INPUT');
        }
        return true;
      },
      
      memoizedMethod: utils.memoize(function(this: KairosInstance) {
        return expensiveCalculation(this.valueOf());
      })
    });
  }
};
```

### Available Utilities

```typescript
interface PluginUtils {
  /** LRU cache for performance optimization */
  cache: LRUCache<string, any>;
  
  /** Memoization decorator */
  memoize: <T extends (...args: any[]) => any>(fn: T) => T;
  
  /** Input validation */
  validateInput(input: any, type: 'date' | 'number' | 'string'): boolean;
  
  /** Error throwing with context */
  throwError(message: string, code?: string): never;
}
```

## Best Practices

### 1. Naming Conventions

- Use kebab-case for plugin names: `'business-days'`, `'relative-time'`
- Use camelCase for method names: `isBusinessDay()`, `nextHoliday()`
- Prefix related methods: `businessDaysBetween()`, `businessDaysInMonth()`

### 2. Method Design

- Return new instances rather than mutating existing ones
- Support method chaining where appropriate
- Use consistent parameter ordering
- Provide TypeScript type definitions

```typescript
// Good: Returns new instance, supports chaining
addBusinessDays(days: number): KairosInstance {
  return this.clone().add(days, 'business-day');
}

// Good: Consistent naming and behavior
businessDaysBetween(other: KairosInstance): number {
  // Implementation
}
businessDaysInMonth(): number {
  // Implementation  
}
```

### 3. Error Handling

- Use the provided `utils.throwError()` for consistency
- Validate inputs appropriately
- Provide helpful error messages

```typescript
kairos.extend({
  myMethod(input: any): KairosInstance {
    if (!utils.validateInput(input, 'number')) {
      utils.throwError('Expected a number', 'INVALID_INPUT');
    }
    
    if (input < 0) {
      utils.throwError('Expected a positive number', 'INVALID_RANGE');
    }
    
    // Method implementation
  }
});
```

### 4. Performance

- Use caching for expensive calculations
- Implement memoization for pure functions
- Avoid unnecessary object creation

```typescript
const performantPlugin: KairosPlugin = {
  name: 'performant-example',
  
  install(kairos, utils) {
    // Cache expensive holiday calculations
    const holidayCache = new Map();
    
    kairos.extend({
      isExpensiveHoliday(): boolean {
        const key = this.format('YYYY-MM-DD');
        
        if (holidayCache.has(key)) {
          return holidayCache.get(key);
        }
        
        const result = expensiveHolidayCalculation(this.toDate());
        holidayCache.set(key, result);
        return result;
      }
    });
  }
};
```

## Examples

### Simple Utility Plugin

```typescript
const utilityPlugin: KairosPlugin = {
  name: 'date-utilities',
  version: '1.0.0',
  
  install(kairos, utils) {
    kairos.extend({
      // Check if date is today
      isToday(): boolean {
        const today = kairos().format('YYYY-MM-DD');
        return this.format('YYYY-MM-DD') === today;
      },
      
      // Get age in years
      age(): number {
        return kairos().year() - this.year();
      },
      
      // Get season (Northern Hemisphere)
      season(): string {
        const month = this.month();
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
      }
    });
  }
};
```

### Complex Business Logic Plugin

```typescript
const fiscalPlugin: KairosPlugin = {
  name: 'fiscal-year',
  version: '1.0.0',
  dependencies: ['business-days'],
  
  install(kairos, utils) {
    // Configuration
    const FISCAL_YEAR_START = 7; // July
    
    kairos.extend({
      // Get fiscal year
      fiscalYear(): number {
        const month = this.month();
        const year = this.year();
        
        return month >= FISCAL_YEAR_START ? year + 1 : year;
      },
      
      // Start of fiscal year
      startOfFiscalYear(): KairosInstance {
        const fiscalYear = this.fiscalYear();
        const calendarYear = this.month() >= FISCAL_YEAR_START ? 
          this.year() : this.year() - 1;
          
        return kairos()
          .year(calendarYear)
          .month(FISCAL_YEAR_START)
          .date(1)
          .startOf('day');
      },
      
      // Fiscal quarter (Q1-Q4)
      fiscalQuarter(): number {
        const month = this.month();
        const adjustedMonth = month >= FISCAL_YEAR_START ? 
          month - FISCAL_YEAR_START : month + 12 - FISCAL_YEAR_START;
          
        return Math.floor(adjustedMonth / 3) + 1;
      }
    });
    
    // Static methods
    kairos.addStatic?.({
      currentFiscalYear(): number {
        return kairos().fiscalYear();
      },
      
      fiscalYearRange(fiscalYear: number): DateRange {
        const start = kairos()
          .year(fiscalYear - 1)
          .month(FISCAL_YEAR_START)
          .date(1)
          .startOf('day');
          
        const end = start.add(1, 'year').subtract(1, 'day').endOf('day');
        
        return kairos.createRange(start, end);
      }
    });
  }
};
```

### Plugin with Custom Classes

```typescript
class CustomRange {
  constructor(private start: Date, private end: Date) {}
  
  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }
  
  days(): number {
    return Math.ceil((this.end.getTime() - this.start.getTime()) / (24 * 60 * 60 * 1000));
  }
}

const customRangePlugin: KairosPlugin = {
  name: 'custom-range',
  version: '1.0.0',
  
  install(kairos, utils) {
    kairos.extend({
      customRange(end: KairosInstance): CustomRange {
        return new CustomRange(this.toDate(), end.toDate());
      }
    });
    
    kairos.addStatic?.({
      createCustomRange(start: any, end: any): CustomRange {
        return new CustomRange(
          kairos(start).toDate(), 
          kairos(end).toDate()
        );
      }
    });
  }
};
```

## Testing Plugins

Create comprehensive tests for your plugins:

```typescript
import kairos from '@oxog/kairos';
import myPlugin from './my-plugin';

describe('MyPlugin', () => {
  beforeAll(() => {
    kairos.use(myPlugin);
  });
  
  describe('instance methods', () => {
    test('should add custom method', () => {
      const date = kairos('2024-01-01');
      expect(date.customMethod).toBeDefined();
      expect(typeof date.customMethod).toBe('function');
    });
    
    test('customMethod should work correctly', () => {
      const date = kairos('2024-01-01');
      const result = date.customMethod();
      
      expect(result).toBe('expected-value');
    });
  });
  
  describe('static methods', () => {
    test('should add static method', () => {
      expect(kairos.customStatic).toBeDefined();
      expect(typeof kairos.customStatic).toBe('function');
    });
    
    test('customStatic should work correctly', () => {
      const result = kairos.customStatic();
      expect(result).toBe('expected-static-value');
    });
  });
  
  describe('edge cases', () => {
    test('should handle invalid input', () => {
      const date = kairos('2024-01-01');
      expect(() => date.customMethod('invalid')).toThrow();
    });
  });
});
```

### Plugin Testing Best Practices

1. **Test installation** - Verify methods are added correctly
2. **Test functionality** - Test all method behaviors
3. **Test edge cases** - Invalid inputs, boundary conditions
4. **Test dependencies** - If plugin depends on others
5. **Test TypeScript types** - If providing type definitions

```typescript
// Test plugin installation
test('plugin installation', () => {
  expect(kairos.isInstalled?.('my-plugin')).toBe(true);
});

// Test dependencies
test('plugin dependencies', () => {
  expect(kairos.isInstalled?.('required-dependency')).toBe(true);
});

// Test TypeScript types (in .d.ts test file)
const date = kairos('2024-01-01');
const result: string = date.customMethod(); // Should compile without errors
```

---

This guide should help you create robust, well-designed plugins for Kairos. For more examples, see the [built-in plugins](../src/plugins/) in the source code.