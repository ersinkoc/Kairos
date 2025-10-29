export declare class LRUCache<K, V> {
    private cache;
    private maxSize;
    private hits;
    private misses;
    constructor(maxSize?: number);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    clear(): void;
    size(): number;
    getHitRate(): number;
    getStats(): {
        size: number;
        maxSize: number;
        hits: number;
        misses: number;
        hitRate: number;
    };
    getMultiple(keys: K[]): Map<K, V>;
    setMultiple(entries: Array<[K, V]>): void;
    cleanup(shouldEvict: (key: K, value: V) => boolean): void;
    delete(key: K): boolean;
}
export declare function memoize<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string, options?: {
    maxSize?: number;
    ttl?: number;
}): T;
export declare function memoizeDate<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T;
export declare function memoizeExpensive<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T;
export declare function createDateCache(): LRUCache<string, Date>;
export declare function createHolidayCache(): LRUCache<string, Date[]>;
//# sourceMappingURL=cache.d.ts.map