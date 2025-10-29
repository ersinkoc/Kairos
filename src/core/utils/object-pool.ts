/**
 * Advanced Object Pool System for Memory Management
 * Provides efficient object reuse to reduce garbage collection overhead
 */

export interface PoolableObject {
  reset?(): void;
  clone?(): PoolableObject;
}

// Make Date compatible with pool system
declare global {
  interface Date {
    reset?(): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Array<T> {
    reset?(): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Map<K, V> {
    reset?(): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Set<T> {
    reset?(): void;
  }
}

export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;
  private created = 0;
  private reused = 0;

  constructor(
    createFn: () => T,
    options?: {
      maxSize?: number;
      resetFn?: (obj: T) => void;
    }
  ) {
    this.createFn = createFn;
    this.resetFn =
      options?.resetFn ||
      ((obj: T) => {
        if (obj && typeof obj === 'object' && 'reset' in obj && typeof obj.reset === 'function') {
          obj.reset();
        }
      });
    this.maxSize = options?.maxSize || 100;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.reused++;
      return obj;
    }

    this.created++;
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      // Reset object using reset function
      if (this.resetFn) {
        this.resetFn(obj);
      }

      this.pool.push(obj);
    }
  }

  preWarm(count: number): void {
    for (let i = 0; i < count; i++) {
      const obj = this.createFn();
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool = [];
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      maxSize: this.maxSize,
      created: this.created,
      reused: this.reused,
      reuseRate: this.reused / (this.created + this.reused) || 0,
      efficiency: this.reused / this.created || 0,
    };
  }
}

// Predefined pools for common objects
export const datePool = new ObjectPool<Date>(() => new Date(), {
  maxSize: 50,
  resetFn: (date) => date.setTime(0),
});

export const arrayPool = new ObjectPool<Array<any>>(() => [], {
  maxSize: 20,
  resetFn: (arr) => (arr.length = 0),
});

export const mapPool = new ObjectPool<Map<any, any>>(() => new Map(), {
  maxSize: 20,
  resetFn: (map) => map.clear(),
});

export const setPool = new ObjectPool<Set<any>>(() => new Set(), {
  maxSize: 20,
  resetFn: (set) => set.clear(),
});

// Factory for creating custom pools
export function createPool<T>(
  createFn: () => T,
  options?: { maxSize?: number; resetFn?: (obj: T) => void }
): ObjectPool<T> {
  return new ObjectPool(createFn, options);
}

// Pool manager for coordinating multiple pools
export class PoolManager {
  private pools = new Map<string, ObjectPool<any>>();

  register<T>(
    name: string,
    createFn: () => T,
    options?: { maxSize?: number; resetFn?: (obj: T) => void }
  ): ObjectPool<T> {
    const pool = new ObjectPool(createFn, options);
    this.pools.set(name, pool);
    return pool;
  }

  getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name);
  }

  preWarmAll(counts: Record<string, number>): void {
    for (const [name, count] of Object.entries(counts)) {
      const pool = this.pools.get(name);
      if (pool) {
        pool.preWarm(count);
      }
    }
  }

  clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear();
    }
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name, pool] of this.pools) {
      stats[name] = pool.getStats();
    }
    return stats;
  }
}

// Global pool manager instance
export const globalPoolManager = new PoolManager();

// Register default pools
globalPoolManager.register('date', () => new Date(), {
  maxSize: 50,
  resetFn: (date: Date) => date.setTime(0),
});

globalPoolManager.register('array', () => [], {
  maxSize: 20,
  resetFn: (arr: any[]) => (arr.length = 0),
});

globalPoolManager.register('map', () => new Map(), {
  maxSize: 20,
  resetFn: (map: Map<any, any>) => map.clear(),
});

globalPoolManager.register('set', () => new Set(), {
  maxSize: 20,
  resetFn: (set: Set<any>) => set.clear(),
});
