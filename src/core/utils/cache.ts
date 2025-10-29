export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      this.hits++;
      return value;
    }
    this.misses++;
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing entry
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used item
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  size(): number {
    return this.cache.size;
  }

  // Performance metrics
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.getHitRate(),
    };
  }

  // Batch operations for better performance
  getMultiple(keys: K[]): Map<K, V> {
    const result = new Map<K, V>();
    for (const key of keys) {
      const value = this.get(key);
      if (value !== undefined) {
        result.set(key, value);
      }
    }
    return result;
  }

  setMultiple(entries: Array<[K, V]>): void {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  // Cleanup expired entries (if timestamp is part of key)
  cleanup(shouldEvict: (key: K, value: V) => boolean): void {
    for (const [key, value] of this.cache) {
      if (shouldEvict(key, value)) {
        this.cache.delete(key);
      }
    }
  }

  // Remove a specific key
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  options?: {
    maxSize?: number;
    ttl?: number; // Time to live in milliseconds
  }
): T {
  const cache = new LRUCache<string, { value: ReturnType<T>; timestamp: number }>(
    options?.maxSize || 1000
  );
  const ttl = options?.ttl;

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    const cached = cache.get(key);
    if (cached) {
      // Check TTL if specified
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      // Expired entry
      cache.delete(key);
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;
}

// Specialized memoization for date operations
export function memoizeDate<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return memoize(fn, keyGenerator, { maxSize: 10000, ttl: 60000 }); // 1 minute TTL
}

// Memoize for expensive calculations (holidays, business days)
export function memoizeExpensive<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return memoize(fn, keyGenerator, { maxSize: 5000, ttl: 300000 }); // 5 minutes TTL
}

export function createDateCache(): LRUCache<string, Date> {
  return new LRUCache<string, Date>(10000);
}

export function createHolidayCache(): LRUCache<string, Date[]> {
  return new LRUCache<string, Date[]>(5000);
}
