# Kairos Documentation

Welcome to the Kairos documentation! This directory contains comprehensive guides and API references for the Kairos date manipulation library.

## Documentation Structure

### Core Documentation

- **[API.md](./API.md)** - Complete API reference with examples
  - Core methods (getters, setters, manipulation, formatting)
  - Plugin system overview
  - Built-in plugin documentation
  - TypeScript usage examples

- **[PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md)** - Guide for creating custom plugins
  - Plugin architecture explanation
  - Step-by-step development guide
  - Best practices and patterns
  - Testing strategies

### Auto-generated Documentation

- **[generated/](./generated/)** - Auto-generated API documentation from JSDoc comments
  - Generated using TypeDoc from source code
  - Always up-to-date with latest code
  - Searchable interface
  - Cross-referenced types and methods

## Quick Navigation

### Getting Started
- [Installation & Basic Usage](./API.md#installation)
- [Core Concepts](./API.md#basic-usage)
- [Plugin System](./API.md#plugin-system)

### Plugin Development
- [Creating Your First Plugin](./PLUGIN_DEVELOPMENT.md#basic-plugin-structure)
- [Adding Instance Methods](./PLUGIN_DEVELOPMENT.md#extending-instance-methods)
- [Adding Static Methods](./PLUGIN_DEVELOPMENT.md#adding-static-methods)
- [Plugin Dependencies](./PLUGIN_DEVELOPMENT.md#plugin-dependencies)

### Built-in Plugins
- [Duration Plugin](./API.md#duration-plugin) - Time spans and ISO 8601 support
- [Range Plugin](./API.md#range-plugin) - Date ranges with iteration
- [Business Day Plugin](./API.md#business-day-plugin) - Weekdays and holidays
- [Holiday Plugin](./API.md#holiday-plugin) - Comprehensive holiday support
- [Calendar Plugin](./API.md#calendar-plugin) - Quarters, weeks, etc.
- [Relative Time Plugin](./API.md#relative-time-plugin) - Human-readable time

### Advanced Topics
- [Localization](./API.md#localization) - Multi-language and region support  
- [TypeScript Integration](./API.md#typescript-support) - Type-safe usage
- [Performance Optimization](./API.md#performance-tips) - Best practices

## Examples

### Basic Usage
```typescript
import kairos from '@oxog/kairos';

const now = kairos();
const birthday = kairos('1990-05-15');
const age = now.year() - birthday.year();

console.log(`You are ${age} years old`);
console.log(`Next birthday: ${birthday.year(now.year() + 1).format()}`);
```

### With Plugins
```typescript
import kairos from '@oxog/kairos';
import businessPlugin from '@oxog/kairos/plugins/business';

kairos.use(businessPlugin);

const friday = kairos('2024-01-12');
const nextBusiness = friday.nextBusinessDay();
const settlement = friday.settlementDate(3);

console.log(`Next business day: ${nextBusiness.format()}`);
console.log(`T+3 settlement: ${settlement.format()}`);
```

### Plugin Development
```typescript
import type { KairosPlugin } from '@oxog/kairos/types';

const myPlugin: KairosPlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  
  install(kairos, utils) {
    kairos.extend({
      isWeekend(): boolean {
        const day = this.day();
        return day === 0 || day === 6;
      }
    });
  }
};

kairos.use(myPlugin);
```

## Building Documentation

### Generate API Docs
```bash
npm run docs:build
```

This generates TypeDoc documentation from source code JSDoc comments into the `docs/generated/` directory.

### View Documentation
1. Build the documentation: `npm run docs:build`
2. Open `docs/generated/index.html` in your browser
3. Browse the searchable API reference

## Contributing to Documentation

### Adding JSDoc Comments
When adding new methods or classes, include comprehensive JSDoc comments:

```typescript
/**
 * Adds business days to the current date.
 * 
 * @param days - Number of business days to add
 * @returns New KairosInstance with business days added
 * 
 * @example
 * ```typescript
 * const monday = kairos('2024-01-08');
 * const thursday = monday.addBusinessDays(3);
 * console.log(thursday.format()); // '2024-01-11'
 * ```
 */
addBusinessDays(days: number): KairosInstance {
  // Implementation
}
```

### Documentation Standards
- **Clear descriptions** - Explain what the method does
- **Parameter documentation** - Describe each parameter with type info
- **Return value documentation** - Explain what is returned
- **Examples** - Provide practical usage examples
- **Cross-references** - Link to related methods when relevant

### Updating Guides
When adding new features:
1. Update the appropriate section in `API.md`
2. Add examples to demonstrate usage
3. Update `PLUGIN_DEVELOPMENT.md` if plugin-related
4. Regenerate auto-documentation with `npm run docs:build`

## Documentation Tools

- **TypeDoc** - Generates API documentation from TSDoc/JSDoc comments
- **Markdown** - Human-readable guides and examples
- **GitHub Pages** - Documentation hosting (coming soon)

## Feedback

Found an error in the documentation? Have suggestions for improvement?
- Open an issue on [GitHub](https://github.com/oxog/kairos/issues)
- Contribute via pull request
- Discuss on [GitHub Discussions](https://github.com/oxog/kairos/discussions)

---

*This documentation is continuously updated to reflect the latest version of Kairos.*