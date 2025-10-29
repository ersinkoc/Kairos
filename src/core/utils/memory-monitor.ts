/**
 * Advanced Memory Monitoring System
 * Provides real-time memory usage tracking and alerting
 */

import { EventEmitter } from 'events';

export interface MemorySnapshot {
  timestamp: number;
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  heapLimit?: number;
}

export interface MemoryAlert {
  type: 'warning' | 'critical' | 'emergency';
  message: string;
  threshold: number;
  current: number;
  timestamp: number;
}

export interface MemoryThresholds {
  heapUsed?: { warning: number; critical: number; emergency: number };
  rss?: { warning: number; critical: number; emergency: number };
  heapGrowthRate?: { warning: number; critical: number; emergency: number };
}

export class MemoryMonitor extends EventEmitter {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots: number;
  private monitoring: boolean = false;
  private interval: NodeJS.Timeout | null = null;
  private thresholds: MemoryThresholds;
  private lastHeapUsed: number = 0;
  private checkInterval: number;

  constructor(options?: {
    maxSnapshots?: number;
    checkInterval?: number;
    thresholds?: MemoryThresholds;
  }) {
    super();

    this.maxSnapshots = options?.maxSnapshots || 100;
    this.checkInterval = options?.checkInterval || 1000; // 1 second
    this.thresholds = {
      heapUsed: {
        warning: 200, // 200MB
        critical: 400, // 400MB
        emergency: 600, // 600MB
      },
      rss: {
        warning: 300, // 300MB
        critical: 500, // 500MB
        emergency: 800, // 800MB
      },
      heapGrowthRate: {
        warning: 10, // 10MB per check
        critical: 20, // 20MB per check
        emergency: 50, // 50MB per check
      },
      ...options?.thresholds,
    };
  }

