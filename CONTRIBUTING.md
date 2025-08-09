# Contributing to Kairos

We appreciate your interest in contributing to Kairos! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 14 or higher
- npm 6 or higher
- Git

### Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kairos.git
   cd kairos
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests
npm run test:watch    # Watch mode
npm run test:perf     # Performance tests
npm run coverage      # Coverage report
```

### Building

```bash
npm run build         # Build all formats
npm run build:dev     # Development build
npm run build:prod    # Production build
```

### Code Quality

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix issues
npm run format        # Format code with Prettier
npm run typecheck     # TypeScript validation
```

## Contribution Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Testing Requirements

- Write tests for all new features
- Maintain or improve code coverage
- Test edge cases and error conditions
- Ensure all tests pass before submitting

### Commit Messages

We follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling
- `perf`: Performance

Examples:
```
feat(plugin): add lunar calendar support
fix(parser): handle leap year edge case
docs(api): update format token reference
test(business): add holiday calculation tests
```

### Pull Request Process

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add/update tests
   - Update documentation if needed

3. **Validate your changes**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Submit PR**
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe what changes you made and why
   - Include screenshots for UI changes

5. **Code Review**
   - Respond to feedback promptly
   - Make requested changes
   - Keep discussion professional

## Creating Plugins

### Plugin Structure

```typescript
// src/plugins/my-plugin/index.ts
import type { KairosPlugin } from '../../core/types/plugin';

const myPlugin: KairosPlugin = {
  name: 'my-plugin',
  install(kairos, utils) {
    // Add instance methods
    kairos.extend({
      myMethod() {
        return this.clone();
      }
    });
    
    // Add static methods
    kairos.addStatic({
      myStatic() {
        return 'static value';
      }
    });
  }
};

export default myPlugin;
```

### Plugin Guidelines

1. Keep plugins focused on a single responsibility
2. Document all public methods
3. Include TypeScript definitions
4. Write comprehensive tests
5. Provide usage examples
6. Avoid dependencies when possible
7. Consider performance impact

### Plugin Testing

```typescript
// tests/unit/plugins/my-plugin.test.ts
import kairos from '../../../src';
import myPlugin from '../../../src/plugins/my-plugin';

describe('My Plugin', () => {
  beforeAll(() => {
    kairos.use(myPlugin);
  });

  test('should add myMethod', () => {
    const date = kairos();
    expect(date.myMethod).toBeDefined();
  });
});
```

## Project Structure

```
kairos/
├── src/                 # Source code
│   ├── core/           # Core functionality
│   ├── plugins/        # Plugin modules
│   └── index.ts        # Main entry
├── tests/              # Test suites
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── performance/   # Performance tests
├── examples/           # Usage examples
├── docs/              # Documentation
└── tools/             # Build tools
```

## Reporting Issues

### Bug Reports

Include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version)
- Minimal code example
- Error messages/stack traces

### Feature Requests

Include:
- Use case description
- Proposed API design
- Code examples
- Alternative solutions considered
- Potential breaking changes

## Community

### Code of Conduct

- Be respectful and professional
- Welcome newcomers
- Help others learn
- Focus on constructive feedback
- Respect differing opinions

### Getting Help

- Check existing issues first
- Read the documentation
- Look at examples
- Ask clear, specific questions
- Provide context and code samples

## Release Process

1. Version bump in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build distribution files
5. Create git tag
6. Push to repository
7. Publish to npm
8. Create GitHub release

## Recognition

Contributors are acknowledged in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for helping make Kairos better!