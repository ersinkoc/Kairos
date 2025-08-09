#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 Kairos Security Audit\n');
console.log('=' .repeat(60));

let hasIssues = false;
const issues = [];
const warnings = [];

// Security checks configuration
const securityChecks = {
  // Dangerous patterns to check for
  dangerousPatterns: [
    { pattern: /eval\s*\(/g, name: 'eval() usage', severity: 'critical' },
    { pattern: /new\s+Function\s*\(/g, name: 'Function constructor', severity: 'critical' },
    { pattern: /innerHTML/g, name: 'innerHTML usage', severity: 'high' },
    { pattern: /document\.write/g, name: 'document.write usage', severity: 'high' },
    { pattern: /\bexec\s*\(/g, name: 'exec() usage', severity: 'critical' },
    { pattern: /\bspawn\s*\(/g, name: 'spawn() usage', severity: 'high' },
    { pattern: /require\s*\([^'"]/g, name: 'Dynamic require', severity: 'medium' },
    { pattern: /\bprocess\.env\./g, name: 'Environment variable access', severity: 'low' },
    { pattern: /\bcrypto\./g, name: 'Crypto usage', severity: 'info' },
    { pattern: /\bBuffer\./g, name: 'Buffer usage', severity: 'low' },
  ],
  
  // File patterns to check
  filePatterns: {
    sensitive: ['.env', '.key', '.pem', '.p12', '.pfx', 'private', 'secret'],
    config: ['config.json', 'settings.json', 'credentials.json'],
  },
  
  // Input validation patterns
  inputValidation: [
    { pattern: /parseInt\s*\([^,)]+\)/g, name: 'parseInt without radix', severity: 'low' },
    { pattern: /JSON\.parse\s*\([^)]+\)/g, name: 'JSON.parse without try-catch', severity: 'medium' },
    { pattern: /RegExp\s*\([^)]+\)/g, name: 'Dynamic RegExp creation', severity: 'medium' },
  ],
  
  // XSS prevention patterns
  xssPrevention: [
    { pattern: /<script[^>]*>/gi, name: 'Script tag in strings', severity: 'high' },
    { pattern: /on\w+\s*=/gi, name: 'Event handler in strings', severity: 'medium' },
    { pattern: /javascript:/gi, name: 'JavaScript protocol', severity: 'high' },
  ],
};

// Function to scan files for security issues
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  const fileIssues = [];
  
  // Check for dangerous patterns
  securityChecks.dangerousPatterns.forEach(({ pattern, name, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      fileIssues.push({
        file: relativePath,
        issue: name,
        severity,
        count: matches.length,
        lines: getLineNumbers(content, pattern),
      });
    }
  });
  
  // Check for input validation issues
  securityChecks.inputValidation.forEach(({ pattern, name, severity }) => {
    const matches = content.match(pattern);
    if (matches) {
      // Check if properly handled
      matches.forEach(match => {
        if (!isProperlyHandled(content, match)) {
          fileIssues.push({
            file: relativePath,
            issue: name,
            severity,
            snippet: match.substring(0, 50),
          });
        }
      });
    }
  });
  
  // Check for XSS vulnerabilities
  if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
    securityChecks.xssPrevention.forEach(({ pattern, name, severity }) => {
      const matches = content.match(pattern);
      if (matches) {
        fileIssues.push({
          file: relativePath,
          issue: name,
          severity,
          count: matches.length,
        });
      }
    });
  }
  
  return fileIssues;
}

// Get line numbers for pattern matches
function getLineNumbers(content, pattern) {
  const lines = content.split('\n');
  const lineNumbers = [];
  
  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      lineNumbers.push(index + 1);
    }
  });
  
  return lineNumbers;
}