  private takeSnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      rss: memUsage.rss / 1024 / 1024, // MB
      heapTotal: memUsage.heapTotal / 1024 / 1024, // MB
      heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
      external: memUsage.external / 1024 / 1024, // MB
      arrayBuffers: memUsage.arrayBuffers / 1024 / 1024, // MB
    };

    // Add to snapshots array (maintain max size)
    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  private checkThresholds(snapshot: MemorySnapshot): MemoryAlert[] {
    const alerts: MemoryAlert[] = [];

    // Check heap usage
    if (this.thresholds.heapUsed) {
      const { warning, critical, emergency } = this.thresholds.heapUsed;

      if (snapshot.heapUsed >= emergency) {
        alerts.push({
          type: 'emergency',
          message: `Heap usage critically high: ${snapshot.heapUsed.toFixed(2)}MB`,
          threshold: emergency,
          current: snapshot.heapUsed,
          timestamp: snapshot.timestamp,
        });
      } else if (snapshot.heapUsed >= critical) {
        alerts.push({
          type: 'critical',
          message: `Heap usage very high: ${snapshot.heapUsed.toFixed(2)}MB`,
          threshold: critical,
          current: snapshot.heapUsed,
          timestamp: snapshot.timestamp,
        });
      } else if (snapshot.heapUsed >= warning) {
        alerts.push({
          type: 'warning',
          message: `Heap usage elevated: ${snapshot.heapUsed.toFixed(2)}MB`,
          threshold: warning,
          current: snapshot.heapUsed,
          timestamp: snapshot.timestamp,
        });
      }
    }

    // Check RSS
    if (this.thresholds.rss) {
      const { warning, critical, emergency } = this.thresholds.rss;

      if (snapshot.rss >= emergency) {
        alerts.push({
          type: 'emergency',
          message: `RSS critically high: ${snapshot.rss.toFixed(2)}MB`,
          threshold: emergency,
          current: snapshot.rss,
          timestamp: snapshot.timestamp,
        });
      } else if (snapshot.rss >= critical) {
        alerts.push({
          type: 'critical',
          message: `RSS very high: ${snapshot.rss.toFixed(2)}MB`,
          threshold: critical,
          current: snapshot.rss,
          timestamp: snapshot.timestamp,
        });
      } else if (snapshot.rss >= warning) {
        alerts.push({
          type: 'warning',
          message: `RSS elevated: ${snapshot.rss.toFixed(2)}MB`,
          threshold: warning,
          current: snapshot.rss,
          timestamp: snapshot.timestamp,
        });
      }
    }

    // Check heap growth rate
    if (this.thresholds.heapGrowthRate && this.lastHeapUsed > 0) {
      const growth = snapshot.heapUsed - this.lastHeapUsed;
      const { warning, critical, emergency } = this.thresholds.heapGrowthRate;

      if (growth >= emergency) {
        alerts.push({
          type: 'emergency',
          message: `Rapid heap growth: ${growth.toFixed(2)}MB in ${this.checkInterval}ms`,
          threshold: emergency,
          current: growth,
          timestamp: snapshot.timestamp,
        });
      } else if (growth >= critical) {
        alerts.push({
          type: 'critical',
          message: `High heap growth: ${growth.toFixed(2)}MB in ${this.checkInterval}ms`,
          threshold: critical,
          current: growth,
          timestamp: snapshot.timestamp,
        });
      } else if (growth >= warning) {
        alerts.push({
          type: 'warning',
          message: `Heap growth detected: ${growth.toFixed(2)}MB in ${this.checkInterval}ms`,
          threshold: warning,
          current: growth,
          timestamp: snapshot.timestamp,
        });
      }
    }

    this.lastHeapUsed = snapshot.heapUsed;
    return alerts;
  }

  private monitor(): void {
    const snapshot = this.takeSnapshot();
    const alerts = this.checkThresholds(snapshot);

    // Emit alerts
    for (const alert of alerts) {
      this.emit('alert', alert);

      if (alert.type === 'emergency') {
        this.emit('emergency', alert);
      } else if (alert.type === 'critical') {
        this.emit('critical', alert);
      }
    }

    // Emit snapshot
    this.emit('snapshot', snapshot);
  }

  start(): void {
    if (this.monitoring) {
      return;
    }

    this.monitoring = true;
    this.interval = setInterval(() => {
      this.monitor();
    }, this.checkInterval);

    this.emit('started');
  }

  stop(): void {
    if (!this.monitoring) {
      return;
    }

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.monitoring = false;
    this.emit('stopped');
  }

  isMonitoring(): boolean {
    return this.monitoring;
  }

  getSnapshots(count?: number): MemorySnapshot[] {
    if (count) {
      return this.snapshots.slice(-count);
    }
    return [...this.snapshots];
  }

  getLatestSnapshot(): MemorySnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  getStats() {
    if (this.snapshots.length === 0) {
      return null;
    }

    const heapUsages = this.snapshots.map((s) => s.heapUsed);
    const rssUsages = this.snapshots.map((s) => s.rss);

    return {
      snapshotCount: this.snapshots.length,
      monitoring: this.monitoring,
      checkInterval: this.checkInterval,
      timeRange: {
        start: this.snapshots[0].timestamp,
        end: this.snapshots[this.snapshots.length - 1].timestamp,
        duration: this.snapshots[this.snapshots.length - 1].timestamp - this.snapshots[0].timestamp,
      },
      heap: {
        current: this.snapshots[this.snapshots.length - 1].heapUsed,
        min: Math.min(...heapUsages),
        max: Math.max(...heapUsages),
        avg: heapUsages.reduce((sum, val) => sum + val, 0) / heapUsages.length,
        growth: this.snapshots[this.snapshots.length - 1].heapUsed - this.snapshots[0].heapUsed,
      },
      rss: {
        current: this.snapshots[this.snapshots.length - 1].rss,
        min: Math.min(...rssUsages),
        max: Math.max(...rssUsages),
        avg: rssUsages.reduce((sum, val) => sum + val, 0) / rssUsages.length,
        growth: this.snapshots[this.snapshots.length - 1].rss - this.snapshots[0].rss,
      },
    };
  }

  clearSnapshots(): void {
    this.snapshots = [];
    this.lastHeapUsed = 0;
    this.emit('cleared');
  }

  updateThresholds(newThresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.emit('thresholds-updated', this.thresholds);
  }

  getThresholds(): MemoryThresholds {
    return { ...this.thresholds };
  }

  // Utility method to force garbage collection if available
  forceGC(): boolean {
    if (global.gc) {
      global.gc();
      this.emit('gc-forced');
      return true;
    }
    return false;
  }

  // Memory leak detection
  detectMemoryLeaks(windowSize: number = 10, threshold: number = 5): boolean {
    if (this.snapshots.length < windowSize) {
      return false;
    }

    const recent = this.snapshots.slice(-windowSize);
    const heapUsages = recent.map((s) => s.heapUsed);

    // Check if memory is consistently growing
    let growingCount = 0;
    for (let i = 1; i < heapUsages.length; i++) {
      if (heapUsages[i] > heapUsages[i - 1]) {
        growingCount++;
      }
    }

    const growthRatio = growingCount / (heapUsages.length - 1);
    const totalGrowth = heapUsages[heapUsages.length - 1] - heapUsages[0];

    const isLeaking = growthRatio > 0.7 && totalGrowth > threshold;

    if (isLeaking) {
      this.emit('memory-leak-detected', {
        windowSize,
        growthRatio,
        totalGrowth,
        duration: recent[recent.length - 1].timestamp - recent[0].timestamp,
      });
    }

    return isLeaking;
  }
}

// Global memory monitor instance
export const globalMemoryMonitor = new MemoryMonitor();
