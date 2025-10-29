export class LRUCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
        this.maxSize = maxSize;
    }
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.cache.delete(key);
            this.cache.set(key, value);
            this.hits++;
            return value;
        }
        this.misses++;
        return undefined;
    }
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }
    has(key) {
        return this.cache.has(key);
    }
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    size() {
        return this.cache.size;
    }
    getHitRate() {
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
    getMultiple(keys) {
        const result = new Map();
        for (const key of keys) {
            const value = this.get(key);
            if (value !== undefined) {
                result.set(key, value);
            }
        }
        return result;
    }
    setMultiple(entries) {
        for (const [key, value] of entries) {
            this.set(key, value);
        }
    }
    cleanup(shouldEvict) {
        for (const [key, value] of this.cache) {
            if (shouldEvict(key, value)) {
                this.cache.delete(key);
            }
        }
    }
    delete(key) {
        return this.cache.delete(key);
    }
}
export function memoize(fn, keyGenerator, options) {
    const cache = new LRUCache(options?.maxSize || 1000);
    const ttl = options?.ttl;
    return ((...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        const cached = cache.get(key);
        if (cached) {
            if (!ttl || Date.now() - cached.timestamp < ttl) {
                return cached.value;
            }
            cache.delete(key);
        }
        const result = fn(...args);
        cache.set(key, { value: result, timestamp: Date.now() });
        return result;
    });
}
export function memoizeDate(fn, keyGenerator) {
    return memoize(fn, keyGenerator, { maxSize: 10000, ttl: 60000 });
}
export function memoizeExpensive(fn, keyGenerator) {
    return memoize(fn, keyGenerator, { maxSize: 5000, ttl: 300000 });
}
export function createDateCache() {
    return new LRUCache(10000);
}
export function createHolidayCache() {
    return new LRUCache(5000);
}
//# sourceMappingURL=cache.js.map