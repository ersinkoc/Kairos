# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kairos is a zero-dependency JavaScript date/time library with a modular plugin architecture. The library provides immutable date manipulation with extensive plugin support for business days, holidays, localization, and more.

## Development Commands

### Build Commands

```bash
npm run build           # Clean build (library + browser bundle)
npm run build:lib       # Build TypeScript library only
npm run build:browser   # Build UMD browser bundle
npm run build:prod      # Production build with minification
npm run clean          # Remove dist directory
```

### Test Commands

```bash
npm test               # Run all tests silently
npm run test:verbose   # Run tests with full output
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run test:unit      # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:performance # Run performance tests only
npm run test:all       # Run unit, integration, and performance tests sequentially
```

### Code Quality Commands

```bash
npm run lint           # Check TypeScript files for linting errors
npm run lint:fix       # Auto-fix linting errors where possible
npm run format         # Format code with Prettier
npm run format:check   # Check if code is properly formatted
npm run typecheck      # Type-check TypeScript without emitting files
npm run check          # Run typecheck, lint, test:coverage, and size checks
```

### Development Commands

```bash
npm run dev            # Build and run tests in watch mode
```

## Architecture

### Core Structure

The library follows a plugin-based architecture where the core (`src/core/plugin-system.ts`) provides base functionality and plugins extend it:

- **Core System** (`src/core/`): Base date manipulation, plugin system, and utilities
  - `plugin-system.ts`: Central KairosCore class with plugin registration
  - `locale-manager.ts`: Manages locale data and switching
  - `types/`: TypeScript type definitions
  - `utils/`: Caching (LRU), validation utilities

- **Plugins** (`src/plugins/`): Modular extensions
  - `business/`: Business day calculations and fiscal year support
  - `holiday/`: Dynamic holiday calculation with multiple calculator strategies
  - `locale/`: Locale-specific data (en-US, de-DE, ja-JP, tr-TR)
  - `parse/`: Various parsing strategies (ISO, RFC2822, Unix, flexible)
  - `format/`: Date formatting with token support
  - `duration/`, `range/`, `relative/`, `timezone/`, `calendar/`: Additional functionality

### Plugin System

Plugins are registered via `kairos.use()` and can provide:

- Instance methods (added to Kairos instances)
- Static methods (added to the kairos function itself)
- Parse handlers (custom parsing logic)
- Format handlers (custom formatting logic)
- Locale data (translations, holiday definitions)

### Holiday Engine

The holiday system uses calculator strategies for different holiday types:

- `fixed`: Fixed date holidays (e.g., January 1)
- `nth-weekday`: Nth weekday of month (e.g., 2nd Monday of May)
- `easter-based`: Easter and related holidays
- `lunar`: Lunar calendar holidays
- `relative`: Holidays relative to other holidays
- `custom`: Custom calculation functions

### Testing Strategy

- **Unit Tests** (`tests/unit/`): Test individual components
- **Integration Tests** (`tests/integration/`): Test cross-component functionality
- **Performance Tests** (`tests/performance/`): Benchmark critical operations
- **Setup** (`tests/setup.ts`): Global test configuration with all plugins loaded
- Tests use Jest with ts-jest for TypeScript support
- Coverage thresholds: 50% minimum for all metrics

### Build Process

1. TypeScript compilation to ES2020 modules
2. Rollup bundles for browser (UMD format)
3. Source maps and type declarations included
4. Tree-shaking supported via ES modules

## Key Implementation Notes

1. **Immutability**: All date operations return new instances. Never mutate the internal `_date` property.

2. **Plugin Registration**: Plugins must be registered before use. The test setup (`tests/setup.ts`) loads all plugins.

3. **Type Safety**: Strict TypeScript configuration enforces null checks, unused variables, and exact optional properties.

4. **Module Resolution**: Uses `.js` extensions in imports for ES module compatibility. The `moduleNameMapper` in Jest config handles this.

5. **Locale Management**: Locales must be registered before switching. Default is 'en-US' after loading locale plugins.

6. **Caching**: LRU cache used for performance optimization in holiday calculations and date parsing.

7. **Error Handling**: Use the `throwError` utility from validators for consistent error messages.

## Common Patterns

### Adding a New Plugin

1. Create plugin file in appropriate `src/plugins/` subdirectory
2. Implement `KairosPlugin` interface
3. Export from `src/index.ts` for public API
4. Add tests in corresponding `tests/unit/` directory
5. Update documentation

### Testing Date Operations

```typescript
import kairos from '../src/core/plugin-system';
const date = kairos('2024-06-15');
// Test operations...
```

### Working with Holidays

```typescript
const holidays = kairos.getHolidays(2024);
const isHoliday = kairos('2024-12-25').isHoliday();
```

## Important Files

- `src/index.ts`: Main entry point and exports
- `src/core/plugin-system.ts`: Core Kairos class
- `tests/setup.ts`: Test configuration and utilities
- `jest.config.cjs`: Jest test configuration
- `tsconfig.json`: TypeScript compiler configuration
- `rollup.config.js`: Browser bundle configuration