// Check if potentially dangerous code is properly handled
function isProperlyHandled(content, match) {
  // Check for try-catch around JSON.parse
  if (match.includes('JSON.parse')) {
    const index = content.indexOf(match);
    const before = content.substring(Math.max(0, index - 100), index);
    const after = content.substring(index, Math.min(content.length, index + 100));
    return before.includes('try') || after.includes('catch');
  }
  
  // Check for radix in parseInt
  if (match.includes('parseInt')) {
    return match.includes(',');
  }
  
  return false;
}

// Scan all source files
function scanSourceFiles() {
  console.log('\n📁 Scanning source files...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.js']);
  
  files.forEach(file => {
    const fileIssues = scanFile(file);
    if (fileIssues.length > 0) {
      issues.push(...fileIssues);
    }
  });
}

// Get all files recursively
function getAllFiles(dir, extensions) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(itemPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(itemPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Check for sensitive files
function checkSensitiveFiles() {
  console.log('\n🔍 Checking for sensitive files...\n');
  
  const rootDir = process.cwd();
  const allFiles = getAllFiles(rootDir, []);
  
  securityChecks.filePatterns.sensitive.forEach(pattern => {
    const found = allFiles.filter(file => 
      path.basename(file).toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (found.length > 0) {
      found.forEach(file => {
        warnings.push({
          type: 'sensitive-file',
          file: path.relative(rootDir, file),
          message: `Potentially sensitive file found: ${pattern}`,
        });
      });
    }
  });
}

// Check dependencies for known vulnerabilities
function checkDependencies() {
  console.log('\n📦 Checking dependencies...\n');
  
  try {
    // Run npm audit
    const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditResult);
    
    if (audit.metadata.vulnerabilities) {
      const vulns = audit.metadata.vulnerabilities;
      
      if (vulns.total > 0) {
        console.log(`Found ${vulns.total} vulnerabilities:`);
        console.log(`  Critical: ${vulns.critical}`);
        console.log(`  High: ${vulns.high}`);
        console.log(`  Moderate: ${vulns.moderate}`);
        console.log(`  Low: ${vulns.low}`);
        console.log(`  Info: ${vulns.info}`);
        
        if (vulns.critical > 0 || vulns.high > 0) {
          hasIssues = true;
        }
      } else {
        console.log('✅ No known vulnerabilities in dependencies');
      }
    }
  } catch (error) {
    // npm audit returns non-zero exit code if vulnerabilities found
    console.log('⚠️  npm audit found issues (run "npm audit" for details)');
  }
}

// Check for proper input validation
function checkInputValidation() {
  console.log('\n🛡️ Checking input validation...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const parsePlugins = path.join(srcDir, 'plugins', 'parse');
  
  if (fs.existsSync(parsePlugins)) {
    const files = getAllFiles(parsePlugins, ['.ts', '.js']);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for proper date validation
      if (!content.includes('isValid') && !content.includes('isNaN')) {
        warnings.push({
          type: 'validation',
          file: path.relative(process.cwd(), file),
          message: 'Missing date validation checks',
        });
      }
      
      // Check for bounds checking
      if (!content.includes('MAX') && !content.includes('MIN')) {
        warnings.push({
          type: 'validation',
          file: path.relative(process.cwd(), file),
          message: 'Missing bounds checking for date values',
        });
      }
    });
  }
}

// Check for proper error handling
function checkErrorHandling() {
  console.log('\n⚠️  Checking error handling...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir, ['.ts', '.js']);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(process.cwd(), file);
    
    // Check for unhandled promises
    if (content.includes('async') || content.includes('Promise')) {
      if (!content.includes('catch') && !content.includes('try')) {
        warnings.push({
          type: 'error-handling',
          file: relativePath,
          message: 'Potentially unhandled promise rejections',
        });
      }
    }
    
    // Check for proper null checks
    const nullablePatterns = [
      /\.\w+\(/g, // Method calls
      /\[\w+\]/g,  // Array/object access
    ];
    
    nullablePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 10) {
        // Many property accesses without null checks might be risky
        const hasNullChecks = content.includes('?') || 
                             content.includes('if (') || 
                             content.includes('&&');
        
        if (!hasNullChecks) {
          warnings.push({
            type: 'null-safety',
            file: relativePath,
            message: 'Many property accesses without null safety checks',
          });
        }
      }
    });
  });
}

