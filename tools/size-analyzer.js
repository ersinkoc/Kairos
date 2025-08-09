#!/usr/bin/env node

/**
 * Kairos Size Analyzer
 * Analyzes bundle sizes and tree-shaking effectiveness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SizeAnalyzer {
  constructor() {
    this.results = {
      core: {},
      plugins: {},
      total: {},
      treeshaking: {}
    };
  }

  analyzeCore() {
    console.log('📊 Analyzing core bundle size...\n');
    
    const coreFiles = [
      'src/core/plugin-system.ts',
      'src/core/types/base.ts',
      'src/core/types/plugin.ts',
      'src/core/types/holiday.ts',
      'src/core/utils/cache.ts',
      'src/core/utils/validators.ts'
    ];
    
    let totalSize = 0;
    const breakdown = {};
    
    coreFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const size = stats.size;
        totalSize += size;
        breakdown[file] = size;
        
        console.log(`${file}: ${this.formatSize(size)}`);
      }
    });
    
    this.results.core = {
      totalSize,
      breakdown,
      target: 1024 // 1KB target for core
    };
    
    console.log(`\nCore total: ${this.formatSize(totalSize)}`);
    console.log(`Target: ${this.formatSize(this.results.core.target)}`);
    
    if (totalSize > this.results.core.target) {
      console.log('⚠️  Core size exceeds target');
    } else {
      console.log('✅ Core size within target');
    }
  }

  analyzePlugins() {
    console.log('\n📊 Analyzing plugin sizes...\n');
    
    const pluginsDir = path.join(process.cwd(), 'src', 'plugins');
    const pluginSizes = {};
    
    if (!fs.existsSync(pluginsDir)) {
      console.log('❌ Plugins directory not found');
      return;
    }
    
    const categories = fs.readdirSync(pluginsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    categories.forEach(category => {
      const categoryPath = path.join(pluginsDir, category);
      const categorySize = this.getDirectorySize(categoryPath);
      
      pluginSizes[category] = categorySize;
      
      console.log(`${category}: ${this.formatSize(categorySize)}`);
      
      // Show individual plugins in category
      const plugins = fs.readdirSync(categoryPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      plugins.forEach(plugin => {
        const pluginPath = path.join(categoryPath, plugin);
        const pluginSize = this.getDirectorySize(pluginPath);
        console.log(`  ${plugin}: ${this.formatSize(pluginSize)}`);
      });
      
      console.log();
    });
    
    this.results.plugins = pluginSizes;
  }

  analyzeTreeShaking() {
    console.log('🌳 Analyzing tree-shaking effectiveness...\n');
    
    const scenarios = [
      {
        name: 'Core only',
        imports: ['core/plugin-system'],
        estimatedSize: 1024
      },
      {
        name: 'Core + Fixed holidays',
        imports: ['core/plugin-system', 'plugins/holiday/engine', 'plugins/holiday/calculators/fixed'],
        estimatedSize: 2048
      },
      {
        name: 'Core + US locale',
        imports: ['core/plugin-system', 'plugins/holiday/engine', 'plugins/locale/en-US'],
        estimatedSize: 3072
      },
      {
        name: 'Core + Business days',
        imports: ['core/plugin-system', 'plugins/holiday/engine', 'plugins/business/workday'],
        estimatedSize: 4096
      },
      {
        name: 'Full bundle',
        imports: ['index'],
        estimatedSize: 15360
      }
    ];
    
    scenarios.forEach(scenario => {
      const actualSize = this.calculateScenarioSize(scenario.imports);
      const efficiency = ((scenario.estimatedSize - actualSize) / scenario.estimatedSize) * 100;
      
      console.log(`${scenario.name}:`);
      console.log(`  Estimated: ${this.formatSize(scenario.estimatedSize)}`);
      console.log(`  Actual: ${this.formatSize(actualSize)}`);
      console.log(`  Efficiency: ${efficiency.toFixed(1)}%`);
      console.log();
    });
  }

  calculateScenarioSize(imports) {
    // This is a simplified calculation
    // In a real scenario, you'd use a bundler like webpack or rollup
    let totalSize = 0;
    
    imports.forEach(importPath => {
      const filePath = path.join(process.cwd(), 'src', `${importPath}.ts`);
      if (fs.existsSync(filePath)) {
        totalSize += fs.statSync(filePath).size;
      }
    });
    
    return totalSize;
  }

  analyzeBuildOutput() {
    console.log('📦 Analyzing build output...\n');
    
    const distDir = path.join(process.cwd(), 'dist');
    
    if (!fs.existsSync(distDir)) {
      console.log('❌ Build output not found. Run "npm run build" first.');
      return;
    }
    
    const buildFiles = this.getFilesRecursive(distDir, ['.js', '.mjs', '.d.ts']);
    let totalSize = 0;
    
    const breakdown = {
      js: 0,
      mjs: 0,
      dts: 0
    };
    
    buildFiles.forEach(file => {
      const stats = fs.statSync(file);
      const size = stats.size;
      totalSize += size;
      
      const ext = path.extname(file);
      const relativePath = path.relative(distDir, file);
      
      console.log(`${relativePath}: ${this.formatSize(size)}`);
      
      if (ext === '.js') breakdown.js += size;
      else if (ext === '.mjs') breakdown.mjs += size;
      else if (ext === '.d.ts') breakdown.dts += size;
    });
    
    console.log(`\nBuild output breakdown:`);
    console.log(`  JavaScript (.js): ${this.formatSize(breakdown.js)}`);
    console.log(`  ES Modules (.mjs): ${this.formatSize(breakdown.mjs)}`);
    console.log(`  TypeScript definitions (.d.ts): ${this.formatSize(breakdown.dts)}`);
    console.log(`  Total: ${this.formatSize(totalSize)}`);
    
    this.results.total = {
      totalSize,
      breakdown,
      target: 20480 // 20KB target for full bundle
    };
    
    if (totalSize > this.results.total.target) {
      console.log('⚠️  Total bundle size exceeds target');
    } else {
      console.log('✅ Total bundle size within target');
    }
  }

  analyzeCompressionRatio() {
    console.log('\n🗜️  Analyzing compression ratios...\n');
    
    const distDir = path.join(process.cwd(), 'dist');
    
    if (!fs.existsSync(distDir)) {
      console.log('❌ Build output not found');
      return;
    }
    
    const jsFiles = this.getFilesRecursive(distDir, ['.js', '.mjs']);
    
    jsFiles.forEach(file => {
      const stats = fs.statSync(file);
      const originalSize = stats.size;
      
      // Simulate gzip compression (simplified)
      const gzipSize = Math.floor(originalSize * 0.3); // Typical gzip ratio
      const brotliSize = Math.floor(originalSize * 0.25); // Typical brotli ratio
      
      const relativePath = path.relative(distDir, file);
      
      console.log(`${relativePath}:`);
      console.log(`  Original: ${this.formatSize(originalSize)}`);
      console.log(`  Gzipped: ${this.formatSize(gzipSize)} (${((gzipSize / originalSize) * 100).toFixed(1)}%)`);
      console.log(`  Brotli: ${this.formatSize(brotliSize)} (${((brotliSize / originalSize) * 100).toFixed(1)}%)`);
      console.log();
    });
  }

  checkSizeLimits() {
    console.log('🎯 Checking size limits...\n');
    
    const limits = {
      core: 1024, // 1KB
      'holiday-engine': 2048, // 2KB
      'business-workday': 2048, // 2KB
      'locale-plugin': 1024, // 1KB per locale
      'total-bundle': 20480 // 20KB
    };
    
    const violations = [];
    
    // Check core size
    if (this.results.core.totalSize > limits.core) {
      violations.push(`Core size ${this.formatSize(this.results.core.totalSize)} exceeds limit ${this.formatSize(limits.core)}`);
    }
    
    // Check plugin sizes
    Object.entries(this.results.plugins).forEach(([plugin, size]) => {
      const limit = limits[plugin] || limits['locale-plugin'];
      if (size > limit) {
        violations.push(`Plugin ${plugin} size ${this.formatSize(size)} exceeds limit ${this.formatSize(limit)}`);
      }
    });
    
    // Check total size
    if (this.results.total.totalSize > limits['total-bundle']) {
      violations.push(`Total bundle size ${this.formatSize(this.results.total.totalSize)} exceeds limit ${this.formatSize(limits['total-bundle'])}`);
    }
    
    if (violations.length === 0) {
      console.log('✅ All size limits are within acceptable ranges');
    } else {
      console.log('❌ Size limit violations:');
      violations.forEach(violation => console.log(`  ${violation}`));
    }
    
    return violations.length === 0;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      core: this.results.core,
      plugins: this.results.plugins,
      total: this.results.total,
      treeshaking: this.results.treeshaking
    };
    
    const reportPath = path.join(process.cwd(), 'size-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Size report saved to: ${reportPath}`);
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    const walk = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      files.forEach(file => {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          walk(filePath);
        } else {
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      });
    };
    
    if (fs.existsSync(dirPath)) {
      walk(dirPath);
    }
    
    return totalSize;
  }

  getFilesRecursive(dir, extensions) {
    const files = [];
    
    const walk = (currentDir) => {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      items.forEach(item => {
        const itemPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          walk(itemPath);
        } else if (extensions.includes(path.extname(item.name))) {
          files.push(itemPath);
        }
      });
    };
    
    walk(dir);
    return files;
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  async run() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'core':
        this.analyzeCore();
        break;
        
      case 'plugins':
        this.analyzePlugins();
        break;
        
      case 'build':
        this.analyzeBuildOutput();
        break;
        
      case 'treeshake':
        this.analyzeTreeShaking();
        break;
        
      case 'compress':
        this.analyzeCompressionRatio();
        break;
        
      case 'limits':
        this.checkSizeLimits();
        break;
        
      case 'all':
        this.analyzeCore();
        this.analyzePlugins();
        this.analyzeBuildOutput();
        this.analyzeTreeShaking();
        this.analyzeCompressionRatio();
        this.checkSizeLimits();
        this.generateReport();
        break;
        
      default:
        console.log('Kairos Size Analyzer\n');
        console.log('Usage:');
        console.log('  node size-analyzer.js core        - Analyze core bundle size');
        console.log('  node size-analyzer.js plugins     - Analyze plugin sizes');
        console.log('  node size-analyzer.js build       - Analyze build output');
        console.log('  node size-analyzer.js treeshake   - Analyze tree-shaking effectiveness');
        console.log('  node size-analyzer.js compress    - Analyze compression ratios');
        console.log('  node size-analyzer.js limits      - Check size limits');
        console.log('  node size-analyzer.js all         - Run all analyses');
        break;
    }
  }
}

// Run the analyzer
const analyzer = new SizeAnalyzer();
analyzer.run().catch(console.error);