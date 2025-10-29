/**
 * Performance Test Setup for Kairos
 * Specialized configuration for performance testing with detailed metrics
 */

// Import the enhanced setup
import './setup.enhanced';

// Performance test configuration
jest.setTimeout(60000); // Extended timeout for performance tests

// Performance monitoring utilities
export class PerformanceMonitor {
  private measurements: Map<string, Array<{timestamp: number; duration: number; memory: number}>> = new Map();
  private baselineMeasurements: Map<string, number> = new Map();

  // Start measuring a performance test
  startMeasurement(name: string): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
  }

  // End measuring a performance test
  endMeasurement(name: string): {duration: number; memory: number} {
    const memoryUsage = process.memoryUsage().heapUsed;
    const duration = performance.now();

    if (this.measurements.has(name)) {
      const measurements = this.measurements.get(name)!;
      measurements.push({
        timestamp: Date.now(),
        duration,
        memory: memoryUsage
      });
    }

    return { duration, memory: memoryUsage };
  }

  // Get performance statistics for a test
  getStatistics(name: string) {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const durations = measurements.map(m => m.duration);
    const memories = measurements.map(m => m.memory);

    return {
      count: measurements.length,
      duration: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        median: this.median(durations),
        p95: this.percentile(durations, 95),
        p99: this.percentile(durations, 99),
        total: durations.reduce((sum, d) => sum + d, 0)
      },
      memory: {
        min: Math.min(...memories),
        max: Math.max(...memories),
        average: memories.reduce((sum, m) => sum + m, 0) / memories.length,
        median: this.median(memories),
        peak: Math.max(...memories),
        baseline: this.baselineMeasurements.get(name) || 0,
        delta: measurements.length > 0 ?
          memories[memories.length - 1] - (this.baselineMeasurements.get(name) || memories[0]) : 0
      }
    };
  }

  // Set baseline measurement
  setBaseline(name: string, memoryUsage: number): void {
    this.baselineMeasurements.set(name, memoryUsage);
  }

  // Get all performance statistics
  getAllStatistics() {
    const stats: Record<string, any> = {};
    for (const [name] of this.measurements) {
      stats[name] = this.getStatistics(name);
    }
    return stats;
  }

  // Clear all measurements
  clear(): void {
    this.measurements.clear();
    this.baselineMeasurements.clear();
  }

  // Utility functions
  private median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ?
      (sorted[mid - 1] + sorted[mid]) / 2 :
      sorted[mid];
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