// Check TypeScript strict mode
function checkTypeScriptConfig() {
  console.log('\n📝 Checking TypeScript configuration...\n');
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    const compilerOptions = tsconfig.compilerOptions || {};
    
    const recommendedOptions = {
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      strictFunctionTypes: true,
      strictBindCallApply: true,
      strictPropertyInitialization: true,
      noImplicitThis: true,
      alwaysStrict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
    };
    
    Object.entries(recommendedOptions).forEach(([option, recommended]) => {
      if (compilerOptions[option] !== recommended) {
        warnings.push({
          type: 'typescript-config',
          setting: option,
          message: `Consider enabling ${option} for better type safety`,
        });
      }
    });
  }
}

// Generate security report
function generateReport() {
  console.log('\n' + '=' .repeat(60));
  console.log('\n📊 Security Audit Report\n');
  
  // Group issues by severity
  const critical = issues.filter(i => i.severity === 'critical');
  const high = issues.filter(i => i.severity === 'high');
  const medium = issues.filter(i => i.severity === 'medium');
  const low = issues.filter(i => i.severity === 'low');
  const info = issues.filter(i => i.severity === 'info');
  
  if (critical.length > 0) {
    console.log('\n🚨 CRITICAL Issues:');
    critical.forEach(issue => {
      console.log(`  - ${issue.file}: ${issue.issue}`);
      if (issue.lines) {
        console.log(`    Lines: ${issue.lines.join(', ')}`);
      }
    });
    hasIssues = true;
  }
  
  if (high.length > 0) {
    console.log('\n⚠️  HIGH Priority Issues:');
    high.forEach(issue => {
      console.log(`  - ${issue.file}: ${issue.issue}`);
    });
    hasIssues = true;
  }
  
  if (medium.length > 0) {
    console.log('\n⚡ MEDIUM Priority Issues:');
    medium.forEach(issue => {
      console.log(`  - ${issue.file}: ${issue.issue}`);
    });
  }
  
  if (low.length > 0) {
    console.log('\n💡 LOW Priority Issues:');
    low.forEach(issue => {
      console.log(`  - ${issue.file}: ${issue.issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n📋 Warnings and Recommendations:');
    warnings.forEach(warning => {
      console.log(`  - [${warning.type}] ${warning.file || warning.setting || ''}: ${warning.message}`);
    });
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('\n📈 Summary:');
  console.log(`  Total issues found: ${issues.length}`);
  console.log(`  Critical: ${critical.length}`);
  console.log(`  High: ${high.length}`);
  console.log(`  Medium: ${medium.length}`);
  console.log(`  Low: ${low.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  
  if (!hasIssues && issues.length === 0) {
    console.log('\n✅ No critical security issues found!');
  } else if (hasIssues) {
    console.log('\n❌ Critical security issues found. Please fix them before release.');
  }
  
  // Recommendations
  console.log('\n💡 Security Best Practices:');
  console.log('  1. Always validate and sanitize user input');
  console.log('  2. Use parameterized queries for any database operations');
  console.log('  3. Implement proper error handling and logging');
  console.log('  4. Keep dependencies up to date');
  console.log('  5. Use TypeScript strict mode for better type safety');
  console.log('  6. Implement rate limiting for API endpoints');
  console.log('  7. Use secure random number generation for any security-critical operations');
  console.log('  8. Regularly run security audits and penetration testing');
  
  console.log('\n' + '=' .repeat(60));
}

// Main execution
function main() {
  try {
    scanSourceFiles();
    checkSensitiveFiles();
    checkDependencies();
    checkInputValidation();
    checkErrorHandling();
    checkTypeScriptConfig();
    generateReport();
    
    process.exit(hasIssues ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Security audit failed:', error.message);
    process.exit(1);
  }
}

// Run the audit
main();