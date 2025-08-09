export declare class LRUCache<K, V> {
    private cache;
    private maxSize;
    constructor(maxSize?: number);
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    clear(): void;
    size(): number;
}
export declare function memoize<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T;
export declare function createDateCache(): LRUCache<string, Date>;
export declare function createHolidayCache(): LRUCache<string, Date[]>;
//# sourceMappingURL=cache.d.ts.map