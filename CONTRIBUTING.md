# Contributing to Kairos

We welcome contributions to the Kairos date/time library! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/kairos.git
   cd kairos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 📋 Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

feat(holiday): add support for lunar calendar holidays
fix(business): correct weekend calculation for custom configs
docs(readme): update API documentation
test(holiday): add property-based tests for Easter calculation
refactor(core): improve plugin loading performance
```

## 🔧 Code Guidelines

### TypeScript

- Use strict TypeScript configuration
- Provide complete type definitions
- Avoid `any` type unless absolutely necessary
- Use meaningful interface and type names

### Code Style

- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use semicolons
- Prefer const over let
- Use arrow functions for inline functions
- Use template literals for string interpolation

### Plugin Development

When creating new plugins, follow these guidelines:

1. **Plugin Structure**
   ```typescript
   export default {
     name: 'plugin-name',
     version: '1.0.0',
     size: 512, // Estimated size in bytes
     dependencies: ['required-plugin'], // Optional
     install(kairos, utils) {
       // Plugin implementation
     }
   } as KairosPlugin;
   ```

2. **Naming Conventions**
   - Use kebab-case for plugin names
   - Use descriptive names that indicate functionality
   - Prefix with category (e.g., `holiday-`, `business-`, `locale-`)

3. **Size Optimization**
   - Keep plugins small and focused
   - Avoid large dependencies
   - Use tree-shaking friendly imports
   - Estimate and document plugin size

### Testing

- Write tests for all new functionality
- Maintain high test coverage (>80%)
- Use descriptive test names
- Include edge cases and error scenarios
- Add property-based tests for complex logic

#### Test Structure

```typescript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    test('should handle normal case', () => {
      // Test implementation
    });
    
    test('should handle edge cases', () => {
      // Edge case tests
    });
    
    test('should throw error for invalid input', () => {
      // Error case tests
    });
  });
});
```

## 🗓️ Holiday Contributions

### Adding New Holidays

1. **Research thoroughly**
   - Verify official sources
   - Check historical accuracy
   - Understand regional variations

2. **Holiday Rule Types**
   - `fixed`: Same date every year
   - `nth-weekday`: Nth occurrence of weekday in month
   - `relative`: Relative to another holiday
   - `lunar`: Based on lunar calendar
   - `easter-based`: Offset from Easter
   - `custom`: Custom calculation function

3. **Validation**
   - Use the holiday validator tool
   - Test calculations for multiple years
   - Verify against official calendars

### Adding New Locales

1. **Locale Structure**
   ```typescript
   const locale = {
     name: 'Language (Country)',
     code: 'xx-YY',
     months: ['Jan', 'Feb', ...],
     weekdays: ['Sun', 'Mon', ...],
     formats: { ... },
     ordinal: (n) => `${n}th`,
     meridiem: (h, m, lower) => lower ? 'am' : 'AM'
   };
   ```

2. **Holiday Definitions**
   - Include all major national holidays
   - Add regional/state holidays where applicable
   - Document sources and calculation methods

3. **Cultural Considerations**
   - Use native language names
   - Respect cultural and religious sensitivities
   - Include relevant observances

## 🏢 Business Day Contributions

### Custom Business Calendars

1. **Industry-Specific Calendars**
   - Financial markets
   - Academic institutions
   - Government offices
   - Religious organizations

2. **Regional Variations**
   - Different weekend patterns
   - Local holidays
   - Cultural observances

## 📊 Performance Guidelines

### Optimization Principles

1. **Lazy Loading**
   - Load plugins only when needed
   - Defer heavy calculations

2. **Caching**
   - Cache expensive calculations
   - Use LRU cache for memory management
   - Cache holiday calculations per year

3. **Tree Shaking**
   - Use ES modules
   - Avoid circular dependencies
   - Export only necessary functions

### Performance Testing

- Add performance benchmarks for new features
- Ensure operations complete within reasonable time limits
- Test memory usage with large datasets

## 🔍 Code Review Process

### Before Submitting

1. **Self Review**
   - Run all tests locally
   - Check code formatting
   - Review for typos and clarity

2. **Documentation**
   - Update API documentation
   - Add JSDoc comments
   - Update README if needed

3. **Testing**
   - Add comprehensive tests
   - Test edge cases
   - Verify performance impact

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] Performance is acceptable
- [ ] No breaking changes (or properly documented)
- [ ] Holiday calculations are accurate

## 📚 Documentation

### API Documentation

- Use JSDoc for all public APIs
- Provide usage examples
- Document parameters and return types
- Include error conditions

### Examples

- Create practical examples
- Show real-world usage
- Cover edge cases
- Include performance considerations

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog

- Document all changes
- Categorize by type (Added, Changed, Fixed, Removed)
- Include migration notes for breaking changes

## 🎯 Contribution Types

### Code Contributions

- New features
- Bug fixes
- Performance improvements
- Refactoring

### Documentation

- API documentation
- Examples
- Tutorials
- Translation

### Testing

- Unit tests
- Integration tests
- Performance tests
- Property-based tests

### Tooling

- Development tools
- Build improvements
- CI/CD enhancements

## 📞 Getting Help

- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions or share ideas
- **Discord**: Join our community chat
- **Email**: Contact maintainers directly

## 📝 License

By contributing to Kairos, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors are recognized in:
- README contributors section
- Release notes
- Project documentation
- Annual contributor highlights

---

Thank you for contributing to Kairos! Your help makes this library better for everyone. 🎉