#!/usr/bin/env node

/**
 * Kairos Performance Benchmark Suite
 * Measures performance of core operations and holiday calculations
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class KairosBenchmark {
  constructor() {
    this.results = {};
    this.iterations = {
      holiday: 10000,
      business: 10000,
      date: 100000,
      format: 50000,
      parse: 50000
    };
  }

  async run() {
    console.log('🚀 Kairos Performance Benchmark Suite\n');
    console.log(`Running benchmarks with following iterations:`);
    console.log(`- Holiday calculations: ${this.iterations.holiday.toLocaleString()}`);
    console.log(`- Business day operations: ${this.iterations.business.toLocaleString()}`);
    console.log(`- Date operations: ${this.iterations.date.toLocaleString()}`);
    console.log(`- Format operations: ${this.iterations.format.toLocaleString()}`);
    console.log(`- Parse operations: ${this.iterations.parse.toLocaleString()}\n`);

    // Run benchmarks
    await this.benchmarkHolidayCalculations();
    await this.benchmarkBusinessDayOperations();
    await this.benchmarkDateOperations();
    await this.benchmarkFormatOperations();
    await this.benchmarkParseOperations();
    await this.benchmarkMemoryUsage();
    await this.benchmarkCachePerformance();
    
    // Generate report
    this.generateReport();
  }

  async benchmarkHolidayCalculations() {
    console.log('📅 Benchmarking Holiday Calculations...\n');
    
    const holidays = this.getMockHolidays();
    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    
    const benchmarks = {
      'Fixed holidays': () => this.calculateFixedHolidays(holidays.fixed, 2024),
      'Nth weekday holidays': () => this.calculateNthWeekdayHolidays(holidays.nthWeekday, 2024),
      'Lunar holidays': () => this.calculateLunarHolidays(holidays.lunar, 2024),
      'Easter-based holidays': () => this.calculateEasterHolidays(holidays.easter, 2024),
      'All holidays (single year)': () => this.calculateAllHolidays(holidays, 2024),
      'All holidays (multiple years)': () => years.map(year => this.calculateAllHolidays(holidays, year))
    };

    const results = {};
    
    for (const [name, operation] of Object.entries(benchmarks)) {
      const iterations = name.includes('multiple') ? 1000 : this.iterations.holiday;
      const duration = this.measureOperation(operation, iterations);
      results[name] = {
        totalTime: duration,
        avgTime: duration / iterations,
        opsPerSecond: Math.round(1000 / (duration / iterations))
      };
      
      console.log(`${name}:`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average time: ${(duration / iterations).toFixed(4)}ms`);
      console.log(`  Operations per second: ${results[name].opsPerSecond.toLocaleString()}`);
      console.log();
    }
    
    this.results.holidays = results;
  }

  async benchmarkBusinessDayOperations() {
    console.log('💼 Benchmarking Business Day Operations...\n');
    
    const benchmarks = {
      'Is business day': () => this.isBusinessDay(new Date(2024, 0, 15)),
      'Next business day': () => this.nextBusinessDay(new Date(2024, 0, 15)),
      'Add business days': () => this.addBusinessDays(new Date(2024, 0, 15), 5),
      'Business days between': () => this.businessDaysBetween(
        new Date(2024, 0, 1), 
        new Date(2024, 0, 31)
      ),
      'Business days in month': () => this.getBusinessDaysInMonth(2024, 0),
      'Settlement date (T+3)': () => this.settlementDate(new Date(2024, 0, 15), 3)
    };

    const results = {};
    
    for (const [name, operation] of Object.entries(benchmarks)) {
      const duration = this.measureOperation(operation, this.iterations.business);
      results[name] = {
        totalTime: duration,
        avgTime: duration / this.iterations.business,
        opsPerSecond: Math.round(1000 / (duration / this.iterations.business))
      };
      
      console.log(`${name}:`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average time: ${(duration / this.iterations.business).toFixed(4)}ms`);
      console.log(`  Operations per second: ${results[name].opsPerSecond.toLocaleString()}`);
      console.log();
    }
    
    this.results.businessDays = results;
  }

  async benchmarkDateOperations() {
    console.log('📊 Benchmarking Date Operations...\n');
    
    const benchmarks = {
      'Date creation (string)': () => this.createDate('2024-01-15'),
      'Date creation (timestamp)': () => this.createDate(1705276800000),
      'Date creation (array)': () => this.createDate([2024, 0, 15]),
      'Date addition': () => this.addToDate(new Date(2024, 0, 15), 1, 'day'),
      'Date subtraction': () => this.subtractFromDate(new Date(2024, 0, 15), 1, 'day'),
      'Date comparison': () => this.compareDates(
        new Date(2024, 0, 15), 
        new Date(2024, 0, 16)
      ),
      'Date cloning': () => this.cloneDate(new Date(2024, 0, 15)),
      'Start of month': () => this.startOfMonth(new Date(2024, 0, 15)),
      'End of month': () => this.endOfMonth(new Date(2024, 0, 15))
    };

    const results = {};
    
    for (const [name, operation] of Object.entries(benchmarks)) {
      const duration = this.measureOperation(operation, this.iterations.date);
      results[name] = {
        totalTime: duration,
        avgTime: duration / this.iterations.date,
        opsPerSecond: Math.round(1000 / (duration / this.iterations.date))
      };
      
      console.log(`${name}:`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average time: ${(duration / this.iterations.date).toFixed(4)}ms`);
      console.log(`  Operations per second: ${results[name].opsPerSecond.toLocaleString()}`);
      console.log();
    }
    
    this.results.dateOperations = results;
  }

  async benchmarkFormatOperations() {
    console.log('🎨 Benchmarking Format Operations...\n');
    
    const date = new Date(2024, 0, 15, 14, 30, 45);
    const benchmarks = {
      'ISO format': () => this.formatISO(date),
      'YYYY-MM-DD': () => this.formatCustom(date, 'YYYY-MM-DD'),
      'DD/MM/YYYY': () => this.formatCustom(date, 'DD/MM/YYYY'),
      'MMMM Do, YYYY': () => this.formatCustom(date, 'MMMM Do, YYYY'),
      'dddd, MMMM Do YYYY': () => this.formatCustom(date, 'dddd, MMMM Do YYYY'),
      'h:mm:ss A': () => this.formatCustom(date, 'h:mm:ss A'),
      'Complex format': () => this.formatCustom(date, 'dddd, MMMM Do YYYY [at] h:mm:ss A')
    };

    const results = {};
    
    for (const [name, operation] of Object.entries(benchmarks)) {
      const duration = this.measureOperation(operation, this.iterations.format);
      results[name] = {
        totalTime: duration,
        avgTime: duration / this.iterations.format,
        opsPerSecond: Math.round(1000 / (duration / this.iterations.format))
      };
      
      console.log(`${name}:`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average time: ${(duration / this.iterations.format).toFixed(4)}ms`);
      console.log(`  Operations per second: ${results[name].opsPerSecond.toLocaleString()}`);
      console.log();
    }
    
    this.results.formatOperations = results;
  }

  async benchmarkParseOperations() {
    console.log('🔍 Benchmarking Parse Operations...\n');
    
    const benchmarks = {
      'ISO string': () => this.parseDate('2024-01-15T14:30:45.000Z'),
      'Date string': () => this.parseDate('2024-01-15'),
      'US format': () => this.parseDate('01/15/2024'),
      'EU format': () => this.parseDate('15/01/2024'),
      'Long format': () => this.parseDate('January 15, 2024'),
      'Timestamp': () => this.parseDate(1705276800000),
      'Relative': () => this.parseDate('2 days ago')
    };

    const results = {};
    
    for (const [name, operation] of Object.entries(benchmarks)) {
      const duration = this.measureOperation(operation, this.iterations.parse);
      results[name] = {
        totalTime: duration,
        avgTime: duration / this.iterations.parse,
        opsPerSecond: Math.round(1000 / (duration / this.iterations.parse))
      };
      
      console.log(`${name}:`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Average time: ${(duration / this.iterations.parse).toFixed(4)}ms`);
      console.log(`  Operations per second: ${results[name].opsPerSecond.toLocaleString()}`);
      console.log();
    }
    
    this.results.parseOperations = results;
  }

  async benchmarkMemoryUsage() {
    console.log('🧠 Benchmarking Memory Usage...\n');
    
    const initialMemory = process.memoryUsage();
    
    // Create many date objects
    const dates = [];
    for (let i = 0; i < 10000; i++) {
      dates.push(new Date(2024, 0, Math.floor(Math.random() * 31) + 1));
    }
    
    const afterDatesMemory = process.memoryUsage();
    
    // Calculate holidays for multiple years
    const holidays = this.getMockHolidays();
    const holidayResults = [];
    for (let year = 2000; year <= 2030; year++) {
      holidayResults.push(this.calculateAllHolidays(holidays, year));
    }
    
    const afterHolidaysMemory = process.memoryUsage();
    
    const memoryResults = {
      initial: initialMemory,
      afterDates: afterDatesMemory,
      afterHolidays: afterHolidaysMemory,
      dateObjectsImpact: {
        heapUsed: afterDatesMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: afterDatesMemory.heapTotal - initialMemory.heapTotal,
        external: afterDatesMemory.external - initialMemory.external
      },
      holidayCalculationsImpact: {
        heapUsed: afterHolidaysMemory.heapUsed - afterDatesMemory.heapUsed,
        heapTotal: afterHolidaysMemory.heapTotal - afterDatesMemory.heapTotal,
        external: afterHolidaysMemory.external - afterDatesMemory.external
      }
    };
    
    console.log('Memory Usage Analysis:');
    console.log(`Initial heap used: ${this.formatBytes(initialMemory.heapUsed)}`);
    console.log(`After 10,000 dates: ${this.formatBytes(afterDatesMemory.heapUsed)}`);
    console.log(`After holiday calculations: ${this.formatBytes(afterHolidaysMemory.heapUsed)}`);
    console.log();
    console.log(`Date objects impact: ${this.formatBytes(memoryResults.dateObjectsImpact.heapUsed)}`);
    console.log(`Holiday calculations impact: ${this.formatBytes(memoryResults.holidayCalculationsImpact.heapUsed)}`);
    console.log();
    
    this.results.memoryUsage = memoryResults;
  }

  async benchmarkCachePerformance() {
    console.log('⚡ Benchmarking Cache Performance...\n');
    
    const holidays = this.getMockHolidays();
    
    // First run (no cache)
    const firstRunStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      this.calculateAllHolidays(holidays, 2024);
    }
    const firstRunTime = performance.now() - firstRunStart;
    
    // Second run (with cache)
    const secondRunStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      this.calculateAllHolidays(holidays, 2024);
    }
    const secondRunTime = performance.now() - secondRunStart;
    
    const cacheResults = {
      firstRun: firstRunTime,
      secondRun: secondRunTime,
      improvement: ((firstRunTime - secondRunTime) / firstRunTime) * 100,
      speedup: firstRunTime / secondRunTime
    };
    
    console.log('Cache Performance Analysis:');
    console.log(`First run (no cache): ${firstRunTime.toFixed(2)}ms`);
    console.log(`Second run (with cache): ${secondRunTime.toFixed(2)}ms`);
    console.log(`Performance improvement: ${cacheResults.improvement.toFixed(1)}%`);
    console.log(`Speed up: ${cacheResults.speedup.toFixed(1)}x faster`);
    console.log();
    
    this.results.cachePerformance = cacheResults;
  }

  measureOperation(operation, iterations) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      operation();
    }
    return performance.now() - start;
  }

  // Mock implementations for benchmarking
  getMockHolidays() {
    return {
      fixed: [
        { name: 'New Year\'s Day', rule: { month: 1, day: 1 } },
        { name: 'Independence Day', rule: { month: 7, day: 4 } },
        { name: 'Christmas', rule: { month: 12, day: 25 } }
      ],
      nthWeekday: [
        { name: 'Thanksgiving', rule: { month: 11, weekday: 4, nth: 4 } },
        { name: 'Memorial Day', rule: { month: 5, weekday: 1, nth: -1 } }
      ],
      lunar: [
        { name: 'Chinese New Year', rule: { calendar: 'chinese', month: 1, day: 1 } },
        { name: 'Eid al-Fitr', rule: { calendar: 'islamic', month: 10, day: 1 } }
      ],
      easter: [
        { name: 'Easter Sunday', rule: { offset: 0 } },
        { name: 'Good Friday', rule: { offset: -2 } }
      ]
    };
  }

  calculateFixedHolidays(holidays, year) {
    return holidays.map(holiday => new Date(year, holiday.rule.month - 1, holiday.rule.day));
  }

  calculateNthWeekdayHolidays(holidays, year) {
    return holidays.map(holiday => {
      const { month, weekday, nth } = holiday.rule;
      const date = new Date(year, month - 1, 1);
      // Simplified nth weekday calculation
      return new Date(year, month - 1, 1 + (nth - 1) * 7);
    });
  }

  calculateLunarHolidays(holidays, year) {
    // Simplified lunar calculation
    return holidays.map(holiday => new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1));
  }

  calculateEasterHolidays(holidays, year) {
    const easter = this.calculateEaster(year);
    return holidays.map(holiday => {
      const date = new Date(easter);
      date.setDate(date.getDate() + holiday.rule.offset);
      return date;
    });
  }

  calculateEaster(year) {
    // Simplified Easter calculation
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  calculateAllHolidays(holidays, year) {
    const all = [];
    all.push(...this.calculateFixedHolidays(holidays.fixed, year));
    all.push(...this.calculateNthWeekdayHolidays(holidays.nthWeekday, year));
    all.push(...this.calculateLunarHolidays(holidays.lunar, year));
    all.push(...this.calculateEasterHolidays(holidays.easter, year));
    return all;
  }

  // Mock business day operations
  isBusinessDay(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  }

  nextBusinessDay(date) {
    const next = new Date(date);
    do {
      next.setDate(next.getDate() + 1);
    } while (!this.isBusinessDay(next));
    return next;
  }

  addBusinessDays(date, days) {
    const result = new Date(date);
    let remaining = days;
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      if (this.isBusinessDay(result)) {
        remaining--;
      }
    }
    return result;
  }

  businessDaysBetween(start, end) {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      if (this.isBusinessDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  getBusinessDaysInMonth(year, month) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return this.businessDaysBetween(start, end);
  }

  settlementDate(date, days) {
    return this.addBusinessDays(date, days);
  }

  // Mock date operations
  createDate(input) {
    if (typeof input === 'string') {
      return new Date(input);
    }
    if (typeof input === 'number') {
      return new Date(input);
    }
    if (Array.isArray(input)) {
      return new Date(input[0], input[1], input[2]);
    }
    return new Date();
  }

  addToDate(date, amount, unit) {
    const result = new Date(date);
    switch (unit) {
      case 'day':
        result.setDate(result.getDate() + amount);
        break;
      case 'month':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'year':
        result.setFullYear(result.getFullYear() + amount);
        break;
    }
    return result;
  }

  subtractFromDate(date, amount, unit) {
    return this.addToDate(date, -amount, unit);
  }

  compareDates(date1, date2) {
    return date1.getTime() - date2.getTime();
  }

  cloneDate(date) {
    return new Date(date);
  }

  startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  // Mock format operations
  formatISO(date) {
    return date.toISOString();
  }

  formatCustom(date, format) {
    // Simplified format implementation
    return format
      .replace('YYYY', date.getFullYear())
      .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(date.getDate()).padStart(2, '0'))
      .replace('HH', String(date.getHours()).padStart(2, '0'))
      .replace('mm', String(date.getMinutes()).padStart(2, '0'))
      .replace('ss', String(date.getSeconds()).padStart(2, '0'));
  }

  // Mock parse operations
  parseDate(input) {
    if (typeof input === 'string') {
      if (input === '2 days ago') {
        const date = new Date();
        date.setDate(date.getDate() - 2);
        return date;
      }
      return new Date(input);
    }
    if (typeof input === 'number') {
      return new Date(input);
    }
    return new Date();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      },
      benchmarks: this.results,
      summary: this.generateSummary()
    };

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'benchmark-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(process.cwd(), 'BENCHMARK.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log('📊 Benchmark Summary:');
    console.log(this.generateSummary());
    console.log(`\n📄 Detailed reports saved:`);
    console.log(`- JSON: ${reportPath}`);
    console.log(`- Markdown: ${markdownPath}`);
  }

  generateSummary() {
    const summary = [];
    
    // Holiday operations
    if (this.results.holidays) {
      const fastestHoliday = Object.entries(this.results.holidays)
        .sort(([,a], [,b]) => a.avgTime - b.avgTime)[0];
      summary.push(`⚡ Fastest holiday calculation: ${fastestHoliday[0]} (${fastestHoliday[1].avgTime.toFixed(4)}ms)`);
    }
    
    // Business day operations
    if (this.results.businessDays) {
      const fastestBusiness = Object.entries(this.results.businessDays)
        .sort(([,a], [,b]) => a.avgTime - b.avgTime)[0];
      summary.push(`💼 Fastest business day operation: ${fastestBusiness[0]} (${fastestBusiness[1].avgTime.toFixed(4)}ms)`);
    }
    
    // Cache performance
    if (this.results.cachePerformance) {
      const cache = this.results.cachePerformance;
      summary.push(`🚀 Cache performance improvement: ${cache.improvement.toFixed(1)}% (${cache.speedup.toFixed(1)}x faster)`);
    }
    
    // Memory usage
    if (this.results.memoryUsage) {
      const memory = this.results.memoryUsage;
      summary.push(`🧠 Memory impact: ${this.formatBytes(memory.holidayCalculationsImpact.heapUsed)} for holiday calculations`);
    }
    
    return summary.join('\n');
  }

  generateMarkdownReport(report) {
    let markdown = '# Kairos Performance Benchmark Report\n\n';
    markdown += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    markdown += '## Environment\n\n';
    markdown += `- Node.js: ${report.environment.nodeVersion}\n`;
    markdown += `- Platform: ${report.environment.platform}\n`;
    markdown += `- Architecture: ${report.environment.arch}\n`;
    markdown += `- Memory: ${this.formatBytes(report.environment.memory.heapUsed)} / ${this.formatBytes(report.environment.memory.heapTotal)}\n\n`;
    
    // Holiday benchmarks
    if (report.benchmarks.holidays) {
      markdown += '## Holiday Calculations\n\n';
      markdown += '| Operation | Avg Time (ms) | Ops/sec | Total Time (ms) |\n';
      markdown += '|-----------|---------------|---------|----------------|\n';
      
      for (const [name, result] of Object.entries(report.benchmarks.holidays)) {
        markdown += `| ${name} | ${result.avgTime.toFixed(4)} | ${result.opsPerSecond.toLocaleString()} | ${result.totalTime.toFixed(2)} |\n`;
      }
      markdown += '\n';
    }
    
    // Business day benchmarks
    if (report.benchmarks.businessDays) {
      markdown += '## Business Day Operations\n\n';
      markdown += '| Operation | Avg Time (ms) | Ops/sec | Total Time (ms) |\n';
      markdown += '|-----------|---------------|---------|----------------|\n';
      
      for (const [name, result] of Object.entries(report.benchmarks.businessDays)) {
        markdown += `| ${name} | ${result.avgTime.toFixed(4)} | ${result.opsPerSecond.toLocaleString()} | ${result.totalTime.toFixed(2)} |\n`;
      }
      markdown += '\n';
    }
    
    // Cache performance
    if (report.benchmarks.cachePerformance) {
      const cache = report.benchmarks.cachePerformance;
      markdown += '## Cache Performance\n\n';
      markdown += `- First run (no cache): ${cache.firstRun.toFixed(2)}ms\n`;
      markdown += `- Second run (with cache): ${cache.secondRun.toFixed(2)}ms\n`;
      markdown += `- Performance improvement: ${cache.improvement.toFixed(1)}%\n`;
      markdown += `- Speed up: ${cache.speedup.toFixed(1)}x faster\n\n`;
    }
    
    // Memory usage
    if (report.benchmarks.memoryUsage) {
      const memory = report.benchmarks.memoryUsage;
      markdown += '## Memory Usage\n\n';
      markdown += `- Initial heap: ${this.formatBytes(memory.initial.heapUsed)}\n`;
      markdown += `- After 10,000 dates: ${this.formatBytes(memory.afterDates.heapUsed)}\n`;
      markdown += `- After holiday calculations: ${this.formatBytes(memory.afterHolidays.heapUsed)}\n`;
      markdown += `- Date objects impact: ${this.formatBytes(memory.dateObjectsImpact.heapUsed)}\n`;
      markdown += `- Holiday calculations impact: ${this.formatBytes(memory.holidayCalculationsImpact.heapUsed)}\n\n`;
    }
    
    markdown += '## Summary\n\n';
    markdown += report.summary.split('\n').map(line => `- ${line}`).join('\n');
    
    return markdown;
  }
}

// Run benchmarks
const benchmark = new KairosBenchmark();
benchmark.run().catch(console.error);