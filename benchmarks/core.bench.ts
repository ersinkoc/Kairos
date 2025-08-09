import kairos from '../src/index';

interface BenchmarkResult {
  name: string;
  operations: number;
  time: number;
  opsPerSecond: number;
  memoryUsed?: number;
}

class Benchmark {
  private results: BenchmarkResult[] = [];

  async run(name: string, fn: () => void, iterations: number = 100000): Promise<BenchmarkResult> {
    // Warm up
    for (let i = 0; i < 100; i++) {
      fn();
    }

    // Measure memory before
    if (global.gc) {
      global.gc();
    }
    const memBefore = process.memoryUsage().heapUsed;

    // Run benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    const end = performance.now();

    // Measure memory after
    const memAfter = process.memoryUsage().heapUsed;
    const memoryUsed = (memAfter - memBefore) / 1024 / 1024; // MB

    const time = end - start;
    const opsPerSecond = Math.round((iterations / time) * 1000);

    const result: BenchmarkResult = {
      name,
      operations: iterations,
      time,
      opsPerSecond,
      memoryUsed
    };

    this.results.push(result);
    return result;
  }

  printResults() {
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                    KAIROS PERFORMANCE BENCHMARKS                  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    const maxNameLength = Math.max(...this.results.map(r => r.name.length));
    
    this.results.forEach(result => {
      const name = result.name.padEnd(maxNameLength);
      const ops = result.opsPerSecond.toLocaleString().padStart(12);
      const time = result.time.toFixed(2).padStart(8);
      const mem = result.memoryUsed ? `${result.memoryUsed.toFixed(2)} MB` : 'N/A';
      
      console.log(`${name} │ ${ops} ops/sec │ ${time}ms │ Memory: ${mem}`);
    });

    console.log('\n' + '─'.repeat(70));
    
    // Find fastest and slowest
    const sorted = [...this.results].sort((a, b) => b.opsPerSecond - a.opsPerSecond);
    console.log(`\n🏆 Fastest: ${sorted[0].name} (${sorted[0].opsPerSecond.toLocaleString()} ops/sec)`);
    console.log(`🐌 Slowest: ${sorted[sorted.length - 1].name} (${sorted[sorted.length - 1].opsPerSecond.toLocaleString()} ops/sec)`);
  }

  exportJSON(filename?: string): string {
    const data = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      results: this.results
    };
    
    const json = JSON.stringify(data, null, 2);
    
    if (filename) {
      require('fs').writeFileSync(filename, json);
    }
    
    return json;
  }
}

async function runCoreBenchmarks() {
  const bench = new Benchmark();

  // Instance creation
  await bench.run('Create instance (current time)', () => {
    kairos();
  });

  await bench.run('Create instance (string)', () => {
    kairos('2024-01-15');
  });

  await bench.run('Create instance (Date)', () => {
    kairos(new Date(2024, 0, 15));
  });

  await bench.run('Create instance (timestamp)', () => {
    kairos(1705276800000);
  });

  // Date manipulation
  const date = kairos('2024-01-15');
  
  await bench.run('Add days', () => {
    date.add(5, 'days');
  });

  await bench.run('Add months', () => {
    date.add(2, 'months');
  });

  await bench.run('Subtract days', () => {
    date.subtract(3, 'days');
  });

  await bench.run('Chain operations', () => {
    date.add(1, 'year').subtract(2, 'months').add(3, 'days');
  });

  // Formatting
  await bench.run('Format default', () => {
    date.format();
  });

  await bench.run('Format YYYY-MM-DD', () => {
    date.format('YYYY-MM-DD');
  });

  await bench.run('Format complex', () => {
    date.format('dddd, MMMM Do YYYY, h:mm:ss a');
  });

  await bench.run('To ISO string', () => {
    date.toISOString();
  });

  // Comparison
  const date2 = kairos('2024-02-15');
  
  await bench.run('Is before', () => {
    date.isBefore(date2);
  });

  await bench.run('Is after', () => {
    date.isAfter(date2);
  });

  await bench.run('Is same', () => {
    date.isSame(date2);
  });

  // Getters
  await bench.run('Get year', () => {
    date.year();
  });

  await bench.run('Get month', () => {
    date.month();
  });

  await bench.run('Get date', () => {
    date.date();
  });

  // Setters
  await bench.run('Set year', () => {
    date.year(2025);
  });

  await bench.run('Set month', () => {
    date.month(6);
  });

  // Cloning
  await bench.run('Clone instance', () => {
    date.clone();
  });

  // Conversion
  await bench.run('To Date object', () => {
    date.toDate();
  });

  await bench.run('Value of', () => {
    date.valueOf();
  });

  bench.printResults();
  bench.exportJSON('benchmark-results.json');
}

// Run if executed directly
if (require.main === module) {
  console.log('Running Kairos Core Benchmarks...\n');
  runCoreBenchmarks().catch(console.error);
}

export { Benchmark, runCoreBenchmarks };