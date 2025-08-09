# Changelog

All significant changes to Kairos are documented here.

## [1.0.0] - 2024-12-20

### Initial Release

#### Core Features
- Date creation from multiple formats (string, timestamp, array, object)
- Immutable date manipulation (add, subtract, set)
- Comprehensive comparison methods (before, after, same, between)
- Flexible formatting with extensive token support
- Invalid date handling and validation
- Method chaining support
- Clone functionality for safe operations

#### Plugin System
- Modular architecture for extensibility
- Tree-shaking compatible
- Dynamic plugin loading
- Plugin development framework

#### Included Plugins

**Business Days** (`business/workday`)
- Business day detection
- Holiday-aware calculations
- Add/subtract business days
- Count business days between dates

**Calendar** (`calendar/calendar`)
- Week numbers (ISO and standard)
- Quarter calculations
- Day of year operations
- Leap year detection
- Days in month/year

**Duration** (`duration/duration`)
- ISO 8601 duration support
- Human-readable formatting
- Duration arithmetic
- Component extraction

**Fiscal** (`fiscal/fiscal`)
- Configurable fiscal year start
- Fiscal quarter calculations
- Fiscal year operations

**Format** (`format/format`)
- Extended formatting tokens
- Locale-aware formatting
- Custom format patterns

**Holiday** (`holiday/holiday`)
- Multi-locale holiday definitions
- Custom holiday support
- Holiday detection
- Holiday information retrieval

**Locales** (`locale/*`)
- English (US) - en-US
- German (Germany) - de-DE
- Turkish (Turkey) - tr-TR
- Japanese (Japan) - ja-JP

**Parse** (`parse/*`)
- ISO 8601 parser
- RFC 2822 parser
- Unix timestamp parser
- Flexible date parser

**Range** (`range/range`)
- Date range creation
- Range containment checks
- Range overlap detection
- Duration calculation

**Relative** (`relative/relative`)
- Human-readable time differences
- "Time ago" formatting
- Calendar time display
- Customizable thresholds

**Timezone** (`timezone/timezone`)
- UTC mode support
- Local/UTC conversion
- Timezone offset handling
- DST awareness

#### Quality
- 371 tests passing
- Cross-platform compatibility
- Performance benchmarks
- Memory efficiency tests
- TypeScript definitions

#### Bundle Sizes
- Core: ~14KB minified + gzipped
- All plugins: ~112KB minified + gzipped

---

## Upcoming

### [1.1.0] - Planned
- Additional locale support
- Enhanced timezone database
- More parsing formats
- Performance optimizations
- Additional calendar systems

### Future Considerations
- Recurring event support
- Advanced date math
- Custom plugin marketplace
- Browser extension
- CLI tools