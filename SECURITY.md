# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Kairos seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: ersinkoc@gmail.com

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Security Measures

Kairos implements several security best practices:

### 1. Input Validation
- All date inputs are validated before processing
- Bounds checking for date values (years 100-9999)
- Invalid dates return explicit invalid date objects rather than throwing errors
- Regular expression patterns are pre-compiled and validated

### 2. No External Dependencies
- Zero runtime dependencies reduce attack surface
- No risk from supply chain attacks through compromised dependencies
- All functionality is self-contained and auditable

### 3. Type Safety
- Written in TypeScript with strict mode enabled
- Comprehensive type definitions prevent type-related vulnerabilities
- Strict null checks prevent null pointer exceptions

### 4. Memory Safety
- No use of eval() or Function constructor
- No dynamic code generation
- Efficient memory management with proper cleanup
- Protection against memory leaks in plugin system

### 5. Safe Parsing
- Conservative parsing that rejects ambiguous inputs
- No automatic type coercion that could lead to unexpected behavior
- Explicit validation of all parsed values

### 6. Secure Defaults
- Safe defaults for all configuration options
- No privileged operations required
- Runs in strict mode by default

### 7. Regular Security Audits
- Automated security scanning in CI/CD pipeline
- Regular dependency audits (dev dependencies only)
- Code review for all changes

## Security Checklist for Contributors

Before submitting a pull request, please ensure:

- [ ] No use of `eval()`, `new Function()`, or similar dynamic code execution
- [ ] All user inputs are validated and sanitized
- [ ] No sensitive data is logged or exposed in error messages
- [ ] Proper error handling without exposing internal details
- [ ] No hardcoded credentials or secrets
- [ ] All regular expressions are tested for ReDoS vulnerabilities
- [ ] Memory is properly managed (no leaks)
- [ ] TypeScript strict mode compliance
- [ ] Security tests pass

## Known Security Considerations

### Date Parsing
- The library accepts various date formats which could potentially be ambiguous
- Mitigation: Use ISO 8601 format for unambiguous date representation
- Invalid dates are handled gracefully without throwing exceptions

### Locale Data
- Locale and holiday data is loaded dynamically based on user selection
- Mitigation: All locale data is bundled and validated at build time
- No external locale data sources are loaded at runtime

### Plugin System
- Plugins can extend functionality but are sandboxed
- Mitigation: Plugin API is limited and doesn't expose dangerous operations
- All official plugins undergo security review

## Security Updates

Security updates will be released as:
- **Patch versions** (1.0.x) for non-breaking security fixes
- **Minor versions** (1.x.0) if security fixes require minor API changes
- **Major versions** (x.0.0) only if breaking changes are absolutely necessary

## Compliance

Kairos is designed to be compliant with:
- OWASP Top 10 recommendations
- CWE Top 25 Most Dangerous Software Weaknesses guidelines
- Node.js Security Best Practices

## Contact

For any security-related questions, please contact:
- Email: ersinkoc@gmail.com
- GitHub Security Advisories: [Create advisory](https://github.com/ersinkoc/kairos/security/advisories/new)

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities. Contributors who report valid security issues will be acknowledged in our release notes (unless they prefer to remain anonymous).