// Performance test utilities
export const performanceTestUtils = {
  monitor: new PerformanceMonitor(),

  // Benchmark a function
  async benchmark<T>(
    name: string,
    fn: () => T | Promise<T>,
    iterations: number = 100
  ): Promise<{
    name: string;
    iterations: number;
    statistics: any;
    results: T[];
  }> {
    console.log(`🏃 Running benchmark: ${name} (${iterations} iterations)`);

    this.monitor.startMeasurement(name);
    this.monitor.setBaseline(name, process.memoryUsage().heapUsed);

    const results: T[] = [];

    for (let i = 0; i < iterations; i++) {
      try {
        const result = await fn();
        results.push(result);
      } catch (error) {
        console.error(`❌ Benchmark error at iteration ${i + 1}:`, error);
        throw error;
      }

      // Yield control to prevent blocking
      if (i % 10 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    this.monitor.endMeasurement(name);
    const statistics = this.monitor.getStatistics(name);

    console.log(`✅ Benchmark complete: ${name}`);
    console.log(`   Average: ${statistics.duration.average.toFixed(2)}ms`);
    console.log(`   P95: ${statistics.duration.p95.toFixed(2)}ms`);
    console.log(`   Memory delta: ${(statistics.memory.delta / 1024 / 1024).toFixed(2)}MB`);

    return {
      name,
      iterations,
      statistics,
      results
    };
  },

  // Benchmark with different input sizes
  async benchmarkScalability<T>(
    name: string,
    fn: (size: number) => T | Promise<T>,
    sizes: number[] = [10, 100, 1000, 10000]
  ): Promise<Array<{
    size: number;
    statistics: any;
    duration: number;
  }>> {
    console.log(`📊 Running scalability test: ${name}`);

    const results = [];

    for (const size of sizes) {
      console.log(`  Testing size: ${size}`);

      const sizeName = `${name}_size_${size}`;
      this.monitor.startMeasurement(sizeName);

      const startTime = performance.now();
      try {
        await fn(size);
      } catch (error) {
        console.error(`❌ Scalability test error at size ${size}:`, error);
        throw error;
      }
      const duration = performance.now() - startTime;

      this.monitor.endMeasurement(sizeName);
      const statistics = this.monitor.getStatistics(sizeName);

      results.push({
        size,
        statistics,
        duration
      });

      console.log(`    Duration: ${duration.toFixed(2)}ms`);
    }

    return results;
  },

  // Memory leak detection
  async detectMemoryLeaks<T>(
    name: string,
    fn: () => T | Promise<T>,
    iterations: number = 1000,
    sampleRate: number = 100
  ): Promise<{
    name: string;
    hasLeak: boolean;
    memoryGrowth: number;
    samples: Array<{iteration: number; memory: number}>;
  }> {
    console.log(`🔍 Running memory leak detection: ${name}`);

    const samples: Array<{iteration: number; memory: number}> = [];
    const baselineMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      await fn();

      if (i % sampleRate === 0) {
        const currentMemory = process.memoryUsage().heapUsed;
        samples.push({
          iteration: i,
          memory: currentMemory
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = finalMemory - baselineMemory;
    const hasLeak = memoryGrowth > 10 * 1024 * 1024; // 10MB threshold

    console.log(`🔍 Memory leak detection complete: ${name}`);
    console.log(`   Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Leak detected: ${hasLeak ? 'YES' : 'NO'}`);

    return {
      name,
      hasLeak,
      memoryGrowth,
      samples
    };
  },

  // Concurrency test
  async testConcurrency<T>(
    name: string,
    fn: () => T | Promise<T>,
    concurrency: number = 10,
    operations: number = 100
  ): Promise<{
    name: string;
    concurrency: number;
    operations: number;
    totalTime: number;
    averageTime: number;
    throughput: number;
  }> {
    console.log(`⚡ Running concurrency test: ${name} (${concurrency} concurrent, ${operations} operations)`);

    const startTime = performance.now();
    const promises: Promise<T>[] = [];

    for (let i = 0; i < operations; i++) {
      promises.push(fn());

      // Limit concurrent promises
      if (promises.length >= concurrency) {
        await Promise.all(promises.splice(0, concurrency));
      }
    }

    // Wait for remaining promises
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    const totalTime = performance.now() - startTime;
    const averageTime = totalTime / operations;
    const throughput = operations / (totalTime / 1000);

    console.log(`✅ Concurrency test complete: ${name}`);
    console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`   Average time: ${averageTime.toFixed(2)}ms`);
    console.log(`   Throughput: ${throughput.toFixed(2)} ops/sec`);

    return {
      name,
      concurrency,
      operations,
      totalTime,
      averageTime,
      throughput
    };
  },

  // Stress test
  async stressTest<T>(
    name: string,
    fn: () => T | Promise<T>,
    duration: number = 30000 // 30 seconds
  ): Promise<{
    name: string;
    duration: number;
    operations: number;
    errors: number;
    averageTime: number;
    throughput: number;
  }> {
    console.log(`💪 Running stress test: ${name} (${duration}ms)`);

    const startTime = performance.now();
    const endTime = startTime + duration;
    let operations = 0;
    let errors = 0;

    while (Date.now() < endTime) {
      try {
        await fn();
        operations++;
      } catch (error) {
        errors++;
      }
    }

    const actualDuration = Date.now() - startTime;
    const averageTime = actualDuration / operations;
    const throughput = operations / (actualDuration / 1000);

    console.log(`💪 Stress test complete: ${name}`);
    console.log(`   Duration: ${actualDuration.toFixed(2)}ms`);
    console.log(`   Operations: ${operations}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Throughput: ${throughput.toFixed(2)} ops/sec`);

    return {
      name,
      duration: actualDuration,
      operations,
      errors,
      averageTime,
      throughput
    };
  },

  // Generate performance report
  generateReport(): string {
    const stats = this.monitor.getAllStatistics();

    let report = '\n📊 Performance Test Report\n';
    report += '═'.repeat(50) + '\n\n';

    for (const [testName, statistics] of Object.entries(stats)) {
      report += `📈 ${testName}\n`;
      report += `  Count: ${statistics.count}\n`;
      report += `  Duration:\n`;
      report += `    Average: ${statistics.duration.average.toFixed(2)}ms\n`;
      report += `    Min: ${statistics.duration.min.toFixed(2)}ms\n`;
      report += `    Max: ${statistics.duration.max.toFixed(2)}ms\n`;
      report += `    P95: ${statistics.duration.p95.toFixed(2)}ms\n`;
      report += `    P99: ${statistics.duration.p99.toFixed(2)}ms\n`;
      report += `  Memory:\n`;
      report += `    Average: ${(statistics.memory.average / 1024 / 1024).toFixed(2)}MB\n`;
      report += `    Peak: ${(statistics.memory.peak / 1024 / 1024).toFixed(2)}MB\n`;
      report += `    Delta: ${(statistics.memory.delta / 1024 / 1024).toFixed(2)}MB\n`;
      report += '\n';
    }

    return report;
  }
};

// Performance test setup
beforeAll(() => {
  console.log('🏃 Setting up performance test environment');

  // Enable garbage collection if available
  if (global.gc) {
    console.log('🗑️  Garbage collection enabled');
  } else {
    console.log('⚠️  Garbage collection not available (run with --expose-gc)');
  }

  // Set up performance monitoring
  (global as any).performanceTestUtils = performanceTestUtils;
  (global as any).performanceMonitor = performanceTestUtils.monitor;

  console.log('✅ Performance test environment ready');
});

afterAll(() => {
  console.log('📊 Generating performance report');
  const report = performanceTestUtils.generateReport();
  console.log(report);

  console.log('🧹 Cleaning up performance test environment');
  performanceTestUtils.monitor.clear();
});

// Make utilities globally available
(global as any).PerformanceMonitor = PerformanceMonitor;
(global as any).performanceTestUtils = performanceTestUtils;