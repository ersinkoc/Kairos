/*!
 * Kairos v1.1.0
 * (c) 2025 Ersin Koc
 * Released under the MIT License
 * https://github.com/ersinkoc/kairos
 */
var kairos = (function (exports, events) {
    'use strict';

    class LRUCache {
        constructor(maxSize = 1000) {
            this.cache = new Map();
            this.hits = 0;
            this.misses = 0;
            if (maxSize <= 0 || !Number.isInteger(maxSize)) {
                throw new Error('maxSize must be a positive integer');
            }
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
    function memoize(fn, keyGenerator, options) {
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
    function memoizeDate(fn, keyGenerator) {
        return memoize(fn, keyGenerator, { maxSize: 10000, ttl: 60000 });
    }
    function createDateCache() {
        return new LRUCache(10000);
    }
    function createHolidayCache() {
        return new LRUCache(5000);
    }

    class ObjectPool {
        constructor(createFn, options) {
            this.pool = [];
            this.created = 0;
            this.reused = 0;
            this.createFn = createFn;
            this.resetFn =
                options?.resetFn ||
                    ((obj) => {
                        if (obj && typeof obj === 'object' && 'reset' in obj && typeof obj.reset === 'function') {
                            obj.reset();
                        }
                    });
            this.maxSize = options?.maxSize || 100;
        }
        acquire() {
            if (this.pool.length > 0) {
                const obj = this.pool.pop();
                this.reused++;
                return obj;
            }
            this.created++;
            return this.createFn();
        }
        release(obj) {
            if (this.pool.length < this.maxSize) {
                if (this.resetFn) {
                    this.resetFn(obj);
                }
                this.pool.push(obj);
            }
        }
        preWarm(count) {
            for (let i = 0; i < count; i++) {
                const obj = this.createFn();
                this.pool.push(obj);
            }
        }
        clear() {
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
    const datePool = new ObjectPool(() => new Date(), {
        maxSize: 50,
        resetFn: (date) => date.setTime(0),
    });
    new ObjectPool(() => [], {
        maxSize: 20,
        resetFn: (arr) => (arr.length = 0),
    });
    new ObjectPool(() => new Map(), {
        maxSize: 20,
        resetFn: (map) => map.clear(),
    });
    new ObjectPool(() => new Set(), {
        maxSize: 20,
        resetFn: (set) => set.clear(),
    });
    function createPool(createFn, options) {
        return new ObjectPool(createFn, options);
    }
    class PoolManager {
        constructor() {
            this.pools = new Map();
        }
        register(name, createFn, options) {
            const pool = new ObjectPool(createFn, options);
            this.pools.set(name, pool);
            return pool;
        }
        getPool(name) {
            return this.pools.get(name);
        }
        preWarmAll(counts) {
            for (const [name, count] of Object.entries(counts)) {
                const pool = this.pools.get(name);
                if (pool) {
                    pool.preWarm(count);
                }
            }
        }
        clearAll() {
            for (const pool of this.pools.values()) {
                pool.clear();
            }
        }
        getAllStats() {
            const stats = {};
            for (const [name, pool] of this.pools) {
                stats[name] = pool.getStats();
            }
            return stats;
        }
    }
    const globalPoolManager = new PoolManager();
    globalPoolManager.register('date', () => new Date(), {
        maxSize: 50,
        resetFn: (date) => date.setTime(0),
    });
    globalPoolManager.register('array', () => [], {
        maxSize: 20,
        resetFn: (arr) => (arr.length = 0),
    });
    globalPoolManager.register('map', () => new Map(), {
        maxSize: 20,
        resetFn: (map) => map.clear(),
    });
    globalPoolManager.register('set', () => new Set(), {
        maxSize: 20,
        resetFn: (set) => set.clear(),
    });

    class MemoryMonitor extends events.EventEmitter {
        constructor(options) {
            super();
            this.snapshots = [];
            this.monitoring = false;
            this.interval = null;
            this.lastHeapUsed = 0;
            this.maxSnapshots = options?.maxSnapshots || 100;
            this.checkInterval = options?.checkInterval || 1000;
            this.thresholds = {
                heapUsed: {
                    warning: 200,
                    critical: 400,
                    emergency: 600,
                },
                rss: {
                    warning: 300,
                    critical: 500,
                    emergency: 800,
                },
                heapGrowthRate: {
                    warning: 10,
                    critical: 20,
                    emergency: 50,
                },
                ...options?.thresholds,
            };
        }
        takeSnapshot() {
            const memUsage = process.memoryUsage();
            const snapshot = {
                timestamp: Date.now(),
                rss: memUsage.rss / 1024 / 1024,
                heapTotal: memUsage.heapTotal / 1024 / 1024,
                heapUsed: memUsage.heapUsed / 1024 / 1024,
                external: memUsage.external / 1024 / 1024,
                arrayBuffers: memUsage.arrayBuffers / 1024 / 1024,
            };
            this.snapshots.push(snapshot);
            if (this.snapshots.length > this.maxSnapshots) {
                this.snapshots.shift();
            }
            return snapshot;
        }
        checkThresholds(snapshot) {
            const alerts = [];
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
                }
                else if (snapshot.heapUsed >= critical) {
                    alerts.push({
                        type: 'critical',
                        message: `Heap usage very high: ${snapshot.heapUsed.toFixed(2)}MB`,
                        threshold: critical,
                        current: snapshot.heapUsed,
                        timestamp: snapshot.timestamp,
                    });
                }
                else if (snapshot.heapUsed >= warning) {
                    alerts.push({
                        type: 'warning',
                        message: `Heap usage elevated: ${snapshot.heapUsed.toFixed(2)}MB`,
                        threshold: warning,
                        current: snapshot.heapUsed,
                        timestamp: snapshot.timestamp,
                    });
                }
            }
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
                }
                else if (snapshot.rss >= critical) {
                    alerts.push({
                        type: 'critical',
                        message: `RSS very high: ${snapshot.rss.toFixed(2)}MB`,
                        threshold: critical,
                        current: snapshot.rss,
                        timestamp: snapshot.timestamp,
                    });
                }
                else if (snapshot.rss >= warning) {
                    alerts.push({
                        type: 'warning',
                        message: `RSS elevated: ${snapshot.rss.toFixed(2)}MB`,
                        threshold: warning,
                        current: snapshot.rss,
                        timestamp: snapshot.timestamp,
                    });
                }
            }
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
                }
                else if (growth >= critical) {
                    alerts.push({
                        type: 'critical',
                        message: `High heap growth: ${growth.toFixed(2)}MB in ${this.checkInterval}ms`,
                        threshold: critical,
                        current: growth,
                        timestamp: snapshot.timestamp,
                    });
                }
                else if (growth >= warning) {
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
        monitor() {
            const snapshot = this.takeSnapshot();
            const alerts = this.checkThresholds(snapshot);
            for (const alert of alerts) {
                this.emit('alert', alert);
                if (alert.type === 'emergency') {
                    this.emit('emergency', alert);
                }
                else if (alert.type === 'critical') {
                    this.emit('critical', alert);
                }
            }
            this.emit('snapshot', snapshot);
        }
        start() {
            if (this.monitoring) {
                return;
            }
            this.monitoring = true;
            this.interval = setInterval(() => {
                this.monitor();
            }, this.checkInterval);
            this.emit('started');
        }
        stop() {
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
        isMonitoring() {
            return this.monitoring;
        }
        getSnapshots(count) {
            if (count) {
                return this.snapshots.slice(-count);
            }
            return [...this.snapshots];
        }
        getLatestSnapshot() {
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
        clearSnapshots() {
            this.snapshots = [];
            this.lastHeapUsed = 0;
            this.emit('cleared');
        }
        updateThresholds(newThresholds) {
            this.thresholds = { ...this.thresholds, ...newThresholds };
            this.emit('thresholds-updated', this.thresholds);
        }
        getThresholds() {
            return { ...this.thresholds };
        }
        forceGC() {
            if (global.gc) {
                global.gc();
                this.emit('gc-forced');
                return true;
            }
            return false;
        }
        detectMemoryLeaks(windowSize = 10, threshold = 5) {
            if (this.snapshots.length < windowSize) {
                return false;
            }
            const recent = this.snapshots.slice(-windowSize);
            const heapUsages = recent.map((s) => s.heapUsed);
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
    const globalMemoryMonitor = new MemoryMonitor();

    function isValidDate(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    function isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }
    function isValidString(value) {
        return typeof value === 'string' && value.length > 0;
    }
    function isValidYear$1(year) {
        return isValidNumber(year) && year >= 1 && year <= 9999;
    }
    function isValidMonth$1(month) {
        return isValidNumber(month) && month >= 1 && month <= 12;
    }
    function isValidDay$1(day) {
        return isValidNumber(day) && day >= 1 && day <= 31;
    }
    function isValidWeekday(weekday) {
        return isValidNumber(weekday) && weekday >= 0 && weekday <= 6;
    }
    function isValidNth(nth) {
        return isValidNumber(nth) && ((nth >= 1 && nth <= 5) || nth === -1);
    }
    function validateHolidayRule$1(rule) {
        const errors = [];
        if (!rule || typeof rule !== 'object') {
            errors.push('Rule must be an object');
            return errors;
        }
        if (!isValidString(rule.name)) {
            errors.push('Rule name must be a non-empty string');
        }
        const validTypes = ['fixed', 'nth-weekday', 'relative', 'lunar', 'easter-based', 'custom'];
        if (!validTypes.includes(rule.type)) {
            errors.push(`Rule type must be one of: ${validTypes.join(', ')}`);
        }
        if (!rule.rule || typeof rule.rule !== 'object') {
            errors.push('Rule must have a rule property');
            return errors;
        }
        switch (rule.type) {
            case 'fixed':
                if (!isValidMonth$1(rule.rule.month)) {
                    errors.push('Fixed rule month must be 1-12');
                }
                if (!isValidDay$1(rule.rule.day)) {
                    errors.push('Fixed rule day must be 1-31');
                }
                break;
            case 'nth-weekday':
                if (!isValidMonth$1(rule.rule.month)) {
                    errors.push('Nth-weekday rule month must be 1-12');
                }
                if (!isValidWeekday(rule.rule.weekday)) {
                    errors.push('Nth-weekday rule weekday must be 0-6');
                }
                if (!isValidNth(rule.rule.nth)) {
                    errors.push('Nth-weekday rule nth must be 1-5 or -1');
                }
                break;
            case 'relative':
                if (!isValidString(rule.rule.relativeTo)) {
                    errors.push('Relative rule relativeTo must be a non-empty string');
                }
                if (!isValidNumber(rule.rule.offset)) {
                    errors.push('Relative rule offset must be a number');
                }
                break;
            case 'lunar': {
                const validCalendars = ['islamic', 'chinese', 'hebrew', 'persian'];
                if (!validCalendars.includes(rule.rule.calendar)) {
                    errors.push(`Lunar rule calendar must be one of: ${validCalendars.join(', ')}`);
                }
                if (!isValidMonth$1(rule.rule.month)) {
                    errors.push('Lunar rule month must be 1-12');
                }
                if (!isValidDay$1(rule.rule.day)) {
                    errors.push('Lunar rule day must be 1-31');
                }
                break;
            }
            case 'easter-based':
                if (!isValidNumber(rule.rule.offset)) {
                    errors.push('Easter-based rule offset must be a number');
                }
                break;
            case 'custom':
                if (typeof rule.rule.calculate !== 'function') {
                    errors.push('Custom rule must have a calculate function');
                }
                break;
        }
        return errors;
    }
    function throwError(message, code) {
        const error = new Error(message);
        if (code) {
            error.code = code;
        }
        throw error;
    }

    const isKairosInstance = (obj) => {
        return obj !== null && typeof obj === 'object' && '_date' in obj && obj._date instanceof Date;
    };
    const hasToDateMethod = (obj) => {
        return (obj !== null && typeof obj === 'object' && 'toDate' in obj && typeof obj.toDate === 'function');
    };
    const isDateLike = (obj) => {
        return (obj !== null &&
            typeof obj === 'object' &&
            (('year' in obj && 'month' in obj && 'day' in obj) || 'date' in obj));
    };
    const globalCache = new LRUCache(1000);
    const REGEX_CACHE = {
        dateOnly: /^\d{4}-\d{2}-\d{2}$/,
        european: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
        iso8601: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
        usFormat: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    };
    const parseCache = new LRUCache(5000);
    const isValidDateComponents = (year, month, day) => {
        if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
            return false;
        }
        const date = new Date(year, month - 1, day, 0, 0, 0, 0);
        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    };
    const parseISODate = memoizeDate((input) => {
        if (REGEX_CACHE.dateOnly.test(input)) {
            const [year, month, day] = input.split('-').map(Number);
            if (isValidDateComponents(year, month, day)) {
                return new Date(year, month - 1, day, 0, 0, 0, 0);
            }
            return null;
        }
        return null;
    }, (input) => input);
    const parseEuropeanDate = memoizeDate((input) => {
        const match = input.match(REGEX_CACHE.european);
        if (match) {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const year = parseInt(match[3], 10);
            if (isValidDateComponents(year, month, day)) {
                return new Date(year, month - 1, day, 0, 0, 0, 0);
            }
            return null;
        }
        return null;
    }, (input) => input);
    const parseUSDate = memoizeDate((input) => {
        const match = input.match(REGEX_CACHE.usFormat);
        if (match) {
            const month = parseInt(match[1], 10);
            const day = parseInt(match[2], 10);
            const year = parseInt(match[3], 10);
            if (isValidDateComponents(year, month, day)) {
                return new Date(year, month - 1, day, 0, 0, 0, 0);
            }
            return null;
        }
        return null;
    }, (input) => input);
    class KairosCore {
        static enableMemoryMonitoring(thresholds) {
            if (!this._memoryMonitorEnabled) {
                if (thresholds) {
                    globalMemoryMonitor.updateThresholds(thresholds);
                }
                globalMemoryMonitor.start();
                this._memoryMonitorEnabled = true;
                globalMemoryMonitor.on('emergency', (alert) => {
                    console.error(`🚨 Memory Emergency: ${alert.message}`);
                    globalMemoryMonitor.forceGC();
                });
                globalMemoryMonitor.on('critical', (alert) => {
                    console.warn(`⚠️ Memory Critical: ${alert.message}`);
                });
                globalMemoryMonitor.on('memory-leak-detected', (info) => {
                    console.error(`💧 Memory Leak Detected: Growth ratio: ${(info.growthRatio * 100).toFixed(1)}%`);
                });
            }
        }
        static disableMemoryMonitoring() {
            if (this._memoryMonitorEnabled) {
                globalMemoryMonitor.stop();
                this._memoryMonitorEnabled = false;
            }
        }
        static isMemoryMonitoringEnabled() {
            return this._memoryMonitorEnabled;
        }
        static enableObjectPooling() {
            this._objectPoolEnabled = true;
            globalPoolManager.preWarmAll({
                date: 20,
                array: 10,
                map: 5,
                set: 5,
            });
        }
        static disableObjectPooling() {
            this._objectPoolEnabled = false;
            globalPoolManager.clearAll();
        }
        static isObjectPoolingEnabled() {
            return this._objectPoolEnabled;
        }
        static getMemoryStats() {
            return globalMemoryMonitor.getStats();
        }
        static getObjectPoolStats() {
            return globalPoolManager.getAllStats();
        }
        constructor(input) {
            this._date = this.parseInput(input);
        }
        parseInput(input) {
            if (input === NO_ARG) {
                return new Date();
            }
            if (input === null || input === undefined) {
                return new Date(NaN);
            }
            if (input instanceof Date) {
                return new Date(input.getTime());
            }
            if (typeof input === 'number') {
                return isNaN(input) ? new Date(NaN) : new Date(input);
            }
            if (typeof input === 'string') {
                if (parseCache.has(input)) {
                    const cached = parseCache.get(input);
                    return new Date(cached.getTime());
                }
                if (input.length === 0 || input.toLowerCase() === 'invalid') {
                    const invalid = new Date(NaN);
                    parseCache.set(input, invalid);
                    return invalid;
                }
                let result = null;
                result = parseISODate(input);
                if (result) {
                    parseCache.set(input, result);
                    return result;
                }
                result = parseEuropeanDate(input);
                if (result) {
                    parseCache.set(input, result);
                    return result;
                }
                result = parseUSDate(input);
                if (result) {
                    parseCache.set(input, result);
                    return result;
                }
                const parsed = new Date(input);
                if (isNaN(parsed.getTime())) {
                    if (KairosCore.config.strict) {
                        throwError(`Invalid date string: ${input}`, 'INVALID_DATE');
                    }
                    parseCache.set(input, new Date(NaN));
                    return new Date(NaN);
                }
                parseCache.set(input, parsed);
                return parsed;
            }
            if (input && typeof input === 'object') {
                if (isKairosInstance(input)) {
                    return new Date(input._date.getTime());
                }
                if (hasToDateMethod(input)) {
                    return input.toDate();
                }
                if (isDateLike(input) &&
                    input.year !== undefined &&
                    input.month !== undefined &&
                    input.day !== undefined) {
                    const year = input.year;
                    const month = input.month - 1;
                    const day = input.day;
                    const hour = input.hour || 0;
                    const minute = input.minute || 0;
                    const second = input.second || 0;
                    const millisecond = input.millisecond || 0;
                    const date = new Date(year, month, day, hour, minute, second, millisecond);
                    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
                        return new Date(NaN);
                    }
                    return date;
                }
                if (isDateLike(input) && input.date && input.date instanceof Date) {
                    return new Date(input.date.getTime());
                }
            }
            return new Date(NaN);
        }
        valueOf() {
            return this._date.getTime();
        }
        toString() {
            return this._date.toString();
        }
        toISOString() {
            return this._date.toISOString();
        }
        offset() {
            if (this._isUTC) {
                return 0;
            }
            return -this._date.getTimezoneOffset();
        }
        toDate() {
            return new Date(this._date.getTime());
        }
        clone() {
            if (KairosCore._objectPoolEnabled) {
                const pooledDate = datePool.acquire();
                pooledDate.setTime(this._date.getTime());
                const instance = new KairosCore(pooledDate);
                if (typeof globalThis !== 'undefined' && 'FinalizationRegistry' in globalThis) {
                    const FinalizationRegistry = globalThis.FinalizationRegistry;
                    const registry = new FinalizationRegistry((date) => {
                        datePool.release(date);
                    });
                    registry.register(instance, pooledDate);
                }
                return instance;
            }
            return new KairosCore(this._date);
        }
        year(value) {
            if (value === undefined) {
                return this._date.getFullYear();
            }
            const clone = this.clone();
            clone._date.setFullYear(value);
            return clone;
        }
        month(value) {
            if (value === undefined) {
                return this._date.getMonth() + 1;
            }
            const clone = this.clone();
            clone._date.setMonth(value - 1);
            return clone;
        }
        date(value) {
            if (value === undefined) {
                return this._date.getDate();
            }
            const clone = this.clone();
            clone._date.setDate(value);
            return clone;
        }
        day() {
            return this._date.getDay();
        }
        hour(value) {
            if (value === undefined) {
                return this._date.getHours();
            }
            const clone = this.clone();
            clone._date.setHours(value);
            return clone;
        }
        minute(value) {
            if (value === undefined) {
                return this._date.getMinutes();
            }
            const clone = this.clone();
            clone._date.setMinutes(value);
            return clone;
        }
        second(value) {
            if (value === undefined) {
                return this._date.getSeconds();
            }
            const clone = this.clone();
            clone._date.setSeconds(value);
            return clone;
        }
        millisecond(value) {
            if (value === undefined) {
                return this._date.getMilliseconds();
            }
            const clone = this.clone();
            clone._date.setMilliseconds(value);
            return clone;
        }
        add(amount, unit) {
            if (!this.isValid()) {
                return this.clone();
            }
            const clone = this.clone();
            const normalizedUnit = this.normalizeUnit(unit);
            switch (normalizedUnit) {
                case 'year':
                    clone._date.setFullYear(clone._date.getFullYear() + amount);
                    break;
                case 'month': {
                    const currentDay = clone._date.getDate();
                    const currentMonth = clone._date.getMonth();
                    const currentYear = clone._date.getFullYear();
                    let targetMonth = currentMonth + amount;
                    let targetYear = currentYear;
                    while (targetMonth < 0) {
                        targetMonth += 12;
                        targetYear--;
                    }
                    while (targetMonth >= 12) {
                        targetMonth -= 12;
                        targetYear++;
                    }
                    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
                    clone._date.setDate(1);
                    clone._date.setFullYear(targetYear);
                    clone._date.setMonth(targetMonth);
                    clone._date.setDate(Math.min(currentDay, lastDayOfTargetMonth));
                    break;
                }
                case 'week':
                    clone._date.setDate(clone._date.getDate() + amount * 7);
                    break;
                case 'day':
                    if (amount % 1 !== 0) {
                        const wholeDays = Math.floor(amount);
                        const fractionalHours = (amount - wholeDays) * 24;
                        clone._date.setDate(clone._date.getDate() + wholeDays);
                        clone._date.setHours(clone._date.getHours() + fractionalHours);
                    }
                    else {
                        clone._date.setDate(clone._date.getDate() + amount);
                    }
                    break;
                case 'hour':
                    clone._date.setHours(clone._date.getHours() + amount);
                    break;
                case 'minute':
                    clone._date.setMinutes(clone._date.getMinutes() + amount);
                    break;
                case 'second':
                    clone._date.setSeconds(clone._date.getSeconds() + amount);
                    break;
                case 'millisecond':
                    clone._date.setMilliseconds(clone._date.getMilliseconds() + amount);
                    break;
                default:
                    throwError(`Unknown unit: ${unit}`, 'INVALID_UNIT');
            }
            return clone;
        }
        subtract(amount, unit) {
            return this.add(-amount, unit);
        }
        startOf(unit) {
            const clone = this.clone();
            const normalizedUnit = this.normalizeUnit(unit);
            switch (normalizedUnit) {
                case 'year':
                    clone._date.setMonth(0, 1);
                    clone._date.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    clone._date.setDate(1);
                    clone._date.setHours(0, 0, 0, 0);
                    break;
                case 'week': {
                    const day = clone._date.getDay();
                    clone._date.setDate(clone._date.getDate() - day);
                    clone._date.setHours(0, 0, 0, 0);
                    break;
                }
                case 'day':
                    clone._date.setHours(0, 0, 0, 0);
                    break;
                case 'hour':
                    clone._date.setMinutes(0, 0, 0);
                    break;
                case 'minute':
                    clone._date.setSeconds(0, 0);
                    break;
                case 'second':
                    clone._date.setMilliseconds(0);
                    break;
            }
            return clone;
        }
        endOf(unit) {
            const clone = this.clone();
            const normalizedUnit = this.normalizeUnit(unit);
            switch (normalizedUnit) {
                case 'year':
                    clone._date.setMonth(11, 31);
                    clone._date.setHours(23, 59, 59, 999);
                    break;
                case 'month':
                    clone._date.setMonth(clone._date.getMonth() + 1, 0);
                    clone._date.setHours(23, 59, 59, 999);
                    break;
                case 'week': {
                    const day = clone._date.getDay();
                    clone._date.setDate(clone._date.getDate() + (6 - day));
                    clone._date.setHours(23, 59, 59, 999);
                    break;
                }
                case 'day':
                    clone._date.setHours(23, 59, 59, 999);
                    break;
                case 'hour':
                    clone._date.setMinutes(59, 59, 999);
                    break;
                case 'minute':
                    clone._date.setSeconds(59, 999);
                    break;
                case 'second':
                    clone._date.setMilliseconds(999);
                    break;
            }
            return clone;
        }
        isValid() {
            return !isNaN(this._date.getTime());
        }
        isBefore(other) {
            return this.valueOf() < other.valueOf();
        }
        isAfter(other) {
            return this.valueOf() > other.valueOf();
        }
        isSame(other) {
            return this.valueOf() === other.valueOf();
        }
        format(template = 'YYYY-MM-DD') {
            if (!this.isValid()) {
                return 'Invalid Date';
            }
            const isUtc = this._isUTC;
            const year = isUtc ? this._date.getUTCFullYear() : this._date.getFullYear();
            const month = isUtc ? this._date.getUTCMonth() + 1 : this._date.getMonth() + 1;
            const date = isUtc ? this._date.getUTCDate() : this._date.getDate();
            const hours = isUtc ? this._date.getUTCHours() : this._date.getHours();
            const minutes = isUtc ? this._date.getUTCMinutes() : this._date.getMinutes();
            const seconds = isUtc ? this._date.getUTCSeconds() : this._date.getSeconds();
            if (isNaN(year) || isNaN(month) || isNaN(date)) {
                return 'Invalid Date';
            }
            return template
                .replace(/YYYY/g, year.toString())
                .replace(/MM/g, month.toString().padStart(2, '0'))
                .replace(/DD/g, date.toString().padStart(2, '0'))
                .replace(/HH/g, hours.toString().padStart(2, '0'))
                .replace(/mm/g, minutes.toString().padStart(2, '0'))
                .replace(/ss/g, seconds.toString().padStart(2, '0'));
        }
        normalizeUnit(unit) {
            const unitMap = {
                y: 'year',
                year: 'year',
                years: 'year',
                M: 'month',
                month: 'month',
                months: 'month',
                w: 'week',
                week: 'week',
                weeks: 'week',
                d: 'day',
                day: 'day',
                days: 'day',
                h: 'hour',
                hour: 'hour',
                hours: 'hour',
                m: 'minute',
                minute: 'minute',
                minutes: 'minute',
                s: 'second',
                second: 'second',
                seconds: 'second',
                ms: 'millisecond',
                millisecond: 'millisecond',
                milliseconds: 'millisecond',
            };
            return unitMap[unit] || unit;
        }
    }
    KairosCore.config = {
        locale: 'en',
        strict: false,
        suppressDeprecationWarnings: false,
    };
    KairosCore._memoryMonitorEnabled = false;
    KairosCore._objectPoolEnabled = true;
    class PluginSystem {
        static use(plugin) {
            const plugins = Array.isArray(plugin) ? plugin : [plugin];
            for (const p of plugins) {
                this.installPlugin(p);
            }
            return kairos;
        }
        static installPlugin(plugin) {
            if (this.installedPlugins.has(plugin.name)) {
                return;
            }
            if (plugin.dependencies) {
                for (const dep of plugin.dependencies) {
                    if (!this.installedPlugins.has(dep)) {
                        throwError(`Plugin ${plugin.name} depends on ${dep} which is not installed`, 'MISSING_DEPENDENCY');
                    }
                }
            }
            this.plugins.set(plugin.name, plugin);
            this.installedPlugins.add(plugin.name);
            const utils = {
                cache: globalCache,
                memoize,
                validateInput: (input, type) => {
                    switch (type) {
                        case 'date':
                            return input instanceof Date && !isNaN(input.getTime());
                        case 'number':
                            return typeof input === 'number' && !isNaN(input);
                        case 'string':
                            return typeof input === 'string';
                        default:
                            return false;
                    }
                },
                throwError,
            };
            plugin.install(kairos, utils);
        }
        static extend(methods) {
            Object.assign(this.extensionMethods, methods);
            for (const [name, method] of Object.entries(methods)) {
                KairosCore.prototype[name] = method;
            }
        }
        static addStatic(methods) {
            Object.assign(this.staticMethods, methods);
            for (const [name, method] of Object.entries(methods)) {
                kairos[name] = method;
            }
        }
        static getPlugin(name) {
            return this.plugins.get(name);
        }
        static isInstalled(name) {
            return this.installedPlugins.has(name);
        }
        static getInstalledPlugins() {
            return Array.from(this.installedPlugins);
        }
    }
    PluginSystem.plugins = new Map();
    PluginSystem.installedPlugins = new Set();
    PluginSystem.extensionMethods = {};
    PluginSystem.staticMethods = {};
    const NO_ARG = Symbol('NO_ARG');
    function kairos(input) {
        if (arguments.length === 0) {
            return new KairosCore(NO_ARG);
        }
        return new KairosCore(input);
    }
    kairos.use = PluginSystem.use.bind(PluginSystem);
    kairos.extend = PluginSystem.extend.bind(PluginSystem);
    kairos.addStatic = PluginSystem.addStatic.bind(PluginSystem);
    kairos.plugins = PluginSystem.plugins;
    kairos.utc = function (input) {
        if (arguments.length === 0) {
            const instance = new KairosCore(new Date());
            instance._isUTC = true;
            return instance;
        }
        let utcDate;
        if (typeof input === 'string' &&
            !input.endsWith('Z') &&
            !input.includes('+') &&
            !/[+-]\d{2}:?\d{2}$/.test(input)) {
            const dateTimePattern = /^(\d{4})-(\d{2})-(\d{2})(?:\s+|T)(\d{2}):(\d{2})(?::(\d{2}))?$/;
            const dateOnlyPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
            const match = input.match(dateTimePattern) || input.match(dateOnlyPattern);
            if (match) {
                const year = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const day = parseInt(match[3], 10);
                const hour = match[4] ? parseInt(match[4], 10) : 0;
                const minute = match[5] ? parseInt(match[5], 10) : 0;
                const second = match[6] ? parseInt(match[6], 10) : 0;
                utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
            }
            else {
                input = input.replace(' ', 'T') + 'Z';
                utcDate = new Date(input);
            }
        }
        else {
            utcDate = new Date(input);
        }
        const instance = new KairosCore(utcDate);
        instance._isUTC = true;
        return instance;
    };
    kairos.unix = (timestamp) => new KairosCore(new Date(timestamp * 1000));

    const createTimestamp = (value) => value;
    const createYear = (value) => value;
    const createMonth = (value) => value;
    const createDay = (value) => value;
    const createHour = (value) => value;
    const createMinute = (value) => value;
    const createSecond = (value) => value;
    const createMillisecond = (value) => value;
    const createDayOfWeek = (value) => value;
    const createDayOfYear = (value) => value;
    const createWeekOfYear = (value) => value;
    const createLocaleCode = (value) => value;
    const createTimeZone = (value) => value;
    const createFormatString = (value) => value;
    const createDateString = (value) => value;
    const createHolidayId = (value) => value;
    const createBusinessDayId = (value) => value;
    const isValidTimestamp = (value) => Number.isInteger(value) && value >= -8640000000000000 && value <= 8640000000000000;
    const isValidYear = (value) => Number.isInteger(value) && value >= 1 && value <= 9999;
    const isValidMonth = (value) => Number.isInteger(value) && value >= 1 && value <= 12;
    const isValidDay = (value) => Number.isInteger(value) && value >= 1 && value <= 31;
    const isValidHour = (value) => Number.isInteger(value) && value >= 0 && value <= 23;
    const isValidMinute = (value) => Number.isInteger(value) && value >= 0 && value <= 59;
    const isValidSecond = (value) => Number.isInteger(value) && value >= 0 && value <= 59;
    const isValidMillisecond = (value) => Number.isInteger(value) && value >= 0 && value <= 999;
    const isValidDayOfWeek = (value) => Number.isInteger(value) && value >= 0 && value <= 6;
    const isValidDayOfYear = (value) => Number.isInteger(value) && value >= 1 && value <= 366;
    const isValidWeekOfYear = (value) => Number.isInteger(value) && value >= 1 && value <= 53;
    const isValidLocaleCode = (value) => /^[a-z]{2}-[A-Z]{2}$/.test(value);
    const isValidFormatString = (value) => value.length > 0 && /^[A-Za-z0-9\-\s]+$/.test(value);
    const toTimestamp = (value) => isValidTimestamp(value) ? createTimestamp(value) : null;
    const toYear = (value) => isValidYear(value) ? createYear(value) : null;
    const toMonth = (value) => isValidMonth(value) ? createMonth(value) : null;
    const toDay = (value) => (isValidDay(value) ? createDay(value) : null);
    const toHour = (value) => isValidHour(value) ? createHour(value) : null;
    const toMinute = (value) => isValidMinute(value) ? createMinute(value) : null;
    const toSecond = (value) => isValidSecond(value) ? createSecond(value) : null;
    const toMillisecond = (value) => isValidMillisecond(value) ? createMillisecond(value) : null;
    const toDayOfWeek = (value) => isValidDayOfWeek(value) ? createDayOfWeek(value) : null;
    const toDayOfYear = (value) => isValidDayOfYear(value) ? createDayOfYear(value) : null;
    const toWeekOfYear = (value) => isValidWeekOfYear(value) ? createWeekOfYear(value) : null;
    const toLocaleCode = (value) => isValidLocaleCode(value) ? createLocaleCode(value) : null;
    const toFormatString = (value) => isValidFormatString(value) ? createFormatString(value) : null;
    const isTimestamp = (value) => typeof value === 'number' && isValidTimestamp(value);
    const isYear = (value) => typeof value === 'number' && isValidYear(value);
    const isMonth = (value) => typeof value === 'number' && isValidMonth(value);
    const isDay = (value) => typeof value === 'number' && isValidDay(value);
    const isHour = (value) => typeof value === 'number' && isValidHour(value);
    const isMinute = (value) => typeof value === 'number' && isValidMinute(value);
    const isSecond = (value) => typeof value === 'number' && isValidSecond(value);
    const isMillisecond = (value) => typeof value === 'number' && isValidMillisecond(value);
    const isDayOfWeek = (value) => typeof value === 'number' && isValidDayOfWeek(value);
    const isDayOfYear = (value) => typeof value === 'number' && isValidDayOfYear(value);
    const isWeekOfYear = (value) => typeof value === 'number' && isValidWeekOfYear(value);
    const isLocaleCode = (value) => typeof value === 'string' && isValidLocaleCode(value);
    const isFormatString = (value) => typeof value === 'string' && isValidFormatString(value);

    const FORMAT_TOKENS = {
        YYYY: {
            token: 'YYYY',
            category: 'year',
            length: 4,
            description: '4-digit year',
            example: '2024',
        },
        YY: { token: 'YY', category: 'year', length: 2, description: '2-digit year', example: '24' },
        Y: { token: 'Y', category: 'year', length: 1, description: 'Year (flexible)', example: '2024' },
        MMMM: {
            token: 'MMMM',
            category: 'month',
            length: 4,
            description: 'Full month name',
            example: 'January',
        },
        MMM: {
            token: 'MMM',
            category: 'month',
            length: 3,
            description: 'Short month name',
            example: 'Jan',
        },
        MM: {
            token: 'MM',
            category: 'month',
            length: 2,
            description: 'Zero-padded month',
            example: '01',
        },
        M: { token: 'M', category: 'month', length: 1, description: 'Month', example: '1' },
        DDDD: { token: 'DDDD', category: 'day', length: 4, description: 'Day of year', example: '001' },
        DD: { token: 'DD', category: 'day', length: 2, description: 'Zero-padded day', example: '01' },
        D: { token: 'D', category: 'day', length: 1, description: 'Day', example: '1' },
        dddd: {
            token: 'dddd',
            category: 'weekday',
            length: 4,
            description: 'Full weekday name',
            example: 'Monday',
        },
        ddd: {
            token: 'ddd',
            category: 'weekday',
            length: 3,
            description: 'Short weekday name',
            example: 'Mon',
        },
        dd: {
            token: 'dd',
            category: 'weekday',
            length: 2,
            description: 'Min weekday name',
            example: 'Mo',
        },
        d: { token: 'd', category: 'weekday', length: 1, description: 'Weekday', example: '1' },
        HH: {
            token: 'HH',
            category: 'hour',
            length: 2,
            description: '24-hour, zero-padded',
            example: '14',
        },
        H: { token: 'H', category: 'hour', length: 1, description: '24-hour', example: '14' },
        hh: {
            token: 'hh',
            category: 'hour',
            length: 2,
            description: '12-hour, zero-padded',
            example: '02',
        },
        h: { token: 'h', category: 'hour', length: 1, description: '12-hour', example: '2' },
        mm: {
            token: 'mm',
            category: 'minute',
            length: 2,
            description: 'Zero-padded minutes',
            example: '05',
        },
        m: { token: 'm', category: 'minute', length: 1, description: 'Minutes', example: '5' },
        ss: {
            token: 'ss',
            category: 'second',
            length: 2,
            description: 'Zero-padded seconds',
            example: '09',
        },
        s: { token: 's', category: 'second', length: 1, description: 'Seconds', example: '9' },
        SSS: {
            token: 'SSS',
            category: 'millisecond',
            length: 3,
            description: 'Zero-padded milliseconds',
            example: '123',
        },
        SS: {
            token: 'SS',
            category: 'millisecond',
            length: 2,
            description: '2-digit milliseconds',
            example: '12',
        },
        S: { token: 'S', category: 'millisecond', length: 1, description: 'Milliseconds', example: '1' },
        A: { token: 'A', category: 'meridiem', length: 1, description: 'AM/PM uppercase', example: 'PM' },
        a: { token: 'a', category: 'meridiem', length: 1, description: 'am/pm lowercase', example: 'pm' },
        Z: {
            token: 'Z',
            category: 'timezone',
            length: 1,
            description: 'Timezone offset',
            example: '+00:00',
        },
        ZZ: {
            token: 'ZZ',
            category: 'timezone',
            length: 2,
            description: 'Timezone offset',
            example: '+0000',
        },
        ZZZ: {
            token: 'ZZZ',
            category: 'timezone',
            length: 3,
            description: 'Timezone name',
            example: 'UTC',
        },
        X: {
            token: 'X',
            category: 'timestamp',
            length: 1,
            description: 'Unix timestamp (seconds)',
            example: '1640995200',
        },
        x: {
            token: 'x',
            category: 'timestamp',
            length: 1,
            description: 'Unix timestamp (milliseconds)',
            example: '1640995200000',
        },
        Q: { token: 'Q', category: 'quarter', length: 1, description: 'Quarter', example: '1' },
        QQ: {
            token: 'QQ',
            category: 'quarter',
            length: 2,
            description: 'Zero-padded quarter',
            example: '01',
        },
        wo: {
            token: 'wo',
            category: 'week',
            length: 2,
            description: 'Week of year ordinal',
            example: '1st',
        },
        ww: { token: 'ww', category: 'week', length: 2, description: 'Week of year', example: '01' },
        w: { token: 'w', category: 'week', length: 1, description: 'Week of year', example: '1' },
        gg: {
            token: 'gg',
            category: 'weekYear',
            length: 2,
            description: '2-digit week year',
            example: '24',
        },
        gggg: {
            token: 'gggg',
            category: 'weekYear',
            length: 4,
            description: '4-digit week year',
            example: '2024',
        },
        k: { token: 'k', category: 'weekYear', length: 1, description: 'ISO week year', example: '2024' },
        kk: {
            token: 'kk',
            category: 'weekYear',
            length: 2,
            description: '2-digit ISO week year',
            example: '24',
        },
        E: { token: 'E', category: 'isoDay', length: 1, description: 'ISO day of week', example: '1' },
        EE: { token: 'EE', category: 'isoDay', length: 2, description: '2-digit ISO day', example: '01' },
        EEE: { token: 'EEE', category: 'isoDay', length: 3, description: 'ISO day name', example: 'Mon' },
        L: { token: 'L', category: 'isoWeek', length: 1, description: 'ISO week of year', example: '1' },
        LL: {
            token: 'LL',
            category: 'isoWeek',
            length: 2,
            description: '2-digit ISO week',
            example: '01',
        },
        LLL: {
            token: 'LLL',
            category: 'isoWeek',
            length: 3,
            description: '3-digit ISO week',
            example: '001',
        },
    };

    class KairosBaseError extends Error {
        constructor(type, message, code, input, context, locale = 'en-US') {
            super(message);
            this.name = this.constructor.name;
            this.type = type;
            this.code = code || type;
            this.input = input;
            this.timestamp = new Date();
            if (context !== undefined) {
                this.context = context;
            }
            this.locale = locale;
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, this.constructor);
            }
        }
        getLocalizedMessage(locale) {
            const targetLocale = locale || this.locale;
            return this.translateMessage(targetLocale);
        }
        toJSON() {
            return {
                name: this.name,
                type: this.type,
                code: this.code,
                message: this.message,
                localizedMessage: this.getLocalizedMessage(),
                input: this.input,
                context: this.context,
                timestamp: this.timestamp.toISOString(),
                locale: this.locale,
                stack: this.stack,
            };
        }
        isType(type) {
            return this.type === type;
        }
        hasCode(code) {
            return this.code === code;
        }
        getDescription() {
            return `${this.code}: ${this.getLocalizedMessage()}`;
        }
    }
    class InvalidDateError extends KairosBaseError {
        constructor(message, input, context, locale = 'en-US') {
            super('INVALID_DATE', message, 'INVALID_DATE', input, context, locale);
        }
        translateMessage(locale) {
            const messages = {
                'en-US': 'Invalid date provided',
                'es-ES': 'Fecha inválida proporcionada',
                'fr-FR': 'Date invalide fournie',
                'de-DE': 'Ungültiges Datum angegeben',
                'it-IT': 'Data non valida fornita',
                'pt-BR': 'Data inválida fornecida',
                'ru-RU': 'Предоставлена недействительная дата',
                'zh-CN': '提供的日期无效',
                'ja-JP': '無効な日付が提供されました',
                'tr-TR': 'Geçersiz tarih sağlandı',
            };
            return messages[locale] || messages['en-US'];
        }
    }
    class InvalidFormatError extends KairosBaseError {
        constructor(message, input, context, locale = 'en-US') {
            super('INVALID_FORMAT', message, 'INVALID_FORMAT', input, context, locale);
        }
        translateMessage(locale) {
            const messages = {
                'en-US': 'Invalid format string',
                'es-ES': 'Cadena de formato inválida',
                'fr-FR': 'Chaîne de format invalide',
                'de-DE': 'Ungültige Formatzeichenfolge',
                'it-IT': 'Stringa di formato non valida',
                'pt-BR': 'String de formato inválido',
                'ru-RU': 'Недопустимая строка формата',
                'zh-CN': '无效的格式字符串',
                'ja-JP': '無効なフォーマット文字列',
                'tr-TR': 'Geçersiz format dizesi',
            };
            return messages[locale] || messages['en-US'];
        }
    }
    class InvalidLocaleError extends KairosBaseError {
        constructor(message, input, context, locale = 'en-US') {
            super('INVALID_LOCALE', message, 'INVALID_LOCALE', input, context, locale);
        }
        translateMessage(locale) {
            const messages = {
                'en-US': 'Invalid locale specified',
                'es-ES': 'Configuración regional inválida especificada',
                'fr-FR': 'Locale invalide spécifiée',
                'de-DE': 'Ungültiges Gebietsschema angegeben',
                'it-IT': 'Locale non valido specificato',
                'pt-BR': 'Localidade inválida especificada',
                'ru-RU': 'Указан недопустимый язык',
                'zh-CN': '指定的区域设置无效',
                'ja-JP': '無効なロケールが指定されました',
                'tr-TR': 'Geçersiz yerel ayarı belirtildi',
            };
            return messages[locale] || messages['en-US'];
        }
    }
    class InvalidTimezoneError extends KairosBaseError {
        constructor(message, input, context, locale = 'en-US') {
            super('INVALID_TIMEZONE', message, 'INVALID_TIMEZONE', input, context, locale);
        }
        translateMessage(locale) {
            const messages = {
                'en-US': 'Invalid timezone specified',
                'es-ES': 'Zona horaria inválida especificada',
                'fr-FR': 'Fuseau horaire invalide spécifié',
                'de-DE': 'Ungültige Zeitzone angegeben',
                'it-IT': 'Fuso orario non valido specificato',
                'pt-BR': 'Fuso horário inválido especificado',
                'ru-RU': 'Указан недопустимый часовой пояс',
                'zh-CN': '指定的时区无效',
                'ja-JP': '無効なタイムゾーンが指定されました',
                'tr-TR': 'Geçersiz saat dilimi belirtildi',
            };
            return messages[locale] || messages['en-US'];
        }
    }
    class ParsingError extends KairosBaseError {
        constructor(message, input, context, locale = 'en-US') {
            super('PARSING_ERROR', message, 'PARSING_ERROR', input, context, locale);
        }
        translateMessage(locale) {
            const messages = {
                'en-US': 'Failed to parse date/time',
                'es-ES': 'Error al analizar fecha/hora',
                'fr-FR': "Échec de l'analyse de la date/heure",
                'de-DE': 'Fehler beim Parsen von Datum/Uhrzeit',
                'it-IT': "Errore nell'analisi di data/ora",
                'pt-BR': 'Falha ao analisar data/hora',
                'ru-RU': 'Ошибка анализа даты/времени',
                'zh-CN': '解析日期/时间失败',
                'ja-JP': '日付/時刻の解析に失敗しました',
                'tr-TR': 'Tarih/saat ayrıştırma başarısız',
            };
            return messages[locale] || messages['en-US'];
        }
    }
    class ValidationError extends KairosBaseError {
        constructor(field, message, value, constraint, context, locale = 'en-US') {
            super('VALIDATION_ERROR', message, 'VALIDATION_ERROR', value, context, locale);
            this.field = field;
            this.value = value;
            this.constraint = constraint;
        }
        translateMessage(locale) {
            const messages = {
                'en-US': `Validation failed for field '${this.field}'`,
                'es-ES': `Validación fallida para el campo '${this.field}'`,
                'fr-FR': `Échec de la validation pour le champ '${this.field}'`,
                'de-DE': `Validierung fehlgeschlagen für Feld '${this.field}'`,
                'it-IT': `Validazione fallita per il campo '${this.field}'`,
                'pt-BR': `Validação falhou para o campo '${this.field}'`,
                'ru-RU': `Ошибка валидации для поля '${this.field}'`,
                'zh-CN': `字段'${this.field}'验证失败`,
                'ja-JP': `フィールド'${this.field}'の検証に失敗しました`,
                'tr-TR': `'${this.field}' alanı için doğrulama başarısız`,
            };
            return messages[locale] || messages['en-US'];
        }
        toJSON() {
            return {
                ...super.toJSON(),
                field: this.field,
                value: this.value,
                constraint: this.constraint,
            };
        }
    }
    class PluginError extends KairosBaseError {
        constructor(pluginName, pluginType, message, context, locale = 'en-US') {
            super('PLUGIN_ERROR', message, 'PLUGIN_ERROR', pluginName, context, locale);
            this.pluginName = pluginName;
            this.pluginType = pluginType;
        }
        translateMessage(locale) {
            const messages = {
                'en-US': `Plugin '${this.pluginName}' error`,
                'es-ES': `Error del plugin '${this.pluginName}'`,
                'fr-FR': `Erreur du plugin '${this.pluginName}'`,
                'de-DE': `Plugin '${this.pluginName}' Fehler`,
                'it-IT': `Errore del plugin '${this.pluginName}'`,
                'pt-BR': `Erro do plugin '${this.pluginName}'`,
                'ru-RU': `Ошибка плагина '${this.pluginName}'`,
                'zh-CN': `插件'${this.pluginName}'错误`,
                'ja-JP': `プラグイン'${this.pluginName}'エラー`,
                'tr-TR': `'${this.pluginName}' eklenti hatası`,
            };
            return messages[locale] || messages['en-US'];
        }
        toJSON() {
            return {
                ...super.toJSON(),
                pluginName: this.pluginName,
                pluginType: this.pluginType,
            };
        }
    }
    class ConfigurationError extends KairosBaseError {
        constructor(configKey, message, configValue, context, locale = 'en-US') {
            super('CONFIGURATION_ERROR', message, 'CONFIGURATION_ERROR', configKey, context, locale);
            this.configKey = configKey;
            this.configValue = configValue;
        }
        translateMessage(locale) {
            const messages = {
                'en-US': `Configuration error for '${this.configKey}'`,
                'es-ES': `Error de configuración para '${this.configKey}'`,
                'fr-FR': `Erreur de configuration pour '${this.configKey}'`,
                'de-DE': `Konfigurationsfehler für '${this.configKey}'`,
                'it-IT': `Errore di configurazione per '${this.configKey}'`,
                'pt-BR': `Erro de configuração para '${this.configKey}'`,
                'ru-RU': `Ошибка конфигурации для '${this.configKey}'`,
                'zh-CN': `'${this.configKey}'配置错误`,
                'ja-JP': `'${this.configKey}'設定エラー`,
                'tr-TR': `'${this.configKey}' yapılandırma hatası`,
            };
            return messages[locale] || messages['en-US'];
        }
        toJSON() {
            return {
                ...super.toJSON(),
                configKey: this.configKey,
                configValue: this.configValue,
            };
        }
    }
    class ErrorFactory {
        static setDefaultLocale(locale) {
            this.defaultLocale = locale;
        }
        static createInvalidDate(input, context) {
            return new InvalidDateError('Invalid date provided', input, context, this.defaultLocale);
        }
        static createInvalidFormat(format, context) {
            return new InvalidFormatError(`Invalid format string: ${format}`, format, context, this.defaultLocale);
        }
        static createInvalidLocale(locale, context) {
            return new InvalidLocaleError(`Invalid locale: ${locale}`, locale, context, this.defaultLocale);
        }
        static createInvalidTimezone(timezone, context) {
            return new InvalidTimezoneError(`Invalid timezone: ${timezone}`, timezone, context, this.defaultLocale);
        }
        static createParsingError(input, originalError, context) {
            const message = originalError
                ? `Failed to parse: ${originalError.message}`
                : `Failed to parse input: ${JSON.stringify(input)}`;
            return new ParsingError(message, input, { ...context, originalError: originalError?.message }, this.defaultLocale);
        }
        static createValidationError(field, value, constraint, context) {
            return new ValidationError(field, `Validation failed: ${constraint}`, value, constraint, context, this.defaultLocale);
        }
        static createPluginError(pluginName, pluginType, error, context) {
            const message = typeof error === 'string' ? error : error.message;
            return new PluginError(pluginName, pluginType, message, { ...context, originalError: typeof error === 'string' ? undefined : error.message }, this.defaultLocale);
        }
        static createConfigurationError(configKey, message, configValue, context) {
            return new ConfigurationError(configKey, message, configValue, context, this.defaultLocale);
        }
    }
    ErrorFactory.defaultLocale = 'en-US';
    class ErrorHandler {
        static isKairosError(error) {
            return error instanceof KairosBaseError;
        }
        static wrapError(error, fallbackMessage = 'Unknown error occurred') {
            if (error instanceof KairosBaseError) {
                return error;
            }
            if (error instanceof Error) {
                return new ParsingError(fallbackMessage, error.message, {
                    originalError: error.message,
                    stack: error.stack,
                });
            }
            return new ParsingError(fallbackMessage, error);
        }
        static getErrorDetails(error) {
            if (error instanceof KairosBaseError) {
                const result = {
                    type: error.type,
                    message: error.getLocalizedMessage(),
                    code: error.code,
                };
                if (error.input !== undefined) {
                    result.input = error.input;
                }
                if (error.context !== undefined) {
                    result.context = error.context;
                }
                if (error.stack !== undefined) {
                    result.stack = error.stack;
                }
                return result;
            }
            if (error instanceof Error) {
                const result = {
                    type: 'GENERIC_ERROR',
                    message: error.message,
                    code: 'GENERIC',
                };
                if (error.stack !== undefined) {
                    result.stack = error.stack;
                }
                return result;
            }
            return {
                type: 'UNKNOWN_ERROR',
                message: String(error),
                code: 'UNKNOWN',
                input: error,
            };
        }
        static formatErrorForUser(error, locale) {
            const details = this.getErrorDetails(error);
            const targetLocale = locale || 'en-US';
            if (error instanceof KairosBaseError) {
                return error.getLocalizedMessage(targetLocale);
            }
            return details.message;
        }
        static formatErrorForLogging(error) {
            const details = this.getErrorDetails(error);
            return `[${details.type}] ${details.message} (${details.code})`;
        }
    }

    class LocaleManager {
        constructor() {
            this.locales = new Map();
            this.currentLocale = 'en-US';
            this.defaultLocale = 'en-US';
        }
        static getInstance() {
            if (!LocaleManager.instance) {
                LocaleManager.instance = new LocaleManager();
            }
            return LocaleManager.instance;
        }
        register(code, locale) {
            this.locales.set(code, locale);
            if (this.locales.size === 1) {
                this.defaultLocale = code;
                this.currentLocale = code;
            }
        }
        setLocale(code) {
            if (this.locales.has(code)) {
                this.currentLocale = code;
                return true;
            }
            return false;
        }
        getLocale(code) {
            const targetCode = code || this.currentLocale;
            return this.locales.get(targetCode);
        }
        getCurrentLocale() {
            return this.currentLocale;
        }
        getDefaultLocale() {
            return this.defaultLocale;
        }
        setDefaultLocale(code) {
            if (this.locales.has(code)) {
                this.defaultLocale = code;
                return true;
            }
            return false;
        }
        getHolidays(localeCode, type) {
            const locale = this.getLocale(localeCode);
            if (!locale) {
                return [];
            }
            if (type) {
                switch (type) {
                    case 'federal':
                        return locale.federalHolidays || [];
                    case 'state':
                        return locale.stateHolidays ? Object.values(locale.stateHolidays).flat() : [];
                    case 'public':
                        return locale.publicHolidays || [];
                    case 'observances':
                        return locale.observances || [];
                    default:
                        if (locale[type] && Array.isArray(locale[type])) {
                            return locale[type];
                        }
                }
            }
            return locale.holidays || [];
        }
        getStateHolidays(state, localeCode) {
            const locale = this.getLocale(localeCode);
            if (!locale || !locale.stateHolidays) {
                return [];
            }
            if (!state || typeof state !== 'string') {
                return [];
            }
            const stateLower = state.toLowerCase();
            return locale.stateHolidays[stateLower] || [];
        }
        getAllHolidays(localeCode) {
            const locale = this.getLocale(localeCode);
            if (!locale) {
                return [];
            }
            const allHolidays = [];
            if (locale.holidays) {
                allHolidays.push(...locale.holidays);
            }
            if (locale.federalHolidays) {
                allHolidays.push(...locale.federalHolidays);
            }
            if (locale.stateHolidays) {
                for (const stateHols of Object.values(locale.stateHolidays)) {
                    allHolidays.push(...stateHols);
                }
            }
            if (locale.publicHolidays) {
                allHolidays.push(...locale.publicHolidays);
            }
            if (locale.observances) {
                allHolidays.push(...locale.observances);
            }
            const uniqueHolidays = new Map();
            for (const holiday of allHolidays) {
                if (!uniqueHolidays.has(holiday.name)) {
                    uniqueHolidays.set(holiday.name, holiday);
                }
            }
            return Array.from(uniqueHolidays.values());
        }
        getAvailableLocales() {
            return Array.from(this.locales.keys());
        }
        hasLocale(code) {
            return this.locales.has(code);
        }
        clear() {
            this.locales.clear();
            this.currentLocale = 'en-US';
            this.defaultLocale = 'en-US';
        }
    }
    const localeManager = LocaleManager.getInstance();

    class HolidayEngine {
        constructor() {
            this.calculators = new Map();
            this.cache = createHolidayCache();
            this.ruleCache = new Map();
            this.registerCalculators();
        }
        registerCalculators() {
        }
        generateRuleCacheKey(rule) {
            return `${rule.type}_${JSON.stringify(rule.rule)}`;
        }
        registerCalculator(type, calculator) {
            this.calculators.set(type, calculator);
        }
        calculate(rule, year) {
            const errors = validateHolidayRule$1(rule);
            if (errors.length > 0) {
                throw new Error(`Invalid holiday rule: ${errors.join(', ')}`);
            }
            const cacheKey = rule.name || this.generateRuleCacheKey(rule);
            if (!this.ruleCache.has(cacheKey)) {
                this.ruleCache.set(cacheKey, new Map());
            }
            const yearCache = this.ruleCache.get(cacheKey);
            if (yearCache.has(year)) {
                return yearCache.get(year);
            }
            const calculator = this.calculators.get(rule.type);
            if (!calculator) {
                throw new Error(`Unknown holiday type: ${rule.type}`);
            }
            let dates = calculator.calculate(rule, year);
            if (rule.observedRule) {
                dates = this.applyObservedRules(dates, rule.observedRule);
            }
            if (rule.duration && rule.duration > 1) {
                dates = this.expandDuration(dates, rule.duration);
            }
            yearCache.set(year, dates);
            return dates;
        }
        applyObservedRules(dates, observedRule) {
            const result = [];
            for (const date of dates) {
                const weekday = date.getDay();
                const isWeekend = observedRule.weekends
                    ? observedRule.weekends.includes(weekday)
                    : weekday === 0 || weekday === 6;
                if (!isWeekend) {
                    result.push(date);
                    continue;
                }
                switch (observedRule.type) {
                    case 'substitute':
                        result.push(this.findSubstituteDate(date, observedRule));
                        break;
                    case 'nearest-weekday':
                        result.push(this.findNearestWeekday(date));
                        break;
                    case 'bridge':
                        result.push(date);
                        result.push(this.findBridgeDate(date));
                        break;
                    default:
                        result.push(date);
                }
            }
            return result;
        }
        findSubstituteDate(date, observedRule) {
            const direction = observedRule.direction || 'forward';
            const weekends = observedRule.weekends || [0, 6];
            const current = new Date(date);
            const increment = direction === 'forward' ? 1 : -1;
            while (weekends.includes(current.getDay())) {
                current.setDate(current.getDate() + increment);
            }
            return current;
        }
        findNearestWeekday(date) {
            const weekday = date.getDay();
            if (weekday === 0) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            }
            else if (weekday === 6) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            }
            return date;
        }
        findBridgeDate(date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        }
        expandDuration(dates, duration) {
            const result = [];
            for (const date of dates) {
                for (let i = 0; i < duration; i++) {
                    const expandedDate = new Date(date);
                    expandedDate.setDate(expandedDate.getDate() + i);
                    result.push(expandedDate);
                }
            }
            return result;
        }
        isHoliday(date, holidays) {
            const year = date.getFullYear();
            for (const holiday of holidays) {
                if (!holiday.active && holiday.active !== undefined) {
                    continue;
                }
                const holidayDates = this.calculateWithContext(holiday, year, holidays);
                for (const holidayDate of holidayDates) {
                    if (this.isSameDay(date, holidayDate)) {
                        return {
                            id: holiday.id || holiday.name,
                            name: holiday.name,
                            type: holiday.type,
                            date: holidayDate,
                            regions: holiday.regions || [],
                        };
                    }
                }
            }
            return null;
        }
        getHolidaysForYear(year, holidays) {
            const result = [];
            for (const holiday of holidays) {
                if (!holiday.active && holiday.active !== undefined) {
                    continue;
                }
                const dates = this.calculateWithContext(holiday, year, holidays);
                for (const date of dates) {
                    result.push({
                        id: holiday.id || holiday.name,
                        name: holiday.name,
                        type: holiday.type,
                        date,
                        regions: holiday.regions || [],
                    });
                }
            }
            return result.sort((a, b) => a.date.getTime() - b.date.getTime());
        }
        calculateWithContext(rule, year, allHolidays) {
            const errors = validateHolidayRule$1(rule);
            if (errors.length > 0) {
                throw new Error(`Invalid holiday rule: ${errors.join(', ')}`);
            }
            const cacheKey = rule.name || this.generateRuleCacheKey(rule);
            if (!this.ruleCache.has(cacheKey)) {
                this.ruleCache.set(cacheKey, new Map());
            }
            const yearCache = this.ruleCache.get(cacheKey);
            if (yearCache.has(year)) {
                return yearCache.get(year);
            }
            const calculator = this.calculators.get(rule.type);
            if (!calculator) {
                throw new Error(`Unknown holiday type: ${rule.type}`);
            }
            let dates;
            if (rule.type === 'relative') {
                dates = calculator.calculate(rule, year, { holidays: allHolidays });
            }
            else {
                dates = calculator.calculate(rule, year);
            }
            if (rule.observedRule) {
                dates = this.applyObservedRules(dates, rule.observedRule);
            }
            if (rule.duration && rule.duration > 1) {
                dates = this.expandDuration(dates, rule.duration);
            }
            yearCache.set(year, dates);
            return dates;
        }
        getHolidaysInRange(start, end, holidays) {
            const result = [];
            const startYear = start.getFullYear();
            const endYear = end.getFullYear();
            for (let year = startYear; year <= endYear; year++) {
                const yearHolidays = this.getHolidaysForYear(year, holidays);
                for (const holiday of yearHolidays) {
                    if (holiday.date >= start && holiday.date <= end) {
                        result.push(holiday);
                    }
                }
            }
            return result;
        }
        getNextHoliday(after, holidays) {
            const year = after.getFullYear();
            const currentYearHolidays = this.getHolidaysForYear(year, holidays);
            for (const holiday of currentYearHolidays) {
                if (holiday.date > after) {
                    return holiday;
                }
            }
            const nextYearHolidays = this.getHolidaysForYear(year + 1, holidays);
            return nextYearHolidays[0] || null;
        }
        getPreviousHoliday(before, holidays) {
            const year = before.getFullYear();
            const currentYearHolidays = this.getHolidaysForYear(year, holidays);
            for (let i = currentYearHolidays.length - 1; i >= 0; i--) {
                const holiday = currentYearHolidays[i];
                if (holiday.date < before) {
                    return holiday;
                }
            }
            const prevYearHolidays = this.getHolidaysForYear(year - 1, holidays);
            return prevYearHolidays[prevYearHolidays.length - 1] || null;
        }
        isSameDay(date1, date2) {
            return (date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate());
        }
        clearCache() {
            this.cache.clear();
            this.ruleCache.clear();
        }
    }
    const engine = new HolidayEngine();
    var engine$1 = {
        name: 'holiday-engine',
        version: '1.0.0',
        size: 2048,
        install(kairos, _utils) {
            kairos.extend({
                isHoliday(holidays) {
                    const rules = holidays || localeManager.getHolidays();
                    return engine.isHoliday(this.toDate(), rules) !== null;
                },
                getHolidayInfo(holidays) {
                    const rules = holidays || localeManager.getHolidays();
                    return engine.isHoliday(this.toDate(), rules);
                },
                nextHoliday(holidays) {
                    const rules = holidays || localeManager.getHolidays();
                    const next = engine.getNextHoliday(this.toDate(), rules);
                    return next ? kairos(next.date) : null;
                },
                previousHoliday(holidays) {
                    const rules = holidays || localeManager.getHolidays();
                    const prev = engine.getPreviousHoliday(this.toDate(), rules);
                    return prev ? kairos(prev.date) : null;
                },
                getHolidays(type) {
                    return localeManager.getHolidays(undefined, type);
                },
            });
            kairos.addStatic?.({
                getYearHolidays(year, holidays) {
                    return engine.getHolidaysForYear(year, holidays);
                },
                getHolidaysInRange(start, end, holidays) {
                    const startDate = kairos(start).toDate();
                    const endDate = kairos(end).toDate();
                    return engine.getHolidaysInRange(startDate, endDate, holidays);
                },
                holidayEngine: engine,
            });
        },
    };

    class FixedCalculator {
        calculate(rule, year) {
            const { month, day } = rule.rule;
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                return [];
            }
            return [date];
        }
    }
    var fixed = {
        name: 'holiday-fixed-calculator',
        version: '1.0.0',
        size: 256,
        dependencies: ['holiday-engine'],
        install(kairos, _utils) {
            const engine = kairos.holidayEngine;
            if (engine) {
                engine.registerCalculator('fixed', new FixedCalculator());
            }
        },
    };

    class NthWeekdayCalculator {
        calculate(rule, year) {
            const { month, weekday, nth } = rule.rule;
            if (nth > 0) {
                return [this.getNthWeekdayOfMonth(year, month - 1, weekday, nth)];
            }
            else {
                return [this.getLastNthWeekdayOfMonth(year, month - 1, weekday, Math.abs(nth))];
            }
        }
        getNthWeekdayOfMonth(year, month, weekday, nth) {
            const firstDay = new Date(year, month, 1);
            const firstDayWeekday = firstDay.getDay();
            let daysUntilWeekday = weekday - firstDayWeekday;
            if (daysUntilWeekday < 0) {
                daysUntilWeekday += 7;
            }
            const date = 1 + daysUntilWeekday + (nth - 1) * 7;
            const result = new Date(year, month, date);
            if (result.getMonth() !== month) {
                throw new Error(`${nth}${this.getOrdinalSuffix(nth)} ${this.getWeekdayName(weekday)} of ${this.getMonthName(month)} ${year} does not exist`);
            }
            return result;
        }
        getLastNthWeekdayOfMonth(year, month, weekday, nth) {
            const lastDay = new Date(year, month + 1, 0);
            const lastDayWeekday = lastDay.getDay();
            let daysBack = lastDayWeekday - weekday;
            if (daysBack < 0) {
                daysBack += 7;
            }
            const date = lastDay.getDate() - daysBack - (nth - 1) * 7;
            if (date < 1) {
                throw new Error(`${nth}${this.getOrdinalSuffix(nth)} to last ${this.getWeekdayName(weekday)} of ${this.getMonthName(month)} ${year} does not exist`);
            }
            return new Date(year, month, date);
        }
        getOrdinalSuffix(n) {
            if (n >= 11 && n <= 13)
                return 'th';
            switch (n % 10) {
                case 1:
                    return 'st';
                case 2:
                    return 'nd';
                case 3:
                    return 'rd';
                default:
                    return 'th';
            }
        }
        getWeekdayName(weekday) {
            const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return names[weekday] || 'Unknown';
        }
        getMonthName(month) {
            const names = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];
            return names[month] || 'Unknown';
        }
    }
    var nthWeekday = {
        name: 'holiday-nth-weekday-calculator',
        version: '1.0.0',
        size: 512,
        dependencies: ['holiday-engine'],
        install(kairos, _utils) {
            const engine = kairos.holidayEngine;
            if (engine) {
                engine.registerCalculator('nth-weekday', new NthWeekdayCalculator());
            }
        },
    };

    class EasterCalculator {
        calculate(rule, year) {
            const { offset } = rule.rule;
            const easterDate = this.calculateEaster(year);
            const resultDate = new Date(easterDate);
            resultDate.setDate(resultDate.getDate() + offset);
            return [resultDate];
        }
        calculateEaster(year) {
            if (year < 1583) {
                return this.calculateJulianEaster(year);
            }
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
            const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(year, month, day);
        }
        calculateJulianEaster(year) {
            const a = year % 4;
            const b = year % 7;
            const c = year % 19;
            const d = (19 * c + 15) % 30;
            const e = (2 * a + 4 * b - d + 34) % 7;
            const month = Math.floor((d + e + 114) / 31) - 1;
            const day = ((d + e + 114) % 31) + 1;
            const julianDate = new Date(year, month, day);
            const julianDayNumber = this.dateToJulianDay(julianDate);
            const gregorianDate = this.julianDayToDate(julianDayNumber);
            return gregorianDate;
        }
        dateToJulianDay(date) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const a = Math.floor((14 - month) / 12);
            const y = year + 4800 - a;
            const m = month + 12 * a - 3;
            return (day +
                Math.floor((153 * m + 2) / 5) +
                365 * y +
                Math.floor(y / 4) -
                Math.floor(y / 100) +
                Math.floor(y / 400) -
                32045);
        }
        julianDayToDate(jdn) {
            const a = jdn + 32044;
            const b = Math.floor((4 * a + 3) / 146097);
            const c = a - Math.floor((146097 * b) / 4);
            const d = Math.floor((4 * c + 3) / 1461);
            const e = c - Math.floor((1461 * d) / 4);
            const m = Math.floor((5 * e + 2) / 153);
            const day = e - Math.floor((153 * m + 2) / 5) + 1;
            const month = m + 3 - 12 * Math.floor(m / 10);
            const year = 100 * b + d - 4800 + Math.floor(m / 10);
            return new Date(year, month - 1, day);
        }
        calculateOrthodoxEaster(year) {
            const a = year % 4;
            const b = year % 7;
            const c = year % 19;
            const d = (19 * c + 15) % 30;
            const e = (2 * a + 4 * b - d + 34) % 7;
            const month = Math.floor((d + e + 114) / 31);
            const day = ((d + e + 114) % 31) + 1;
            const julianDate = new Date(year, month - 1, day);
            const diff = this.getJulianGregorianDifference(year);
            const orthodoxEaster = new Date(julianDate);
            orthodoxEaster.setDate(orthodoxEaster.getDate() + diff);
            return orthodoxEaster;
        }
        getJulianGregorianDifference(year) {
            if (year < 1583)
                return 0;
            const centuries = Math.floor(year / 100);
            const leapCenturies = Math.floor(centuries / 4);
            return centuries - leapCenturies - 2;
        }
    }
    var easter = {
        name: 'holiday-easter-calculator',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        install(kairos, _utils) {
            const engine = kairos.holidayEngine;
            if (engine) {
                engine.registerCalculator('easter-based', new EasterCalculator());
            }
            kairos.addStatic?.({
                getEaster(year) {
                    const calculator = new EasterCalculator();
                    const easterDate = calculator.calculateEaster(year);
                    return kairos(easterDate);
                },
                getOrthodoxEaster(year) {
                    const calculator = new EasterCalculator();
                    const orthodoxEasterDate = calculator.calculateOrthodoxEaster(year);
                    return kairos(orthodoxEasterDate);
                },
            });
        },
    };

    class LunarCalculator {
        constructor() {
            this.converters = {
                islamic: new IslamicConverter(),
                chinese: new ChineseConverter(),
                hebrew: new HebrewConverter(),
                persian: new PersianConverter(),
            };
        }
        calculate(rule, year) {
            const { calendar, month, day } = rule.rule;
            const converter = this.converters[calendar];
            if (!converter) {
                throw new Error(`Unknown lunar calendar: ${calendar}`);
            }
            const lunarYear = this.getLunarYear(year, calendar);
            const gregorianDate = converter.toGregorian(lunarYear, month, day);
            return [gregorianDate];
        }
        getLunarYear(gregorianYear, calendar) {
            switch (calendar) {
                case 'islamic':
                    return Math.round((gregorianYear - 622) * 1.030684);
                case 'chinese':
                    return gregorianYear - 2637;
                case 'hebrew':
                    return gregorianYear + 3761;
                case 'persian':
                    return gregorianYear - 622;
                default:
                    return gregorianYear;
            }
        }
    }
    class IslamicConverter {
        toGregorian(hijriYear, hijriMonth, hijriDay) {
            const epochOffset = 1948084;
            const yearLength = 354.36667;
            const totalDays = (hijriYear - 1) * yearLength + this.getIslamicMonthDays(hijriMonth, hijriYear) + hijriDay - 1;
            const julianDay = epochOffset + totalDays;
            return this.julianDayToGregorian(julianDay);
        }
        fromGregorian(date) {
            const julianDay = this.gregorianToJulianDay(date);
            const epochOffset = 1948084;
            const totalDays = julianDay - epochOffset;
            const yearLength = 354.36667;
            const year = Math.floor(totalDays / yearLength) + 1;
            const remainingDays = totalDays - (year - 1) * yearLength;
            let month = 1;
            let dayOfYear = remainingDays;
            while (dayOfYear > this.getIslamicMonthLength(month, year)) {
                dayOfYear -= this.getIslamicMonthLength(month, year);
                month++;
            }
            return {
                year,
                month,
                day: Math.floor(dayOfYear),
            };
        }
        getIslamicMonthDays(month, year) {
            let days = 0;
            for (let i = 1; i < month; i++) {
                days += this.getIslamicMonthLength(i, year);
            }
            return days;
        }
        getIslamicMonthLength(month, year) {
            const lengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
            if (month === 12 && this.isIslamicLeapYear(year)) {
                return 30;
            }
            return lengths[month - 1] || 29;
        }
        isIslamicLeapYear(year) {
            return (year * 11 + 14) % 30 < 11;
        }
        julianDayToGregorian(jd) {
            const a = jd + 32044;
            const b = Math.floor((4 * a + 3) / 146097);
            const c = a - Math.floor((146097 * b) / 4);
            const d = Math.floor((4 * c + 3) / 1461);
            const e = c - Math.floor((1461 * d) / 4);
            const m = Math.floor((5 * e + 2) / 153);
            const day = e - Math.floor((153 * m + 2) / 5) + 1;
            const month = m + 3 - 12 * Math.floor(m / 10);
            const year = 100 * b + d - 4800 + Math.floor(m / 10);
            return new Date(year, month - 1, day);
        }
        gregorianToJulianDay(date) {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const a = Math.floor((14 - month) / 12);
            const y = year + 4800 - a;
            const m = month + 12 * a - 3;
            return (day +
                Math.floor((153 * m + 2) / 5) +
                365 * y +
                Math.floor(y / 4) -
                Math.floor(y / 100) +
                Math.floor(y / 400) -
                32045);
        }
    }
    class ChineseConverter {
        toGregorian(chineseYear, chineseMonth, chineseDay) {
            const epochYear = 2637;
            const gregorianYear = chineseYear + epochYear;
            const newYearOffset = 21 + ((gregorianYear * 11) % 30);
            const baseDate = new Date(gregorianYear, 0, newYearOffset);
            const lunarMonthLength = 29.5;
            const totalDays = (chineseMonth - 1) * lunarMonthLength + chineseDay - 1;
            const result = new Date(baseDate);
            result.setDate(result.getDate() + totalDays);
            return result;
        }
        fromGregorian(date) {
            const epochYear = 2637;
            const year = date.getFullYear() - epochYear;
            return {
                year,
                month: date.getMonth() + 1,
                day: date.getDate(),
            };
        }
    }
    class HebrewConverter {
        toGregorian(hebrewYear, hebrewMonth, hebrewDay) {
            const epochOffset = 3761;
            const gregorianYear = hebrewYear - epochOffset;
            const baseDate = new Date(gregorianYear, 8, 15);
            const totalDays = (hebrewMonth - 1) * 29.5 + hebrewDay - 1;
            const result = new Date(baseDate);
            result.setDate(result.getDate() + totalDays);
            return result;
        }
        fromGregorian(date) {
            const epochOffset = 3761;
            const year = date.getFullYear() + epochOffset;
            return {
                year,
                month: date.getMonth() + 1,
                day: date.getDate(),
            };
        }
    }
    class PersianConverter {
        toGregorian(persianYear, persianMonth, persianDay) {
            const epochYear = 622;
            const gregorianYear = persianYear + epochYear;
            const baseDate = new Date(gregorianYear, 2, 21);
            const totalDays = (persianMonth - 1) * 30 + persianDay - 1;
            const result = new Date(baseDate);
            result.setDate(result.getDate() + totalDays);
            return result;
        }
        fromGregorian(date) {
            const epochYear = 622;
            const year = date.getFullYear() - epochYear;
            return {
                year,
                month: date.getMonth() + 1,
                day: date.getDate(),
            };
        }
    }
    var lunar = {
        name: 'holiday-lunar-calculator',
        version: '1.0.0',
        size: 2048,
        dependencies: ['holiday-engine'],
        install(kairos, _utils) {
            const engine = kairos.holidayEngine;
            if (engine) {
                engine.registerCalculator('lunar', new LunarCalculator());
            }
        },
    };

    class RelativeCalculator {
        constructor() {
            this.holidayCache = new Map();
            this.allHolidays = [];
            this.visitedHolidays = new Set();
        }
        calculate(rule, year, context) {
            const { relativeTo, offset } = rule.rule;
            if (context?.holidays) {
                this.allHolidays = context.holidays;
            }
            this.visitedHolidays = new Set();
            this.visitedHolidays.add(rule.name);
            const baseHoliday = this.findBaseHoliday(relativeTo);
            if (!baseHoliday) {
                throw new Error(`Base holiday '${relativeTo}' not found for relative rule '${rule.name}'`);
            }
            const baseDates = this.calculateBaseHolidayDates(baseHoliday, year);
            const result = [];
            for (const baseDate of baseDates) {
                const relativeDate = new Date(baseDate);
                relativeDate.setDate(relativeDate.getDate() + offset);
                result.push(relativeDate);
            }
            return result;
        }
        findBaseHoliday(relativeTo) {
            let baseHoliday = this.allHolidays.find((h) => h.name === relativeTo);
            if (!baseHoliday) {
                baseHoliday = this.allHolidays.find((h) => h.id === relativeTo);
            }
            if (!baseHoliday) {
                baseHoliday = this.allHolidays.find((h) => h.name && h.name.toLowerCase() === relativeTo.toLowerCase());
            }
            return baseHoliday || null;
        }
        calculateBaseHolidayDates(baseHoliday, year) {
            if (this.visitedHolidays.has(baseHoliday.name)) {
                const chain = Array.from(this.visitedHolidays).join(' -> ');
                throw new Error(`Circular dependency detected in holiday chain: ${chain} -> ${baseHoliday.name}`);
            }
            this.visitedHolidays.add(baseHoliday.name);
            const cacheKey = `${baseHoliday.name}-${year}`;
            if (this.holidayCache.has(cacheKey)) {
                return this.holidayCache.get(cacheKey);
            }
            const dates = this.calculateDirectHoliday(baseHoliday, year);
            this.holidayCache.set(cacheKey, dates);
            return dates;
        }
        calculateDirectHoliday(holiday, year) {
            switch (holiday.type) {
                case 'fixed':
                    return this.calculateFixed(holiday, year);
                case 'nth-weekday':
                    return this.calculateNthWeekday(holiday, year);
                case 'easter-based':
                    return this.calculateEasterBased(holiday, year);
                default:
                    throw new Error(`Cannot calculate base holiday of type: ${holiday.type}`);
            }
        }
        calculateFixed(holiday, year) {
            const { month, day } = holiday.rule;
            const date = new Date(year, month - 1, day);
            if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                return [];
            }
            return [date];
        }
        calculateNthWeekday(holiday, year) {
            const { month, weekday, nth } = holiday.rule;
            if (nth > 0) {
                return [this.getNthWeekdayOfMonth(year, month - 1, weekday, nth)];
            }
            else {
                return [this.getLastNthWeekdayOfMonth(year, month - 1, weekday, Math.abs(nth))];
            }
        }
        calculateEasterBased(holiday, year) {
            const { offset } = holiday.rule;
            const easter = this.calculateEaster(year);
            const result = new Date(easter);
            result.setDate(result.getDate() + offset);
            return [result];
        }
        getNthWeekdayOfMonth(year, month, weekday, nth) {
            const firstDay = new Date(year, month, 1);
            const firstDayWeekday = firstDay.getDay();
            let daysUntilWeekday = weekday - firstDayWeekday;
            if (daysUntilWeekday < 0) {
                daysUntilWeekday += 7;
            }
            const date = 1 + daysUntilWeekday + (nth - 1) * 7;
            return new Date(year, month, date);
        }
        getLastNthWeekdayOfMonth(year, month, weekday, nth) {
            const lastDay = new Date(year, month + 1, 0);
            const lastDayWeekday = lastDay.getDay();
            let daysBack = lastDayWeekday - weekday;
            if (daysBack < 0) {
                daysBack += 7;
            }
            const date = lastDay.getDate() - daysBack - (nth - 1) * 7;
            return new Date(year, month, date);
        }
        calculateEaster(year) {
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
            const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
            const day = ((h + l - 7 * m + 114) % 31) + 1;
            return new Date(year, month, day);
        }
        clearCache() {
            this.holidayCache.clear();
        }
    }
    var relative = {
        name: 'holiday-relative-calculator',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        install(kairos, _utils) {
            const engine = kairos.holidayEngine;
            if (engine) {
                engine.registerCalculator('relative', new RelativeCalculator());
            }
        },
    };

    class CustomCalculator {
        calculate(rule, year, context) {
            const { calculate } = rule.rule;
            if (typeof calculate !== 'function') {
                throw new Error(`Custom rule '${rule.name}' must have a calculate function`);
            }
            try {
                const result = calculate(year, context);
                if (result instanceof Date) {
                    return [result];
                }
                else if (Array.isArray(result)) {
                    return result.filter((item) => item instanceof Date);
                }
                else {
                    throw new Error(`Custom rule '${rule.name}' must return Date or Date[]`);
                }
            }
            catch (error) {
                throw new Error(`Error calculating custom rule '${rule.name}': ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    const CustomCalculatorUtils = {
        calculateVernalEquinox(year) {
            const base = new Date(year, 2, 20);
            const adjustment = Math.floor((year - 2000) * 0.24);
            base.setDate(base.getDate() + adjustment);
            return base;
        },
        calculateAutumnalEquinox(year) {
            const base = new Date(year, 8, 23);
            const adjustment = Math.floor((year - 2000) * 0.24);
            base.setDate(base.getDate() + adjustment);
            return base;
        },
        calculateSummerSolstice(year) {
            const base = new Date(year, 5, 21);
            const adjustment = Math.floor((year - 2000) * 0.24);
            base.setDate(base.getDate() + adjustment);
            return base;
        },
        calculateWinterSolstice(year) {
            const base = new Date(year, 11, 21);
            const adjustment = Math.floor((year - 2000) * 0.24);
            base.setDate(base.getDate() + adjustment);
            return base;
        },
        findWeekdayInMonth(year, month, weekday, position) {
            if (position === 'first') {
                const firstDay = new Date(year, month, 1);
                const firstDayWeekday = firstDay.getDay();
                let daysUntilWeekday = weekday - firstDayWeekday;
                if (daysUntilWeekday < 0) {
                    daysUntilWeekday += 7;
                }
                return new Date(year, month, 1 + daysUntilWeekday);
            }
            else {
                const lastDay = new Date(year, month + 1, 0);
                const lastDayWeekday = lastDay.getDay();
                let daysBack = lastDayWeekday - weekday;
                if (daysBack < 0) {
                    daysBack += 7;
                }
                return new Date(year, month, lastDay.getDate() - daysBack);
            }
        },
        calculateNewMoon(year, month) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const approximateNewMoon = Math.floor(daysInMonth * 0.5);
            return new Date(year, month - 1, approximateNewMoon);
        },
        calculateFullMoon(year, month) {
            const newMoon = this.calculateNewMoon(year, month);
            const fullMoon = new Date(newMoon);
            fullMoon.setDate(fullMoon.getDate() + 14);
            return fullMoon;
        },
        getNextBusinessDay(date) {
            const next = new Date(date);
            next.setDate(next.getDate() + 1);
            while (next.getDay() === 0 || next.getDay() === 6) {
                next.setDate(next.getDate() + 1);
            }
            return next;
        },
        getPreviousBusinessDay(date) {
            const prev = new Date(date);
            prev.setDate(prev.getDate() - 1);
            while (prev.getDay() === 0 || prev.getDay() === 6) {
                prev.setDate(prev.getDate() - 1);
            }
            return prev;
        },
        getDateInTimezone(date, timezone) {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            });
            const parts = formatter.formatToParts(date);
            const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
            const month = parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10) - 1;
            const day = parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);
            const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
            const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
            const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
            return new Date(year, month, day, hour, minute, second, date.getMilliseconds());
        },
        getDSTTransition(year, type) {
            if (type === 'spring') {
                const firstSunday = this.findWeekdayInMonth(year, 2, 0, 'first');
                const secondSunday = new Date(firstSunday);
                secondSunday.setDate(secondSunday.getDate() + 7);
                return secondSunday;
            }
            else {
                return this.findWeekdayInMonth(year, 10, 0, 'first');
            }
        },
        calculateGoldenWeekSubstitutes(year) {
            const holidays = [
                new Date(year, 3, 29),
                new Date(year, 4, 3),
                new Date(year, 4, 4),
                new Date(year, 4, 5),
            ];
            const substitutes = [];
            for (const holiday of holidays) {
                const weekday = holiday.getDay();
                if (weekday === 0) {
                    const substitute = new Date(holiday);
                    substitute.setDate(substitute.getDate() + 1);
                    substitutes.push(substitute);
                }
            }
            return substitutes;
        },
        calculateQingming(year) {
            const base = new Date(year, 3, 5);
            const adjustment = Math.floor((year - 2000) * 0.24);
            base.setDate(base.getDate() + adjustment);
            return base;
        },
    };
    var custom = {
        name: 'holiday-custom-calculator',
        version: '1.0.0',
        size: 1536,
        dependencies: ['holiday-engine'],
        install(kairos, _utils) {
            const engine = kairos.holidayEngine;
            if (engine) {
                engine.registerCalculator('custom', new CustomCalculator());
            }
            kairos.addStatic?.({
                customCalculatorUtils: CustomCalculatorUtils,
            });
        },
    };

    class BusinessDayCalculator {
        constructor(config = {}) {
            this.cache = new Map();
            this.config = {
                weekends: [0, 6],
                holidays: [],
                customRules: [],
                ...config,
            };
        }
        updateConfig(config) {
            this.config = { ...this.config, ...config };
            this.cache.clear();
        }
        isBusinessDay(date) {
            const cacheKey = date.toISOString().split('T')[0];
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            const result = this.calculateIsBusinessDay(date);
            this.cache.set(cacheKey, result);
            return result;
        }
        calculateIsBusinessDay(date) {
            const dayOfWeek = date.getDay();
            if (this.config.weekends?.includes(dayOfWeek)) {
                return false;
            }
            if (this.config.holidays && this.config.holidays.length > 0) {
                const holidayEngine = globalThis.kairos?.holidayEngine;
                if (holidayEngine) {
                    const holidayInfo = holidayEngine.isHoliday(date, this.config.holidays);
                    if (holidayInfo) {
                        return false;
                    }
                }
            }
            if (this.config.customRules) {
                for (const rule of this.config.customRules) {
                    if (!rule(date)) {
                        return false;
                    }
                }
            }
            return true;
        }
        nextBusinessDay(date, maxIterations = 1000) {
            const next = new Date(date);
            next.setDate(next.getDate() + 1);
            let iterations = 0;
            while (!this.isBusinessDay(next)) {
                if (++iterations > maxIterations) {
                    throw new Error('No business day found within reasonable range (1000 days). Check your business day configuration.');
                }
                next.setDate(next.getDate() + 1);
            }
            return next;
        }
        previousBusinessDay(date, maxIterations = 1000) {
            const prev = new Date(date);
            prev.setDate(prev.getDate() - 1);
            let iterations = 0;
            while (!this.isBusinessDay(prev)) {
                if (++iterations > maxIterations) {
                    throw new Error('No business day found within reasonable range (1000 days). Check your business day configuration.');
                }
                prev.setDate(prev.getDate() - 1);
            }
            return prev;
        }
        addBusinessDays(date, days, maxIterations = 10000) {
            if (days === 0)
                return new Date(date);
            const current = new Date(date);
            let count = 0;
            const direction = days > 0 ? 1 : -1;
            const target = Math.abs(days);
            let iterations = 0;
            while (count < target) {
                if (++iterations > maxIterations) {
                    throw new Error(`Unable to add ${days} business days within ${maxIterations} iterations. Check your business day configuration.`);
                }
                current.setDate(current.getDate() + direction);
                if (this.isBusinessDay(current)) {
                    count++;
                }
            }
            return current;
        }
        businessDaysBetween(start, end) {
            const startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(end);
            endDate.setHours(0, 0, 0, 0);
            if (startDate.getTime() === endDate.getTime()) {
                return 0;
            }
            const isForward = startDate < endDate;
            const direction = isForward ? 1 : -1;
            let count = 0;
            const current = new Date(startDate);
            current.setDate(current.getDate() + direction);
            while (isForward ? current.getTime() <= endDate.getTime() : current.getTime() >= endDate.getTime()) {
                if (this.isBusinessDay(current)) {
                    count++;
                }
                current.setDate(current.getDate() + direction);
            }
            return isForward ? count : -count;
        }
        businessDaysInMonth(year, month) {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            let count = 0;
            const current = new Date(firstDay);
            while (current <= lastDay) {
                if (this.isBusinessDay(current)) {
                    count++;
                }
                current.setDate(current.getDate() + 1);
            }
            return count;
        }
        businessDaysInYear(year) {
            const firstDay = new Date(year, 0, 1);
            const lastDay = new Date(year, 11, 31);
            let count = 0;
            const current = new Date(firstDay);
            while (current <= lastDay) {
                if (this.isBusinessDay(current)) {
                    count++;
                }
                current.setDate(current.getDate() + 1);
            }
            return count;
        }
        settlementDate(date, days) {
            return this.addBusinessDays(date, days);
        }
        getBusinessDaysInMonth(year, month) {
            const result = [];
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const current = new Date(firstDay);
            while (current <= lastDay) {
                if (this.isBusinessDay(current)) {
                    result.push(new Date(current));
                }
                current.setDate(current.getDate() + 1);
            }
            return result;
        }
        getBusinessDaysInRange(start, end) {
            const result = [];
            const current = new Date(start);
            while (current <= end) {
                if (this.isBusinessDay(current)) {
                    result.push(new Date(current));
                }
                current.setDate(current.getDate() + 1);
            }
            return result;
        }
        getNthBusinessDay(year, month, nth) {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const current = new Date(firstDay);
            let count = 0;
            while (current <= lastDay) {
                if (this.isBusinessDay(current)) {
                    count++;
                    if (count === nth) {
                        return new Date(current);
                    }
                }
                current.setDate(current.getDate() + 1);
            }
            return null;
        }
        getLastBusinessDay(year, month) {
            const lastDay = new Date(year, month + 1, 0);
            const current = new Date(lastDay);
            while (current.getMonth() === month) {
                if (this.isBusinessDay(current)) {
                    return new Date(current);
                }
                current.setDate(current.getDate() - 1);
            }
            return null;
        }
        clearCache() {
            this.cache.clear();
        }
    }
    const defaultCalculator = new BusinessDayCalculator();
    var workday = {
        name: 'business-workday',
        version: '1.0.0',
        size: 2048,
        dependencies: ['holiday-engine'],
        install(kairos, _utils) {
            kairos.extend({
                isBusinessDay(config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    if (!config?.holidays && this.getHolidays) {
                        const holidays = this.getHolidays();
                        calculator.updateConfig({ holidays });
                    }
                    return calculator.isBusinessDay(this.toDate());
                },
                isWeekend() {
                    const dayOfWeek = this.day();
                    return dayOfWeek === 0 || dayOfWeek === 6;
                },
                nextBusinessDay(config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    if (!config?.holidays && this.getHolidays) {
                        const holidays = this.getHolidays();
                        calculator.updateConfig({ holidays });
                    }
                    const nextDate = calculator.nextBusinessDay(this.toDate());
                    return kairos(nextDate);
                },
                previousBusinessDay(config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    if (!config?.holidays && this.getHolidays) {
                        const holidays = this.getHolidays();
                        calculator.updateConfig({ holidays });
                    }
                    const prevDate = calculator.previousBusinessDay(this.toDate());
                    return kairos(prevDate);
                },
                addBusinessDays(days, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    if (!config?.holidays && this.getHolidays) {
                        const holidays = this.getHolidays();
                        calculator.updateConfig({ holidays });
                    }
                    const resultDate = calculator.addBusinessDays(this.toDate(), days);
                    return kairos(resultDate);
                },
                businessDaysBetween(other, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    if (!config?.holidays && this.getHolidays) {
                        const holidays = this.getHolidays();
                        calculator.updateConfig({ holidays });
                    }
                    return calculator.businessDaysBetween(this.toDate(), other.toDate());
                },
                businessDaysInMonth(config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    if (!config?.holidays && this.getHolidays) {
                        const holidays = this.getHolidays();
                        calculator.updateConfig({ holidays });
                    }
                    return calculator.businessDaysInMonth(this.year(), this.month() - 1);
                },
                settlementDate(days, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    if (!config?.holidays && this.getHolidays) {
                        const holidays = this.getHolidays();
                        calculator.updateConfig({ holidays });
                    }
                    const settlementDate = calculator.settlementDate(this.toDate(), days);
                    return kairos(settlementDate);
                },
                isWorkingHour(startHour = 9, endHour = 17) {
                    const hour = this.hour();
                    return this.isBusinessDay() && hour >= startHour && hour < endHour;
                },
            });
            kairos.addStatic?.({
                businessDayCalculator: defaultCalculator,
                createBusinessDayCalculator(config) {
                    return new BusinessDayCalculator(config);
                },
                getBusinessDaysInMonth(year, month, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    const dates = calculator.getBusinessDaysInMonth(year, month - 1);
                    return dates.map((date) => kairos(date));
                },
                getBusinessDaysInRange(start, end, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    const startDate = kairos(start).toDate();
                    const endDate = kairos(end).toDate();
                    const dates = calculator.getBusinessDaysInRange(startDate, endDate);
                    return dates.map((date) => kairos(date));
                },
                getNthBusinessDay(year, month, nth, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    const date = calculator.getNthBusinessDay(year, month - 1, nth);
                    return date ? kairos(date) : null;
                },
                getLastBusinessDay(year, month, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    const date = calculator.getLastBusinessDay(year, month - 1);
                    return date ? kairos(date) : null;
                },
                businessDaysInYear(year, config) {
                    const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
                    return calculator.businessDaysInYear(year);
                },
            });
        },
    };

    class FiscalYearCalculator {
        constructor(config) {
            this.config = config;
        }
        getStartMonth() {
            if (typeof this.config.start === 'number') {
                return this.config.start;
            }
            if (typeof this.config.start !== 'string') {
                return 1;
            }
            const monthNames = [
                'january',
                'february',
                'march',
                'april',
                'may',
                'june',
                'july',
                'august',
                'september',
                'october',
                'november',
                'december',
            ];
            const index = monthNames.indexOf(this.config.start.toLowerCase());
            return index === -1 ? 1 : index + 1;
        }
        getFiscalYear(date) {
            const startMonth = this.getStartMonth();
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            if (month >= startMonth) {
                return year;
            }
            else {
                return year - 1;
            }
        }
        getFiscalYearStart(fiscalYear) {
            const startMonth = this.getStartMonth();
            return new Date(fiscalYear, startMonth - 1, 1);
        }
        getFiscalYearEnd(fiscalYear) {
            const startMonth = this.getStartMonth();
            const endMonth = startMonth === 1 ? 12 : startMonth - 1;
            const endYear = startMonth === 1 ? fiscalYear : fiscalYear + 1;
            const lastDay = new Date(endYear, endMonth, 0).getDate();
            return new Date(endYear, endMonth - 1, lastDay);
        }
        getFiscalQuarter(date) {
            const startMonth = this.getStartMonth();
            const month = date.getMonth() + 1;
            let monthsFromStart = month - startMonth;
            if (monthsFromStart < 0) {
                monthsFromStart += 12;
            }
            return Math.floor(monthsFromStart / 3) + 1;
        }
        getFiscalQuarterStart(fiscalYear, quarter) {
            const startMonth = this.getStartMonth();
            const quarterMonthOffset = (quarter - 1) * 3;
            const quarterStartMonth = (startMonth - 1 + quarterMonthOffset) % 12;
            const quarterStartYear = fiscalYear + Math.floor((startMonth - 1 + quarterMonthOffset) / 12);
            return new Date(quarterStartYear, quarterStartMonth, 1);
        }
        getFiscalQuarterEnd(fiscalYear, quarter) {
            const startMonth = this.getStartMonth();
            const quarterEndMonthOffset = quarter * 3 - 1;
            const quarterEndMonth = (startMonth - 1 + quarterEndMonthOffset) % 12;
            const quarterEndYear = fiscalYear + Math.floor((startMonth - 1 + quarterEndMonthOffset) / 12);
            const lastDay = new Date(quarterEndYear, quarterEndMonth + 1, 0).getDate();
            return new Date(quarterEndYear, quarterEndMonth, lastDay);
        }
        getDaysInFiscalYear(fiscalYear) {
            const start = this.getFiscalYearStart(fiscalYear);
            const end = this.getFiscalYearEnd(fiscalYear);
            return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        }
        getDaysInFiscalQuarter(fiscalYear, quarter) {
            const start = this.getFiscalQuarterStart(fiscalYear, quarter);
            const end = this.getFiscalQuarterEnd(fiscalYear, quarter);
            return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        }
        getFiscalWeek(date) {
            const fiscalYear = this.getFiscalYear(date);
            const fiscalYearStart = this.getFiscalYearStart(fiscalYear);
            const diffTime = date.getTime() - fiscalYearStart.getTime();
            const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
            return Math.floor(diffDays / 7) + 1;
        }
        static getCommonConfigs() {
            return {
                US: { start: 10 },
                UK: { start: 4 },
                Canada: { start: 4 },
                Australia: { start: 7 },
                India: { start: 4 },
                Japan: { start: 4 },
                Germany: { start: 1 },
                France: { start: 1 },
                China: { start: 1 },
                Brazil: { start: 1 },
                Russia: { start: 1 },
                'South Korea': { start: 1 },
                Singapore: { start: 4 },
                'Hong Kong': { start: 4 },
                'New Zealand': { start: 4 },
                Mexico: { start: 1 },
                'South Africa': { start: 3 },
                Turkey: { start: 1 },
                Israel: { start: 1 },
                'Saudi Arabia': { start: 1 },
                UAE: { start: 1 },
                Egypt: { start: 7 },
                Nigeria: { start: 1 },
                Kenya: { start: 7 },
                'Corporate-Q1': { start: 1 },
                'Corporate-Q2': { start: 4 },
                'Corporate-Q3': { start: 7 },
                'Corporate-Q4': { start: 10 },
                'Academic-US': { start: 8 },
                'Academic-UK': { start: 9 },
                'Retail-US': { start: 2 },
                'Retail-4-5-4': { start: 2 },
            };
        }
    }
    var fiscal = {
        name: 'business-fiscal',
        version: '1.0.0',
        size: 1536,
        dependencies: ['business-workday'],
        install(kairos, _utils) {
            kairos.extend({
                fiscalYear(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    return calculator.getFiscalYear(this.toDate());
                },
                fiscalYearStart(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const start = calculator.getFiscalYearStart(fiscalYear);
                    return kairos(start);
                },
                fiscalYearEnd(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const end = calculator.getFiscalYearEnd(fiscalYear);
                    return kairos(end);
                },
                fiscalQuarter(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    return calculator.getFiscalQuarter(this.toDate());
                },
                fiscalQuarterStart(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const quarter = calculator.getFiscalQuarter(this.toDate());
                    const start = calculator.getFiscalQuarterStart(fiscalYear, quarter);
                    return kairos(start);
                },
                fiscalQuarterEnd(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const quarter = calculator.getFiscalQuarter(this.toDate());
                    const end = calculator.getFiscalQuarterEnd(fiscalYear, quarter);
                    return kairos(end);
                },
                fiscalWeek(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    return calculator.getFiscalWeek(this.toDate());
                },
                isFiscalYearStart(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const start = calculator.getFiscalYearStart(fiscalYear);
                    return this.isSame(kairos(start));
                },
                isFiscalYearEnd(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const end = calculator.getFiscalYearEnd(fiscalYear);
                    return this.isSame(kairos(end));
                },
                isFiscalQuarterStart(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const quarter = calculator.getFiscalQuarter(this.toDate());
                    const start = calculator.getFiscalQuarterStart(fiscalYear, quarter);
                    return this.isSame(kairos(start));
                },
                isFiscalQuarterEnd(config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const fiscalYear = calculator.getFiscalYear(this.toDate());
                    const quarter = calculator.getFiscalQuarter(this.toDate());
                    const end = calculator.getFiscalQuarterEnd(fiscalYear, quarter);
                    return this.isSame(kairos(end));
                },
            });
            kairos.addStatic?.({
                fiscalYearCalculator: FiscalYearCalculator,
                getFiscalYearConfig(country) {
                    const configs = FiscalYearCalculator.getCommonConfigs();
                    return configs[country] || null;
                },
                getAvailableFiscalConfigs() {
                    return Object.keys(FiscalYearCalculator.getCommonConfigs());
                },
                createFiscalCalculator(config) {
                    return new FiscalYearCalculator(config);
                },
                getFiscalYearInfo(fiscalYear, config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    return {
                        fiscalYear,
                        start: kairos(calculator.getFiscalYearStart(fiscalYear)),
                        end: kairos(calculator.getFiscalYearEnd(fiscalYear)),
                        days: calculator.getDaysInFiscalYear(fiscalYear),
                        quarters: [1, 2, 3, 4].map((q) => ({
                            quarter: q,
                            start: kairos(calculator.getFiscalQuarterStart(fiscalYear, q)),
                            end: kairos(calculator.getFiscalQuarterEnd(fiscalYear, q)),
                            days: calculator.getDaysInFiscalQuarter(fiscalYear, q),
                        })),
                    };
                },
                getBusinessDaysInFiscalYear(fiscalYear, config) {
                    const fiscalConfig = config || { start: 1 };
                    const calculator = new FiscalYearCalculator(fiscalConfig);
                    const start = calculator.getFiscalYearStart(fiscalYear);
                    const end = calculator.getFiscalYearEnd(fiscalYear);
                    const businessCalc = kairos.businessDayCalculator;
                    return (businessCalc.businessDaysBetween(start, end) + (businessCalc.isBusinessDay(start) ? 1 : 0));
                },
            });
        },
    };

    const defaultLocale = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years',
    };
    const locales = {
        en: defaultLocale,
        'en-US': defaultLocale,
        'en-GB': defaultLocale,
        de: {
            future: 'in %s',
            past: 'vor %s',
            s: 'ein paar Sekunden',
            m: 'eine Minute',
            mm: '%d Minuten',
            h: 'eine Stunde',
            hh: '%d Stunden',
            d: 'ein Tag',
            dd: '%d Tage',
            M: 'ein Monat',
            MM: '%d Monate',
            y: 'ein Jahr',
            yy: '%d Jahre',
        },
        'de-DE': {
            future: 'in %s',
            past: 'vor %s',
            s: 'ein paar Sekunden',
            m: 'eine Minute',
            mm: '%d Minuten',
            h: 'eine Stunde',
            hh: '%d Stunden',
            d: 'ein Tag',
            dd: '%d Tage',
            M: 'ein Monat',
            MM: '%d Monate',
            y: 'ein Jahr',
            yy: '%d Jahre',
        },
        tr: {
            future: '%s içinde',
            past: '%s önce',
            s: 'birkaç saniye',
            m: 'bir dakika',
            mm: '%d dakika',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir gün',
            dd: '%d gün',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir yıl',
            yy: '%d yıl',
        },
        'tr-TR': {
            future: '%s içinde',
            past: '%s önce',
            s: 'birkaç saniye',
            m: 'bir dakika',
            mm: '%d dakika',
            h: 'bir saat',
            hh: '%d saat',
            d: 'bir gün',
            dd: '%d gün',
            M: 'bir ay',
            MM: '%d ay',
            y: 'bir yıl',
            yy: '%d yıl',
        },
        ja: {
            future: '%s後',
            past: '%s前',
            s: '数秒',
            m: '1分',
            mm: '%d分',
            h: '1時間',
            hh: '%d時間',
            d: '1日',
            dd: '%d日',
            M: '1ヶ月',
            MM: '%dヶ月',
            y: '1年',
            yy: '%d年',
        },
        'ja-JP': {
            future: '%s後',
            past: '%s前',
            s: '数秒',
            m: '1分',
            mm: '%d分',
            h: '1時間',
            hh: '%d時間',
            d: '1日',
            dd: '%d日',
            M: '1ヶ月',
            MM: '%dヶ月',
            y: '1年',
            yy: '%d年',
        },
    };
    class RelativeTimeCalculator {
        constructor(locale = 'en') {
            this.locale = locales[locale] || locales[locale.split('-')[0]] || defaultLocale;
        }
        format(diff, withoutSuffix = false) {
            const abs = Math.abs(diff);
            const seconds = Math.round(abs / 1000);
            const minutes = Math.round(seconds / 60);
            const hours = Math.round(minutes / 60);
            const days = Math.round(hours / 24);
            const months = Math.round(days / 30.436875);
            const years = Math.round(days / 365.25);
            let result;
            if (seconds < 45) {
                result = this.locale.s;
            }
            else if (seconds < 90) {
                result = this.locale.m;
            }
            else if (minutes < 45) {
                result = this.locale.mm.replace('%d', minutes.toString());
            }
            else if (minutes < 90) {
                result = this.locale.h;
            }
            else if (hours < 22) {
                result = this.locale.hh.replace('%d', hours.toString());
            }
            else if (hours < 36) {
                result = this.locale.d;
            }
            else if (days < 26) {
                result = this.locale.dd.replace('%d', days.toString());
            }
            else if (days < 46) {
                result = this.locale.M;
            }
            else if (days < 320) {
                result = this.locale.MM.replace('%d', months.toString());
            }
            else if (days < 548) {
                result = this.locale.y;
            }
            else {
                result = this.locale.yy.replace('%d', years.toString());
            }
            if (withoutSuffix) {
                return result;
            }
            const template = diff > 0 ? this.locale.future : this.locale.past;
            return template.replace('%s', result);
        }
        formatNative(diff, locale = 'en', options = {}) {
            if (typeof Intl !== 'undefined' && Intl.RelativeTimeFormat) {
                const rtf = new Intl.RelativeTimeFormat(locale, {
                    numeric: options.numeric || 'auto',
                    style: options.style || 'long',
                });
                const abs = Math.abs(diff);
                const seconds = abs / 1000;
                const minutes = seconds / 60;
                const hours = minutes / 60;
                const days = hours / 24;
                const weeks = days / 7;
                const months = days / 30.436875;
                const years = days / 365.25;
                const sign = diff > 0 ? 1 : -1;
                if (years >= 1) {
                    return rtf.format(sign * Math.round(years), 'year');
                }
                if (months >= 1) {
                    return rtf.format(sign * Math.round(months), 'month');
                }
                if (weeks >= 1) {
                    return rtf.format(sign * Math.round(weeks), 'week');
                }
                if (days >= 1) {
                    return rtf.format(sign * Math.round(days), 'day');
                }
                if (hours >= 1) {
                    return rtf.format(sign * Math.round(hours), 'hour');
                }
                if (minutes >= 1) {
                    return rtf.format(sign * Math.round(minutes), 'minute');
                }
                return rtf.format(sign * Math.round(seconds), 'second');
            }
            return this.format(diff);
        }
    }
    const relativeTimePlugin = {
        name: 'relativeTime',
        install(kairos) {
            kairos.extend({
                fromNow(withoutSuffix = false) {
                    const now = Date.now();
                    const thisTime = this.valueOf();
                    const diff = thisTime - now;
                    const calculator = new RelativeTimeCalculator();
                    return calculator.format(diff, withoutSuffix);
                },
                from(other, withoutSuffix = false) {
                    const thisTime = this.valueOf();
                    const otherTime = other.valueOf();
                    const diff = thisTime - otherTime;
                    const calculator = new RelativeTimeCalculator();
                    return calculator.format(diff, withoutSuffix);
                },
                toNow(withoutSuffix = false) {
                    const now = Date.now();
                    const thisTime = this.valueOf();
                    const diff = now - thisTime;
                    const calculator = new RelativeTimeCalculator();
                    return calculator.format(diff, withoutSuffix);
                },
                to(other, withoutSuffix = false) {
                    const thisTime = this.valueOf();
                    const otherTime = other.valueOf();
                    const diff = otherTime - thisTime;
                    const calculator = new RelativeTimeCalculator();
                    return calculator.format(diff, withoutSuffix);
                },
                humanize(withSuffix = false) {
                    const calculator = new RelativeTimeCalculator();
                    const value = this.valueOf();
                    return calculator.format(value, !withSuffix);
                },
                fromNowNative(locale = 'en', options) {
                    const now = Date.now();
                    const thisTime = this.valueOf();
                    const diff = thisTime - now;
                    const calculator = new RelativeTimeCalculator();
                    return calculator.formatNative(diff, locale, options);
                },
                toNowNative(locale = 'en', options) {
                    const now = Date.now();
                    const thisTime = this.valueOf();
                    const diff = now - thisTime;
                    const calculator = new RelativeTimeCalculator();
                    return calculator.formatNative(diff, locale, options);
                },
            });
            kairos.addStatic({
                relativeTime: {
                    registerLocale(name, locale) {
                        locales[name] = locale;
                    },
                    getLocale(name) {
                        return locales[name];
                    },
                    calculator(locale) {
                        return new RelativeTimeCalculator(locale);
                    },
                },
            });
        },
    };

    class CalendarCalculator {
        static getISOWeek(date) {
            const d = new Date(date.getTime());
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
            return weekNumber;
        }
        static getISOWeekYear(date) {
            const d = new Date(date.getTime());
            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
            return d.getFullYear();
        }
        static getWeek(date, startDay = 0) {
            const d = new Date(date.getTime());
            d.setHours(0, 0, 0, 0);
            const yearStart = new Date(d.getFullYear(), 0, 1);
            yearStart.setHours(0, 0, 0, 0);
            const yearStartDay = yearStart.getDay();
            const daysToWeekStart = (startDay - yearStartDay + 7) % 7;
            const firstWeekStart = new Date(yearStart);
            if (daysToWeekStart > 0) {
                firstWeekStart.setDate(yearStart.getDate() + daysToWeekStart - 7);
            }
            const daysDiff = Math.floor((d.getTime() - firstWeekStart.getTime()) / 86400000);
            const weekNumber = Math.floor(daysDiff / 7) + 1;
            if (weekNumber < 1) {
                const prevYearEnd = new Date(d.getFullYear() - 1, 11, 31);
                return this.getWeek(prevYearEnd, startDay);
            }
            return weekNumber;
        }
        static getQuarter(date) {
            return Math.floor(date.getMonth() / 3) + 1;
        }
        static getDayOfYear(date) {
            const start = new Date(Date.UTC(date.getFullYear(), 0, 1));
            const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const diff = target.getTime() - start.getTime();
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay) + 1;
        }
        static getDaysInMonth(date) {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        }
        static getDaysInYear(year) {
            return this.isLeapYear(year) ? 366 : 365;
        }
        static isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }
        static getWeekOfMonth(date, startDay = 0) {
            const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
            const firstDayOfWeek = firstDay.getDay();
            const offsetDays = (firstDayOfWeek - startDay + 7) % 7;
            const dayOfMonth = date.getDate();
            return Math.ceil((dayOfMonth + offsetDays) / 7);
        }
        static getCalendarInfo(date) {
            const year = date.getFullYear();
            return {
                year,
                quarter: this.getQuarter(date),
                month: date.getMonth() + 1,
                week: this.getWeek(date),
                weekYear: year,
                isoWeek: this.getISOWeek(date),
                isoWeekYear: this.getISOWeekYear(date),
                dayOfYear: this.getDayOfYear(date),
                dayOfWeek: date.getDay(),
                daysInMonth: this.getDaysInMonth(date),
                daysInYear: this.getDaysInYear(year),
                isLeapYear: this.isLeapYear(year),
                weekOfMonth: this.getWeekOfMonth(date),
            };
        }
    }
    const calendarPlugin = {
        name: 'calendar',
        install(kairos) {
            kairos.extend({
                quarter(value) {
                    const current = CalendarCalculator.getQuarter(this.toDate());
                    if (value === undefined) {
                        return current;
                    }
                    if (value < 1 || value > 4) {
                        throw new Error('Quarter must be between 1 and 4');
                    }
                    const clone = this.clone();
                    const month = (value - 1) * 3 + 1;
                    return clone.month(month);
                },
                week(value) {
                    const current = CalendarCalculator.getWeek(this.toDate());
                    if (value === undefined) {
                        return current;
                    }
                    const clone = this.clone();
                    const currentWeek = current;
                    const weekDiff = value - currentWeek;
                    return clone.add(weekDiff * 7, 'days');
                },
                isoWeek(value) {
                    const current = CalendarCalculator.getISOWeek(this.toDate());
                    if (value === undefined) {
                        return current;
                    }
                    const clone = this.clone();
                    const currentWeek = current;
                    const weekDiff = value - currentWeek;
                    return clone.add(weekDiff * 7, 'days');
                },
                isoWeekYear() {
                    return CalendarCalculator.getISOWeekYear(this.toDate());
                },
                weekYear() {
                    return this.year();
                },
                dayOfYear(value) {
                    const current = CalendarCalculator.getDayOfYear(this.toDate());
                    if (value === undefined) {
                        return current;
                    }
                    const year = this.year();
                    const yearStart = new Date(year, 0, 1);
                    yearStart.setDate(yearStart.getDate() + value - 1);
                    return kairos(yearStart);
                },
                daysInMonth() {
                    return CalendarCalculator.getDaysInMonth(this.toDate());
                },
                daysInYear() {
                    return CalendarCalculator.getDaysInYear(this.year());
                },
                isLeapYear() {
                    return CalendarCalculator.isLeapYear(this.year());
                },
                weekOfMonth() {
                    return CalendarCalculator.getWeekOfMonth(this.toDate());
                },
                calendarInfo() {
                    return CalendarCalculator.getCalendarInfo(this.toDate());
                },
                startOfQuarter() {
                    const quarter = this.quarter();
                    const month = (quarter - 1) * 3;
                    return kairos(new Date(this.year(), month, 1)).startOf('day');
                },
                endOfQuarter() {
                    const quarter = this.quarter();
                    const month = quarter * 3;
                    return kairos(new Date(this.year(), month, 0)).endOf('day');
                },
                startOfWeek(startDay = 0) {
                    const clone = this.clone();
                    const day = clone.day();
                    const diff = (day < startDay ? -7 : 0) + startDay - day;
                    return clone.add(diff, 'days').startOf('day');
                },
                endOfWeek(startDay = 0) {
                    const clone = this.clone();
                    const day = clone.day();
                    const diff = (day < startDay ? -7 : 0) + startDay - day + 6;
                    return clone.add(diff, 'days').endOf('day');
                },
                startOfISOWeek() {
                    return this.startOfWeek(1);
                },
                endOfISOWeek() {
                    return this.endOfWeek(1);
                },
                isWeekend() {
                    const day = this.day();
                    return day === 0 || day === 6;
                },
                isWeekday() {
                    return !this.isWeekend();
                },
                isSameQuarter(other) {
                    return this.quarter() === other.quarter() && this.year() === other.year();
                },
                isSameWeek(other, startDay = 0) {
                    const thisStart = this.startOfWeek(startDay);
                    const otherStart = other.startOfWeek(startDay);
                    return thisStart.format('YYYY-MM-DD') === otherStart.format('YYYY-MM-DD');
                },
                isSameISOWeek(other) {
                    return this.isoWeek() === other.isoWeek() && this.isoWeekYear() === other.isoWeekYear();
                },
                weeksInYear() {
                    const lastDay = kairos(new Date(this.year(), 11, 31));
                    return CalendarCalculator.getWeek(lastDay.toDate());
                },
                isoWeeksInYear() {
                    const year = this.year();
                    const lastWeek = CalendarCalculator.getISOWeek(new Date(year, 11, 31));
                    if (lastWeek === 1) {
                        return CalendarCalculator.getISOWeek(new Date(year, 11, 24));
                    }
                    return lastWeek;
                },
            });
            kairos.addStatic({
                calendar: CalendarCalculator,
            });
        },
    };

    const holidays$9 = [
        {
            id: 'new-years-day',
            name: "New Year's Day",
            type: 'fixed',
            rule: { month: 1, day: 1 },
            observedRule: {
                type: 'substitute',
                weekends: [0, 6],
                direction: 'forward',
            },
        },
        {
            id: 'independence-day',
            name: 'Independence Day',
            type: 'fixed',
            rule: { month: 7, day: 4 },
            observedRule: {
                type: 'substitute',
                weekends: [0, 6],
                direction: 'forward',
            },
        },
        {
            id: 'veterans-day',
            name: 'Veterans Day',
            type: 'fixed',
            rule: { month: 11, day: 11 },
            observedRule: {
                type: 'substitute',
                weekends: [0, 6],
                direction: 'forward',
            },
        },
        {
            id: 'juneteenth',
            name: 'Juneteenth',
            type: 'fixed',
            rule: { month: 6, day: 19 },
            observedRule: {
                type: 'substitute',
                weekends: [0, 6],
                direction: 'forward',
            },
        },
        {
            id: 'christmas-day',
            name: 'Christmas Day',
            type: 'fixed',
            rule: { month: 12, day: 25 },
            observedRule: {
                type: 'substitute',
                weekends: [0, 6],
                direction: 'forward',
            },
        },
        {
            id: 'martin-luther-king-day',
            name: 'Martin Luther King Jr. Day',
            type: 'nth-weekday',
            rule: { month: 1, weekday: 1, nth: 3 },
        },
        {
            id: 'presidents-day',
            name: "Presidents' Day",
            type: 'nth-weekday',
            rule: { month: 2, weekday: 1, nth: 3 },
        },
        {
            id: 'mothers-day',
            name: "Mother's Day",
            type: 'nth-weekday',
            rule: { month: 5, weekday: 0, nth: 2 },
        },
        {
            id: 'memorial-day',
            name: 'Memorial Day',
            type: 'nth-weekday',
            rule: { month: 5, weekday: 1, nth: -1 },
        },
        {
            id: 'fathers-day',
            name: "Father's Day",
            type: 'nth-weekday',
            rule: { month: 6, weekday: 0, nth: 3 },
        },
        {
            id: 'labor-day',
            name: 'Labor Day',
            type: 'nth-weekday',
            rule: { month: 9, weekday: 1, nth: 1 },
        },
        {
            id: 'columbus-day',
            name: 'Columbus Day',
            type: 'nth-weekday',
            rule: { month: 10, weekday: 1, nth: 2 },
        },
        {
            id: 'thanksgiving',
            name: 'Thanksgiving',
            type: 'nth-weekday',
            rule: { month: 11, weekday: 4, nth: 4 },
        },
        {
            id: 'black-friday',
            name: 'Black Friday',
            type: 'relative',
            rule: { relativeTo: 'thanksgiving', offset: 1 },
        },
        {
            id: 'good-friday',
            name: 'Good Friday',
            type: 'easter-based',
            rule: { offset: -2 },
        },
        {
            id: 'easter-sunday',
            name: 'Easter Sunday',
            type: 'easter-based',
            rule: { offset: 0 },
        },
        {
            id: 'easter-monday',
            name: 'Easter Monday',
            type: 'easter-based',
            rule: { offset: 1 },
        },
    ];
    const stateHolidays$1 = {
        texas: [
            {
                id: 'texas-independence-day',
                name: 'Texas Independence Day',
                type: 'fixed',
                rule: { month: 3, day: 2 },
                regions: ['TX'],
            },
            {
                id: 'juneteenth',
                name: 'Juneteenth',
                type: 'fixed',
                rule: { month: 6, day: 19 },
                regions: ['TX'],
            },
            {
                id: 'lyndon-b-johnson-day',
                name: 'Lyndon B. Johnson Day',
                type: 'fixed',
                rule: { month: 8, day: 27 },
                regions: ['TX'],
            },
        ],
        california: [
            {
                id: 'cesar-chavez-day',
                name: 'Cesar Chavez Day',
                type: 'fixed',
                rule: { month: 3, day: 31 },
                regions: ['CA'],
            },
        ],
        hawaii: [
            {
                id: 'prince-kuhio-day',
                name: 'Prince Kuhio Day',
                type: 'fixed',
                rule: { month: 3, day: 26 },
                regions: ['HI'],
            },
            {
                id: 'kamehameha-day',
                name: 'Kamehameha Day',
                type: 'fixed',
                rule: { month: 6, day: 11 },
                regions: ['HI'],
            },
            {
                id: 'statehood-day',
                name: 'Statehood Day',
                type: 'nth-weekday',
                rule: { month: 8, weekday: 5, nth: 3 },
                regions: ['HI'],
            },
        ],
        massachusetts: [
            {
                id: 'patriots-day',
                name: "Patriots' Day",
                type: 'nth-weekday',
                rule: { month: 4, weekday: 1, nth: 3 },
                regions: ['MA'],
            },
        ],
        maine: [
            {
                id: 'patriots-day',
                name: "Patriots' Day",
                type: 'nth-weekday',
                rule: { month: 4, weekday: 1, nth: 3 },
                regions: ['ME'],
            },
        ],
    };
    const federalHolidays$1 = holidays$9.filter((h) => [
        'new-years-day',
        'martin-luther-king-day',
        'presidents-day',
        'memorial-day',
        'juneteenth',
        'independence-day',
        'labor-day',
        'columbus-day',
        'veterans-day',
        'thanksgiving',
        'christmas-day',
    ].includes(h.id || ''));
    const allHolidays$9 = [...holidays$9, ...Object.values(stateHolidays$1).flat()];

    const locale$9 = {
        name: 'English (United States)',
        code: 'en-US',
        months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        formats: {
            LT: 'h:mm A',
            LTS: 'h:mm:ss A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A',
        },
        ordinal: (n) => {
            if (n >= 11 && n <= 13)
                return `${n}th`;
            switch (n % 10) {
                case 1:
                    return `${n}st`;
                case 2:
                    return `${n}nd`;
                case 3:
                    return `${n}rd`;
                default:
                    return `${n}th`;
            }
        },
        meridiem: (hour, _minute, isLower) => {
            const suffix = hour < 12 ? 'AM' : 'PM';
            return isLower ? suffix.toLowerCase() : suffix;
        },
    };
    var index$9 = {
        name: 'locale-en-US',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        locale: locale$9,
        install(kairos, _utils) {
            localeManager.register('en-US', {
                ...locale$9,
                holidays: holidays$9,
                federalHolidays: federalHolidays$1,
                stateHolidays: stateHolidays$1,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['en-US'] = locale$9;
            kairos.extend({
                getUSHolidays(state) {
                    if (state && typeof state === 'string') {
                        const stateLower = state.toLowerCase();
                        const stateHols = stateHolidays$1[stateLower];
                        if (stateHols) {
                            return [...federalHolidays$1, ...stateHols];
                        }
                    }
                    return holidays$9;
                },
                getFederalHolidays() {
                    return federalHolidays$1;
                },
                getStateHolidays(state) {
                    if (!state || typeof state !== 'string') {
                        return [];
                    }
                    return stateHolidays$1[state.toLowerCase()] || [];
                },
                getAllUSHolidays() {
                    return allHolidays$9;
                },
            });
            kairos.addStatic?.({
                locale(name) {
                    if (name === undefined) {
                        return localeManager.getCurrentLocale();
                    }
                    if (localeManager.setLocale(name)) {
                        kairos.currentLocale = name;
                        return kairos;
                    }
                    throw new Error(`Locale '${name}' not found`);
                },
                getAvailableLocales() {
                    return Object.keys(kairos.locales || {});
                },
            });
            kairos.currentLocale = 'en-US';
        },
    };

    const holidays$8 = [
        {
            id: 'new-years-day',
            name: 'Yılbaşı',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            id: 'national-sovereignty-day',
            name: 'Ulusal Egemenlik ve Çocuk Bayramı',
            type: 'fixed',
            rule: { month: 4, day: 23 },
        },
        {
            id: 'labor-day',
            name: 'Emek ve Dayanışma Günü',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            id: 'ataturk-commemoration-day',
            name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
            type: 'fixed',
            rule: { month: 5, day: 19 },
        },
        {
            id: 'democracy-day',
            name: 'Demokrasi ve Milli Birlik Günü',
            type: 'fixed',
            rule: { month: 7, day: 15 },
        },
        {
            id: 'victory-day',
            name: 'Zafer Bayramı',
            type: 'fixed',
            rule: { month: 8, day: 30 },
        },
        {
            id: 'republic-day',
            name: 'Cumhuriyet Bayramı',
            type: 'fixed',
            rule: { month: 10, day: 29 },
        },
        {
            id: 'ramadan-feast',
            name: 'Ramazan Bayramı',
            type: 'custom',
            rule: {
                calculate: (year) => {
                    const dates = {
                        2024: { month: 4, day: 10 },
                        2025: { month: 3, day: 30 },
                        2023: { month: 4, day: 21 },
                    };
                    const dateInfo = dates[year] || { month: 4, day: 15 };
                    const startDate = new Date(year, dateInfo.month - 1, dateInfo.day);
                    return [
                        startDate,
                        new Date(year, dateInfo.month - 1, dateInfo.day + 1),
                        new Date(year, dateInfo.month - 1, dateInfo.day + 2),
                    ];
                },
            },
            duration: 3,
        },
        {
            id: 'sacrifice-feast',
            name: 'Kurban Bayramı',
            type: 'custom',
            rule: {
                calculate: (year) => {
                    const dates = {
                        2024: { month: 6, day: 16 },
                        2025: { month: 6, day: 6 },
                        2023: { month: 6, day: 28 },
                    };
                    const dateInfo = dates[year] || { month: 6, day: 20 };
                    const startDate = new Date(year, dateInfo.month - 1, dateInfo.day);
                    return [
                        startDate,
                        new Date(year, dateInfo.month - 1, dateInfo.day + 1),
                        new Date(year, dateInfo.month - 1, dateInfo.day + 2),
                        new Date(year, dateInfo.month - 1, dateInfo.day + 3),
                    ];
                },
            },
            duration: 4,
        },
        {
            id: 'mawlid',
            name: 'Mevlid Kandili',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 3,
                day: 12,
            },
        },
        {
            id: 'regaib-night',
            name: 'Regaib Kandili',
            type: 'custom',
            rule: {
                calculate: (year) => {
                    const rajabStart = new Date(year, 1, 15);
                    const current = new Date(rajabStart);
                    while (current.getDay() !== 4) {
                        current.setDate(current.getDate() + 1);
                    }
                    return current;
                },
            },
        },
        {
            id: 'miraj-night',
            name: 'Mirac Kandili',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 7,
                day: 27,
            },
        },
        {
            id: 'laylat-al-baraat',
            name: 'Berat Kandili',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 8,
                day: 15,
            },
        },
        {
            id: 'laylat-al-qadr',
            name: 'Kadir Gecesi',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 9,
                day: 27,
            },
        },
        {
            id: 'arafat-day',
            name: 'Arefe Günü',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 12,
                day: 9,
            },
        },
    ];
    const observances$7 = [
        {
            id: 'ashura',
            name: 'Aşure Günü',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 1,
                day: 10,
            },
        },
        {
            id: 'isra-and-miraj',
            name: 'İsra ve Mirac',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 7,
                day: 27,
            },
        },
        {
            id: 'shab-e-barat',
            name: 'Berat Kandili',
            type: 'lunar',
            rule: {
                calendar: 'islamic',
                month: 8,
                day: 15,
            },
        },
    ];
    const historicalHolidays$2 = [
        {
            id: 'conquest-of-istanbul',
            name: "İstanbul'un Fethi",
            type: 'fixed',
            rule: { month: 5, day: 29 },
            active: false,
        },
        {
            id: 'gallipoli-victory',
            name: 'Çanakkale Zaferi',
            type: 'fixed',
            rule: { month: 3, day: 18 },
            active: false,
        },
    ];
    const allHolidays$8 = [...holidays$8, ...observances$7, ...historicalHolidays$2];
    const publicHolidays$1 = holidays$8.filter((h) => [
        'new-years-day',
        'national-sovereignty-day',
        'labor-day',
        'ataturk-commemoration-day',
        'democracy-day',
        'victory-day',
        'republic-day',
        'ramadan-feast',
        'sacrifice-feast',
    ].includes(h.id || ''));

    const locale$8 = {
        name: 'Türkçe (Türkiye)',
        code: 'tr-TR',
        months: [
            'Ocak',
            'Şubat',
            'Mart',
            'Nisan',
            'Mayıs',
            'Haziran',
            'Temmuz',
            'Ağustos',
            'Eylül',
            'Ekim',
            'Kasım',
            'Aralık',
        ],
        monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        weekdays: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        weekdaysShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
        weekdaysMin: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd, D MMMM YYYY HH:mm',
        },
        ordinal: (n) => {
            if (n === 1)
                return `${n}'inci`;
            if (n === 2)
                return `${n}'nci`;
            if (n === 3)
                return `${n}'üncü`;
            if (n === 4)
                return `${n}'üncü`;
            if (n === 5)
                return `${n}'inci`;
            if (n === 6)
                return `${n}'ncı`;
            if (n === 7)
                return `${n}'nci`;
            if (n === 8)
                return `${n}'inci`;
            if (n === 9)
                return `${n}'uncu`;
            if (n === 10)
                return `${n}'uncu`;
            const lastDigit = n % 10;
            const lastTwoDigits = n % 100;
            if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
                return `${n}'üncü`;
            }
            switch (lastDigit) {
                case 1:
                    return `${n}'inci`;
                case 2:
                    return `${n}'nci`;
                case 3:
                    return `${n}'üncü`;
                case 4:
                    return `${n}'üncü`;
                case 5:
                    return `${n}'inci`;
                case 6:
                    return `${n}'ncı`;
                case 7:
                    return `${n}'nci`;
                case 8:
                    return `${n}'inci`;
                case 9:
                    return `${n}'uncu`;
                case 0:
                    return `${n}'uncu`;
                default:
                    return `${n}'üncü`;
            }
        },
        meridiem: (_hour, _minute, _isLower) => {
            return '';
        },
    };
    var index$8 = {
        name: 'locale-tr-TR',
        version: '1.0.0',
        size: 1536,
        dependencies: ['holiday-engine'],
        locale: locale$8,
        install(kairos, _utils) {
            localeManager.register('tr-TR', {
                ...locale$8,
                holidays: holidays$8,
                publicHolidays: publicHolidays$1,
                observances: observances$7,
                historicalHolidays: historicalHolidays$2,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['tr-TR'] = locale$8;
            kairos.extend({
                getTurkishHolidays(type) {
                    switch (type) {
                        case 'public':
                            return publicHolidays$1;
                        case 'religious':
                            return holidays$8.filter((h) => h.type === 'lunar' || h.type === 'custom');
                        case 'historical':
                            return historicalHolidays$2;
                        case 'all':
                            return allHolidays$8;
                        default:
                            return holidays$8;
                    }
                },
                getPublicHolidays() {
                    return publicHolidays$1;
                },
                getReligiousHolidays() {
                    return holidays$8.filter((h) => h.type === 'lunar' || h.type === 'custom');
                },
                getObservances() {
                    return observances$7;
                },
                isReligiousHoliday() {
                    const holidayInfo = this.getHolidayInfo();
                    return holidayInfo ? holidayInfo.type === 'lunar' || holidayInfo.type === 'custom' : false;
                },
                isPublicHoliday() {
                    const holidayInfo = this.getHolidayInfo(publicHolidays$1);
                    return holidayInfo !== null;
                },
                formatTurkish(template) {
                    const turkishTemplate = template || 'D MMMM YYYY, dddd';
                    return this.format(turkishTemplate);
                },
            });
            kairos.addStatic?.({
                getRamazanBayrami(year) {
                    const ramadanFeast = holidays$8.find((h) => h.id === 'ramadan-feast');
                    if (ramadanFeast) {
                        const dates = kairos.holidayEngine.calculate(ramadanFeast, year);
                        return dates.map((date) => kairos(date));
                    }
                    return [];
                },
                getKurbanBayrami(year) {
                    const sacrificeFeast = holidays$8.find((h) => h.id === 'sacrifice-feast');
                    if (sacrificeFeast) {
                        const dates = kairos.holidayEngine.calculate(sacrificeFeast, year);
                        return dates.map((date) => kairos(date));
                    }
                    return [];
                },
                getKandilGecesi(year) {
                    const kandilNights = holidays$8.filter((h) => h.name.includes('Kandil') || h.name.includes('Kadir'));
                    const result = [];
                    for (const kandil of kandilNights) {
                        const dates = kairos.holidayEngine.calculate(kandil, year);
                        result.push(...dates.map((date) => ({
                            date: kairos(date),
                            name: kandil.name,
                        })));
                    }
                    return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
                },
            });
        },
    };

    const holidays$7 = [
        {
            id: 'new-years-day',
            name: 'Neujahr',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            id: 'labor-day',
            name: 'Tag der Arbeit',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            id: 'german-unity-day',
            name: 'Tag der Deutschen Einheit',
            type: 'fixed',
            rule: { month: 10, day: 3 },
        },
        {
            id: 'christmas-day',
            name: '1. Weihnachtstag',
            type: 'fixed',
            rule: { month: 12, day: 25 },
        },
        {
            id: 'boxing-day',
            name: '2. Weihnachtstag',
            type: 'fixed',
            rule: { month: 12, day: 26 },
        },
        {
            id: 'good-friday',
            name: 'Karfreitag',
            type: 'easter-based',
            rule: { offset: -2 },
        },
        {
            id: 'easter-sunday',
            name: 'Ostersonntag',
            type: 'easter-based',
            rule: { offset: 0 },
        },
        {
            id: 'easter-monday',
            name: 'Ostermontag',
            type: 'easter-based',
            rule: { offset: 1 },
        },
        {
            id: 'ascension-day',
            name: 'Christi Himmelfahrt',
            type: 'easter-based',
            rule: { offset: 39 },
        },
        {
            id: 'whit-sunday',
            name: 'Pfingstsonntag',
            type: 'easter-based',
            rule: { offset: 49 },
        },
        {
            id: 'whit-monday',
            name: 'Pfingstmontag',
            type: 'easter-based',
            rule: { offset: 50 },
        },
    ];
    const stateHolidays = {
        'baden-württemberg': [
            {
                id: 'epiphany',
                name: 'Heilige Drei Könige',
                type: 'fixed',
                rule: { month: 1, day: 6 },
                regions: ['BW'],
            },
            {
                id: 'corpus-christi',
                name: 'Fronleichnam',
                type: 'easter-based',
                rule: { offset: 60 },
                regions: ['BW'],
            },
            {
                id: 'all-saints-day',
                name: 'Allerheiligen',
                type: 'fixed',
                rule: { month: 11, day: 1 },
                regions: ['BW'],
            },
        ],
        bavaria: [
            {
                id: 'epiphany',
                name: 'Heilige Drei Könige',
                type: 'fixed',
                rule: { month: 1, day: 6 },
                regions: ['BY'],
            },
            {
                id: 'corpus-christi',
                name: 'Fronleichnam',
                type: 'easter-based',
                rule: { offset: 60 },
                regions: ['BY'],
            },
            {
                id: 'assumption-day',
                name: 'Mariä Himmelfahrt',
                type: 'fixed',
                rule: { month: 8, day: 15 },
                regions: ['BY'],
            },
            {
                id: 'all-saints-day',
                name: 'Allerheiligen',
                type: 'fixed',
                rule: { month: 11, day: 1 },
                regions: ['BY'],
            },
        ],
        berlin: [
            {
                id: 'womens-day',
                name: 'Internationaler Frauentag',
                type: 'fixed',
                rule: { month: 3, day: 8 },
                regions: ['BE'],
            },
        ],
        brandenburg: [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['BB'],
            },
        ],
        bremen: [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['HB'],
            },
        ],
        hamburg: [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['HH'],
            },
        ],
        hesse: [
            {
                id: 'corpus-christi',
                name: 'Fronleichnam',
                type: 'easter-based',
                rule: { offset: 60 },
                regions: ['HE'],
            },
        ],
        'lower-saxony': [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['NI'],
            },
        ],
        'mecklenburg-vorpommern': [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['MV'],
            },
        ],
        'north-rhine-westphalia': [
            {
                id: 'corpus-christi',
                name: 'Fronleichnam',
                type: 'easter-based',
                rule: { offset: 60 },
                regions: ['NW'],
            },
            {
                id: 'all-saints-day',
                name: 'Allerheiligen',
                type: 'fixed',
                rule: { month: 11, day: 1 },
                regions: ['NW'],
            },
        ],
        'rhineland-palatinate': [
            {
                id: 'corpus-christi',
                name: 'Fronleichnam',
                type: 'easter-based',
                rule: { offset: 60 },
                regions: ['RP'],
            },
            {
                id: 'all-saints-day',
                name: 'Allerheiligen',
                type: 'fixed',
                rule: { month: 11, day: 1 },
                regions: ['RP'],
            },
        ],
        saarland: [
            {
                id: 'corpus-christi',
                name: 'Fronleichnam',
                type: 'easter-based',
                rule: { offset: 60 },
                regions: ['SL'],
            },
            {
                id: 'assumption-day',
                name: 'Mariä Himmelfahrt',
                type: 'fixed',
                rule: { month: 8, day: 15 },
                regions: ['SL'],
            },
            {
                id: 'all-saints-day',
                name: 'Allerheiligen',
                type: 'fixed',
                rule: { month: 11, day: 1 },
                regions: ['SL'],
            },
        ],
        saxony: [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['SN'],
            },
            {
                id: 'repentance-day',
                name: 'Buß- und Bettag',
                type: 'custom',
                rule: {
                    calculate: (year) => {
                        const nov23 = new Date(year, 10, 23);
                        const daysBack = (nov23.getDay() + 4) % 7;
                        const repentanceDay = new Date(year, 10, 23 - daysBack);
                        return repentanceDay;
                    },
                },
                regions: ['SN'],
            },
        ],
        'saxony-anhalt': [
            {
                id: 'epiphany',
                name: 'Heilige Drei Könige',
                type: 'fixed',
                rule: { month: 1, day: 6 },
                regions: ['ST'],
            },
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['ST'],
            },
        ],
        'schleswig-holstein': [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['SH'],
            },
        ],
        thuringia: [
            {
                id: 'reformation-day',
                name: 'Reformationstag',
                type: 'fixed',
                rule: { month: 10, day: 31 },
                regions: ['TH'],
            },
        ],
    };
    const federalHolidays = holidays$7;
    const allHolidays$7 = [...holidays$7, ...Object.values(stateHolidays).flat()];
    const historicalHolidays$1 = [
        {
            id: 'day-of-german-unity-old',
            name: 'Tag der deutschen Einheit (alt)',
            type: 'fixed',
            rule: { month: 6, day: 17 },
            active: false,
        },
        {
            id: 'reformation-day-2017',
            name: 'Reformationstag 2017',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            active: false,
        },
    ];

    const locale$7 = {
        name: 'Deutsch (Deutschland)',
        code: 'de-DE',
        months: [
            'Januar',
            'Februar',
            'März',
            'April',
            'Mai',
            'Juni',
            'Juli',
            'August',
            'September',
            'Oktober',
            'November',
            'Dezember',
        ],
        monthsShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
        weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        weekdaysMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D. MMMM YYYY',
            LLL: 'D. MMMM YYYY HH:mm',
            LLLL: 'dddd, D. MMMM YYYY HH:mm',
        },
        ordinal: (n) => {
            return `${n}.`;
        },
        meridiem: (_hour, _minute, _isLower) => {
            return '';
        },
    };
    var index$7 = {
        name: 'locale-de-DE',
        version: '1.0.0',
        size: 2048,
        dependencies: ['holiday-engine'],
        locale: locale$7,
        install(kairos, _utils) {
            localeManager.register('de-DE', {
                ...locale$7,
                holidays: holidays$7,
                federalHolidays,
                stateHolidays: stateHolidays,
                historicalHolidays: historicalHolidays$1,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['de-DE'] = locale$7;
            kairos.extend({
                getGermanHolidays(state) {
                    if (state && typeof state === 'string') {
                        const stateLower = state.toLowerCase();
                        const stateHols = stateHolidays[stateLower];
                        if (stateHols) {
                            return [...federalHolidays, ...stateHols];
                        }
                    }
                    return holidays$7;
                },
                getFederalHolidays() {
                    return federalHolidays;
                },
                getStateHolidays(state) {
                    if (!state || typeof state !== 'string') {
                        return [];
                    }
                    return stateHolidays[state.toLowerCase()] || [];
                },
                getAllHolidays() {
                    return allHolidays$7;
                },
                getHistoricalHolidays() {
                    return historicalHolidays$1;
                },
                isEasterHoliday() {
                    const holidayInfo = this.getHolidayInfo();
                    return holidayInfo ? holidayInfo.type === 'easter-based' : false;
                },
                isCatholicHoliday() {
                    const holidayInfo = this.getHolidayInfo();
                    const catholicHolidays = ['epiphany', 'corpus-christi', 'assumption-day', 'all-saints-day'];
                    return holidayInfo ? catholicHolidays.includes(holidayInfo.id) : false;
                },
                isProtestantHoliday() {
                    const holidayInfo = this.getHolidayInfo();
                    const protestantHolidays = ['reformation-day', 'repentance-day'];
                    return holidayInfo ? protestantHolidays.includes(holidayInfo.id) : false;
                },
                formatGerman(template) {
                    const germanTemplate = template || 'dddd, D. MMMM YYYY';
                    return this.format(germanTemplate);
                },
            });
            kairos.addStatic?.({
                getEasterHolidays(year) {
                    const easterHolidays = holidays$7.filter((h) => h.type === 'easter-based');
                    const result = [];
                    for (const holiday of easterHolidays) {
                        const dates = kairos.holidayEngine.calculate(holiday, year);
                        result.push(...dates.map((date) => ({
                            date: kairos(date),
                            name: holiday.name,
                            id: holiday.id,
                        })));
                    }
                    return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
                },
                getBusBettag(year) {
                    const repentanceDay = stateHolidays.saxony.find((h) => h.id === 'repentance-day');
                    if (repentanceDay) {
                        const dates = kairos.holidayEngine.calculate(repentanceDay, year);
                        return dates.length > 0 ? kairos(dates[0]) : null;
                    }
                    return null;
                },
                getStateHolidaysForYear(state, year) {
                    if (!state || typeof state !== 'string') {
                        return [];
                    }
                    const stateHols = stateHolidays[state.toLowerCase()];
                    if (!stateHols)
                        return [];
                    const result = [];
                    for (const holiday of stateHols) {
                        const dates = kairos.holidayEngine.calculate(holiday, year);
                        result.push(...dates.map((date) => ({
                            date: kairos(date),
                            name: holiday.name,
                            id: holiday.id,
                        })));
                    }
                    return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
                },
                getAvailableStates() {
                    return Object.keys(stateHolidays);
                },
            });
        },
    };

    const holidays$6 = [
        {
            id: 'new-years-day',
            name: '元日',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            id: 'coming-of-age-day',
            name: '成人の日',
            type: 'nth-weekday',
            rule: { month: 1, weekday: 1, nth: 2 },
        },
        {
            id: 'national-foundation-day',
            name: '建国記念の日',
            type: 'fixed',
            rule: { month: 2, day: 11 },
        },
        {
            id: 'emperors-birthday',
            name: '天皇誕生日',
            type: 'fixed',
            rule: { month: 2, day: 23 },
        },
        {
            id: 'vernal-equinox-day',
            name: '春分の日',
            type: 'custom',
            rule: {
                calculate: (year) => {
                    return CustomCalculatorUtils.calculateVernalEquinox(year);
                },
            },
        },
        {
            id: 'showa-day',
            name: '昭和の日',
            type: 'fixed',
            rule: { month: 4, day: 29 },
        },
        {
            id: 'constitution-day',
            name: '憲法記念日',
            type: 'fixed',
            rule: { month: 5, day: 3 },
        },
        {
            id: 'greenery-day',
            name: 'みどりの日',
            type: 'fixed',
            rule: { month: 5, day: 4 },
        },
        {
            id: 'childrens-day',
            name: 'こどもの日',
            type: 'fixed',
            rule: { month: 5, day: 5 },
        },
        {
            id: 'marine-day',
            name: '海の日',
            type: 'nth-weekday',
            rule: { month: 7, weekday: 1, nth: 3 },
        },
        {
            id: 'mountain-day',
            name: '山の日',
            type: 'fixed',
            rule: { month: 8, day: 11 },
        },
        {
            id: 'respect-for-aged-day',
            name: '敬老の日',
            type: 'nth-weekday',
            rule: { month: 9, weekday: 1, nth: 3 },
        },
        {
            id: 'autumnal-equinox-day',
            name: '秋分の日',
            type: 'custom',
            rule: {
                calculate: (year) => {
                    return CustomCalculatorUtils.calculateAutumnalEquinox(year);
                },
            },
        },
        {
            id: 'sports-day',
            name: 'スポーツの日',
            type: 'nth-weekday',
            rule: { month: 10, weekday: 1, nth: 2 },
        },
        {
            id: 'culture-day',
            name: '文化の日',
            type: 'fixed',
            rule: { month: 11, day: 3 },
        },
        {
            id: 'labor-thanksgiving-day',
            name: '勤労感謝の日',
            type: 'fixed',
            rule: { month: 11, day: 23 },
        },
        {
            id: 'golden-week-substitute',
            name: 'ゴールデンウィーク振替休日',
            type: 'custom',
            rule: {
                calculate: (year) => {
                    return CustomCalculatorUtils.calculateGoldenWeekSubstitutes(year);
                },
            },
        },
    ];
    const historicalHolidays = [
        {
            id: 'emperors-birthday-showa',
            name: '天皇誕生日（昭和）',
            type: 'fixed',
            rule: { month: 4, day: 29 },
            active: false,
        },
        {
            id: 'emperors-birthday-heisei',
            name: '天皇誕生日（平成）',
            type: 'fixed',
            rule: { month: 12, day: 23 },
            active: false,
        },
        {
            id: 'health-sports-day',
            name: '体育の日',
            type: 'nth-weekday',
            rule: { month: 10, weekday: 1, nth: 2 },
            active: false,
        },
        {
            id: 'national-holiday',
            name: '国民の休日',
            type: 'fixed',
            rule: { month: 5, day: 4 },
            active: false,
        },
    ];
    const observances$6 = [
        {
            id: 'setsubun',
            name: '節分',
            type: 'fixed',
            rule: { month: 2, day: 3 },
        },
        {
            id: 'hinamatsuri',
            name: 'ひなまつり',
            type: 'fixed',
            rule: { month: 3, day: 3 },
        },
        {
            id: 'cherry-blossom-day',
            name: '桜の日',
            type: 'fixed',
            rule: { month: 3, day: 27 },
        },
        {
            id: 'mothers-day',
            name: '母の日',
            type: 'nth-weekday',
            rule: { month: 5, weekday: 0, nth: 2 },
        },
        {
            id: 'fathers-day',
            name: '父の日',
            type: 'nth-weekday',
            rule: { month: 6, weekday: 0, nth: 3 },
        },
        {
            id: 'tanabata',
            name: '七夕',
            type: 'fixed',
            rule: { month: 7, day: 7 },
        },
        {
            id: 'obon',
            name: 'お盆',
            type: 'fixed',
            rule: { month: 8, day: 15 },
            duration: 3,
        },
        {
            id: 'respect-for-elderly-day',
            name: '敬老の日',
            type: 'nth-weekday',
            rule: { month: 9, weekday: 1, nth: 3 },
        },
        {
            id: 'shichi-go-san',
            name: '七五三',
            type: 'fixed',
            rule: { month: 11, day: 15 },
        },
        {
            id: 'christmas',
            name: 'クリスマス',
            type: 'fixed',
            rule: { month: 12, day: 25 },
        },
        {
            id: 'new-years-eve',
            name: '大晦日',
            type: 'fixed',
            rule: { month: 12, day: 31 },
        },
    ];
    const goldenWeekHolidays = holidays$6.filter((h) => [
        'showa-day',
        'constitution-day',
        'greenery-day',
        'childrens-day',
        'golden-week-substitute',
    ].includes(h.id || ''));
    const publicHolidays = holidays$6.filter((h) => h.id !== 'golden-week-substitute');
    const allHolidays$6 = [...holidays$6, ...observances$6, ...historicalHolidays];
    const reiwaHolidays = holidays$6.filter((h) => h.id !== 'emperors-birthday-showa' && h.id !== 'emperors-birthday-heisei');
    const heiseiHolidays = [
        ...holidays$6.filter((h) => h.id !== 'emperors-birthday'),
        ...historicalHolidays.filter((h) => h.id === 'emperors-birthday-heisei'),
    ];
    const olympics2020Holidays = [
        {
            id: 'marine-day-2020',
            name: '海の日（2020年特別）',
            type: 'fixed',
            rule: { month: 7, day: 23 },
            active: false,
        },
        {
            id: 'sports-day-2020',
            name: 'スポーツの日（2020年特別）',
            type: 'fixed',
            rule: { month: 7, day: 24 },
            active: false,
        },
        {
            id: 'mountain-day-2020',
            name: '山の日（2020年特別）',
            type: 'fixed',
            rule: { month: 8, day: 10 },
            active: false,
        },
    ];

    const locale$6 = {
        name: '日本語 (日本)',
        code: 'ja-JP',
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        monthsShort: [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
        ],
        weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
        weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
        weekdaysMin: ['日', '月', '火', '水', '木', '金', '土'],
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'YYYY/MM/DD',
            LL: 'YYYY年M月D日',
            LLL: 'YYYY年M月D日 HH:mm',
            LLLL: 'YYYY年M月D日 dddd HH:mm',
        },
        ordinal: (n) => {
            return `${n}日`;
        },
        meridiem: (hour, _minute, _isLower) => {
            const suffix = hour < 12 ? '午前' : '午後';
            return suffix;
        },
    };
    var index$6 = {
        name: 'locale-ja-JP',
        version: '1.0.0',
        size: 2048,
        dependencies: ['holiday-engine', 'holiday-custom-calculator'],
        locale: locale$6,
        install(kairos, _utils) {
            localeManager.register('ja-JP', {
                ...locale$6,
                holidays: holidays$6,
                publicHolidays,
                observances: observances$6,
                historicalHolidays,
                goldenWeekHolidays,
                reiwaHolidays,
                heiseiHolidays,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['ja-JP'] = locale$6;
            kairos.extend({
                getJapaneseHolidays(type) {
                    switch (type) {
                        case 'public':
                            return publicHolidays;
                        case 'observances':
                            return observances$6;
                        case 'historical':
                            return historicalHolidays;
                        case 'golden-week':
                            return goldenWeekHolidays;
                        case 'reiwa':
                            return reiwaHolidays;
                        case 'heisei':
                            return heiseiHolidays;
                        case 'olympics2020':
                            return olympics2020Holidays;
                        case 'all':
                            return allHolidays$6;
                        default:
                            return holidays$6;
                    }
                },
                getPublicHolidays() {
                    return publicHolidays;
                },
                getObservances() {
                    return observances$6;
                },
                getGoldenWeekHolidays() {
                    return goldenWeekHolidays;
                },
                isGoldenWeekHoliday() {
                    const holidayInfo = this.getHolidayInfo(goldenWeekHolidays);
                    return holidayInfo !== null;
                },
                isPublicHoliday() {
                    const holidayInfo = this.getHolidayInfo(publicHolidays);
                    return holidayInfo !== null;
                },
                isObservance() {
                    const holidayInfo = this.getHolidayInfo(observances$6);
                    return holidayInfo !== null;
                },
                isEquinoxHoliday() {
                    const holidayInfo = this.getHolidayInfo();
                    return holidayInfo
                        ? ['vernal-equinox-day', 'autumnal-equinox-day'].includes(holidayInfo.id)
                        : false;
                },
                formatJapanese(template) {
                    const japaneseTemplate = template || 'YYYY年M月D日（ddd）';
                    return this.format(japaneseTemplate);
                },
                getJapaneseEra() {
                    const year = this.year();
                    if (year >= 2019)
                        return '令和';
                    if (year >= 1989)
                        return '平成';
                    if (year >= 1926)
                        return '昭和';
                    if (year >= 1912)
                        return '大正';
                    if (year >= 1868)
                        return '明治';
                    return '不明';
                },
                getJapaneseEraYear() {
                    const year = this.year();
                    if (year >= 2019)
                        return year - 2018;
                    if (year >= 1989)
                        return year - 1988;
                    if (year >= 1926)
                        return year - 1925;
                    if (year >= 1912)
                        return year - 1911;
                    if (year >= 1868)
                        return year - 1867;
                    return year;
                },
                formatWithEra() {
                    const era = this.getJapaneseEra();
                    const eraYear = this.getJapaneseEraYear();
                    const month = this.month();
                    const day = this.date();
                    return `${era}${eraYear}年${month}月${day}日`;
                },
            });
            kairos.addStatic?.({
                getGoldenWeek(year) {
                    const result = [];
                    for (const holiday of goldenWeekHolidays) {
                        const dates = kairos.holidayEngine.calculate(holiday, year);
                        result.push(...dates.map((date) => ({
                            date: kairos(date),
                            name: holiday.name,
                            id: holiday.id,
                        })));
                    }
                    return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
                },
                getEquinoxDays(year) {
                    const equinoxHolidays = holidays$6.filter((h) => ['vernal-equinox-day', 'autumnal-equinox-day'].includes(h.id || ''));
                    const result = [];
                    for (const holiday of equinoxHolidays) {
                        const dates = kairos.holidayEngine.calculate(holiday, year);
                        result.push(...dates.map((date) => ({
                            date: kairos(date),
                            name: holiday.name,
                            id: holiday.id,
                        })));
                    }
                    return result.sort((a, b) => a.date.valueOf() - b.date.valueOf());
                },
                getObon(year) {
                    const obon = observances$6.find((h) => h.id === 'obon');
                    if (obon) {
                        const dates = kairos.holidayEngine.calculate(obon, year);
                        return dates.map((date) => kairos(date));
                    }
                    return [];
                },
                isReiwaEra(year) {
                    return year >= 2019;
                },
                isHeiseiEra(year) {
                    return year >= 1989 && year <= 2019;
                },
                isShowaEra(year) {
                    return year >= 1926 && year <= 1989;
                },
                toJapaneseEra(year) {
                    if (year >= 2019)
                        return { era: '令和', year: year - 2018 };
                    if (year >= 1989)
                        return { era: '平成', year: year - 1988 };
                    if (year >= 1926)
                        return { era: '昭和', year: year - 1925 };
                    if (year >= 1912)
                        return { era: '大正', year: year - 1911 };
                    if (year >= 1868)
                        return { era: '明治', year: year - 1867 };
                    return { era: '不明', year: year };
                },
                getHolidaysForEra(era) {
                    switch (era) {
                        case 'reiwa':
                            return reiwaHolidays;
                        case 'heisei':
                            return heiseiHolidays;
                        case 'showa':
                            return holidays$6;
                        default:
                            return holidays$6;
                    }
                },
            });
        },
    };

    const holidays$5 = [
        {
            name: "Jour de l'An",
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            name: 'Fête du Travail',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            name: 'Victoire 1945',
            type: 'fixed',
            rule: { month: 5, day: 8 },
        },
        {
            name: 'Fête Nationale',
            type: 'fixed',
            rule: { month: 7, day: 14 },
        },
        {
            name: 'Assomption',
            type: 'fixed',
            rule: { month: 8, day: 15 },
        },
        {
            name: 'Toussaint',
            type: 'fixed',
            rule: { month: 11, day: 1 },
        },
        {
            name: 'Armistice 1918',
            type: 'fixed',
            rule: { month: 11, day: 11 },
        },
        {
            name: 'Noël',
            type: 'fixed',
            rule: { month: 12, day: 25 },
        },
        {
            name: 'Lundi de Pâques',
            type: 'easter-based',
            rule: { offset: 1 },
        },
        {
            name: 'Ascension',
            type: 'easter-based',
            rule: { offset: 39 },
        },
        {
            name: 'Lundi de Pentecôte',
            type: 'easter-based',
            rule: { offset: 50 },
        },
        {
            name: 'Vendredi Saint',
            type: 'easter-based',
            rule: { offset: -2 },
            regions: ['Alsace', 'Moselle'],
        },
        {
            name: 'Saint-Étienne',
            type: 'fixed',
            rule: { month: 12, day: 26 },
            regions: ['Alsace', 'Moselle'],
        },
    ];
    const observances$5 = [
        {
            name: 'Saint-Valentin',
            type: 'fixed',
            rule: { month: 2, day: 14 },
        },
        {
            name: 'Fête des Mères',
            type: 'nth-weekday',
            rule: { month: 5, weekday: 0, nth: -1 },
        },
        {
            name: 'Fête des Pères',
            type: 'nth-weekday',
            rule: { month: 6, weekday: 0, nth: 3 },
        },
        {
            name: 'Fête de la Musique',
            type: 'fixed',
            rule: { month: 6, day: 21 },
        },
        {
            name: 'Halloween',
            type: 'fixed',
            rule: { month: 10, day: 31 },
        },
    ];
    const regionalHolidays$5 = {
        alsace: [
            {
                name: 'Vendredi Saint',
                type: 'easter-based',
                rule: { offset: -2 },
            },
            {
                name: 'Saint-Étienne',
                type: 'fixed',
                rule: { month: 12, day: 26 },
            },
        ],
        martinique: [
            {
                name: "Abolition de l'esclavage",
                type: 'fixed',
                rule: { month: 5, day: 22 },
            },
        ],
        guadeloupe: [
            {
                name: "Abolition de l'esclavage",
                type: 'fixed',
                rule: { month: 5, day: 27 },
            },
        ],
        guyane: [
            {
                name: "Abolition de l'esclavage",
                type: 'fixed',
                rule: { month: 6, day: 10 },
            },
        ],
        reunion: [
            {
                name: "Abolition de l'esclavage",
                type: 'fixed',
                rule: { month: 12, day: 20 },
            },
        ],
    };
    const allHolidays$5 = [...holidays$5, ...observances$5];

    const locale$5 = {
        name: 'Français (France)',
        code: 'fr-FR',
        months: [
            'janvier',
            'février',
            'mars',
            'avril',
            'mai',
            'juin',
            'juillet',
            'août',
            'septembre',
            'octobre',
            'novembre',
            'décembre',
        ],
        monthsShort: [
            'janv.',
            'févr.',
            'mars',
            'avr.',
            'mai',
            'juin',
            'juil.',
            'août',
            'sept.',
            'oct.',
            'nov.',
            'déc.',
        ],
        weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        weekdaysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
        weekdaysMin: ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'],
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        ordinal: (n) => {
            return n === 1 ? `${n}er` : `${n}e`;
        },
        meridiem: (_hour, _minute, _isLower) => {
            return '';
        },
        relativeTime: {
            future: 'dans %s',
            past: 'il y a %s',
            s: 'quelques secondes',
            ss: '%d secondes',
            m: 'une minute',
            mm: '%d minutes',
            h: 'une heure',
            hh: '%d heures',
            d: 'un jour',
            dd: '%d jours',
            M: 'un mois',
            MM: '%d mois',
            y: 'un an',
            yy: '%d ans',
        },
    };
    var index$5 = {
        name: 'locale-fr-FR',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        locale: locale$5,
        install(kairos, _utils) {
            localeManager.register('fr-FR', {
                ...locale$5,
                holidays: holidays$5,
                observances: observances$5,
                regionalHolidays: regionalHolidays$5,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['fr-FR'] = locale$5;
            kairos.extend({
                getFrenchHolidays(region) {
                    if (region && typeof region === 'string') {
                        const regionLower = region.toLowerCase();
                        const regionHols = regionalHolidays$5[regionLower];
                        if (regionHols) {
                            return [...holidays$5, ...regionHols];
                        }
                    }
                    return holidays$5;
                },
                getFrenchObservances() {
                    return observances$5;
                },
                getRegionalHolidays(region) {
                    if (!region || typeof region !== 'string') {
                        return [];
                    }
                    return regionalHolidays$5[region.toLowerCase()] || [];
                },
                getAllFrenchHolidays() {
                    return allHolidays$5;
                },
            });
        },
    };

    const holidays$4 = [
        {
            name: 'Año Nuevo',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            name: 'Epifanía del Señor',
            type: 'fixed',
            rule: { month: 1, day: 6 },
        },
        {
            name: 'Viernes Santo',
            type: 'easter-based',
            rule: { offset: -2 },
        },
        {
            name: 'Fiesta del Trabajo',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            name: 'Asunción de la Virgen',
            type: 'fixed',
            rule: { month: 8, day: 15 },
        },
        {
            name: 'Fiesta Nacional de España',
            type: 'fixed',
            rule: { month: 10, day: 12 },
        },
        {
            name: 'Todos los Santos',
            type: 'fixed',
            rule: { month: 11, day: 1 },
        },
        {
            name: 'Día de la Constitución',
            type: 'fixed',
            rule: { month: 12, day: 6 },
        },
        {
            name: 'Inmaculada Concepción',
            type: 'fixed',
            rule: { month: 12, day: 8 },
        },
        {
            name: 'Navidad',
            type: 'fixed',
            rule: { month: 12, day: 25 },
        },
        {
            name: 'Jueves Santo',
            type: 'easter-based',
            rule: { offset: -3 },
            regions: [
                'Andalucía',
                'Aragón',
                'Asturias',
                'Baleares',
                'Canarias',
                'Cantabria',
                'Castilla-La Mancha',
                'Castilla y León',
                'Extremadura',
                'Galicia',
                'Madrid',
                'Murcia',
                'Navarra',
                'País Vasco',
                'La Rioja',
            ],
        },
        {
            name: 'Lunes de Pascua',
            type: 'easter-based',
            rule: { offset: 1 },
            regions: ['Baleares', 'Cataluña', 'Comunidad Valenciana', 'Navarra', 'País Vasco'],
        },
    ];
    const regionalHolidays$4 = {
        andalucia: [
            {
                name: 'Día de Andalucía',
                type: 'fixed',
                rule: { month: 2, day: 28 },
            },
        ],
        aragon: [
            {
                name: 'San Jorge',
                type: 'fixed',
                rule: { month: 4, day: 23 },
            },
        ],
        asturias: [
            {
                name: 'Día de Asturias',
                type: 'fixed',
                rule: { month: 9, day: 8 },
            },
        ],
        baleares: [
            {
                name: 'Día de las Islas Baleares',
                type: 'fixed',
                rule: { month: 3, day: 1 },
            },
        ],
        canarias: [
            {
                name: 'Día de Canarias',
                type: 'fixed',
                rule: { month: 5, day: 30 },
            },
        ],
        cantabria: [
            {
                name: 'Día de las Instituciones de Cantabria',
                type: 'fixed',
                rule: { month: 7, day: 28 },
            },
        ],
        castillaLaMancha: [
            {
                name: 'Día de Castilla-La Mancha',
                type: 'fixed',
                rule: { month: 5, day: 31 },
            },
        ],
        castillaYLeon: [
            {
                name: 'Día de Castilla y León',
                type: 'fixed',
                rule: { month: 4, day: 23 },
            },
        ],
        cataluna: [
            {
                name: 'Sant Jordi',
                type: 'fixed',
                rule: { month: 4, day: 23 },
            },
            {
                name: 'Sant Joan',
                type: 'fixed',
                rule: { month: 6, day: 24 },
            },
            {
                name: 'Diada Nacional de Catalunya',
                type: 'fixed',
                rule: { month: 9, day: 11 },
            },
            {
                name: 'Sant Esteve',
                type: 'fixed',
                rule: { month: 12, day: 26 },
            },
        ],
        extremadura: [
            {
                name: 'Día de Extremadura',
                type: 'fixed',
                rule: { month: 9, day: 8 },
            },
        ],
        galicia: [
            {
                name: 'Día Nacional de Galicia',
                type: 'fixed',
                rule: { month: 7, day: 25 },
            },
        ],
        madrid: [
            {
                name: 'Día de la Comunidad de Madrid',
                type: 'fixed',
                rule: { month: 5, day: 2 },
            },
        ],
        murcia: [
            {
                name: 'Día de la Región de Murcia',
                type: 'fixed',
                rule: { month: 6, day: 9 },
            },
        ],
        navarra: [
            {
                name: 'San Fermín',
                type: 'fixed',
                rule: { month: 7, day: 7 },
            },
        ],
        paisVasco: [
            {
                name: 'Lunes de Pascua',
                type: 'easter-based',
                rule: { offset: 1 },
            },
        ],
        laRioja: [
            {
                name: 'Día de La Rioja',
                type: 'fixed',
                rule: { month: 6, day: 9 },
            },
        ],
        valencia: [
            {
                name: 'San Vicente Mártir',
                type: 'fixed',
                rule: { month: 1, day: 22 },
            },
            {
                name: 'Fallas',
                type: 'fixed',
                rule: { month: 3, day: 19 },
            },
            {
                name: 'San Juan',
                type: 'fixed',
                rule: { month: 6, day: 24 },
            },
            {
                name: 'Día de la Comunidad Valenciana',
                type: 'fixed',
                rule: { month: 10, day: 9 },
            },
        ],
    };
    const observances$4 = [
        {
            name: 'San Valentín',
            type: 'fixed',
            rule: { month: 2, day: 14 },
        },
        {
            name: 'Día del Padre',
            type: 'fixed',
            rule: { month: 3, day: 19 },
        },
        {
            name: 'Día de la Madre',
            type: 'nth-weekday',
            rule: { month: 5, weekday: 0, nth: 1 },
        },
        {
            name: 'Nochevieja',
            type: 'fixed',
            rule: { month: 12, day: 31 },
        },
    ];
    const allHolidays$4 = [...holidays$4, ...observances$4];

    const locale$4 = {
        name: 'Español (España)',
        code: 'es-ES',
        months: [
            'enero',
            'febrero',
            'marzo',
            'abril',
            'mayo',
            'junio',
            'julio',
            'agosto',
            'septiembre',
            'octubre',
            'noviembre',
            'diciembre',
        ],
        monthsShort: [
            'ene.',
            'feb.',
            'mar.',
            'abr.',
            'may.',
            'jun.',
            'jul.',
            'ago.',
            'sep.',
            'oct.',
            'nov.',
            'dic.',
        ],
        weekdays: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        weekdaysShort: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
        weekdaysMin: ['do', 'lu', 'ma', 'mi', 'ju', 'vi', 'sá'],
        formats: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY H:mm',
            LLLL: 'dddd, D [de] MMMM [de] YYYY H:mm',
        },
        ordinal: (n) => {
            return `${n}º`;
        },
        meridiem: (hour, _minute, isLower) => {
            const m = hour < 12 ? 'de la mañana' : hour < 20 ? 'de la tarde' : 'de la noche';
            return isLower ? m : m.toUpperCase();
        },
        relativeTime: {
            future: 'en %s',
            past: 'hace %s',
            s: 'unos segundos',
            ss: '%d segundos',
            m: 'un minuto',
            mm: '%d minutos',
            h: 'una hora',
            hh: '%d horas',
            d: 'un día',
            dd: '%d días',
            M: 'un mes',
            MM: '%d meses',
            y: 'un año',
            yy: '%d años',
        },
    };
    var index$4 = {
        name: 'locale-es-ES',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        locale: locale$4,
        install(kairos, _utils) {
            localeManager.register('es-ES', {
                ...locale$4,
                holidays: holidays$4,
                observances: observances$4,
                regionalHolidays: regionalHolidays$4,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['es-ES'] = locale$4;
            kairos.extend({
                getSpanishHolidays(region) {
                    if (region && typeof region === 'string') {
                        const regionLower = region.toLowerCase().replace(/\s/g, '');
                        const regionHols = regionalHolidays$4[regionLower];
                        if (regionHols) {
                            return [...holidays$4, ...regionHols];
                        }
                    }
                    return holidays$4;
                },
                getSpanishObservances() {
                    return observances$4;
                },
                getRegionalSpanishHolidays(region) {
                    if (!region || typeof region !== 'string') {
                        return [];
                    }
                    return regionalHolidays$4[region.toLowerCase().replace(/\s/g, '')] || [];
                },
                getAllSpanishHolidays() {
                    return allHolidays$4;
                },
            });
        },
    };

    const holidays$3 = [
        {
            name: 'Capodanno',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            name: 'Epifania',
            type: 'fixed',
            rule: { month: 1, day: 6 },
        },
        {
            name: 'Festa della Liberazione',
            type: 'fixed',
            rule: { month: 4, day: 25 },
        },
        {
            name: 'Festa del Lavoro',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            name: 'Festa della Repubblica',
            type: 'fixed',
            rule: { month: 6, day: 2 },
        },
        {
            name: 'Assunzione di Maria',
            type: 'fixed',
            rule: { month: 8, day: 15 },
        },
        {
            name: 'Ognissanti',
            type: 'fixed',
            rule: { month: 11, day: 1 },
        },
        {
            name: 'Immacolata Concezione',
            type: 'fixed',
            rule: { month: 12, day: 8 },
        },
        {
            name: 'Natale',
            type: 'fixed',
            rule: { month: 12, day: 25 },
        },
        {
            name: 'Santo Stefano',
            type: 'fixed',
            rule: { month: 12, day: 26 },
        },
        {
            name: 'Pasquetta',
            type: 'easter-based',
            rule: { offset: 1 },
        },
    ];
    const regionalHolidays$3 = {
        sicilia: [
            {
                name: 'Santa Lucia',
                type: 'fixed',
                rule: { month: 12, day: 13 },
            },
        ],
        sardegna: [
            {
                name: "Sagra di Sant'Efisio",
                type: 'fixed',
                rule: { month: 5, day: 1 },
            },
        ],
        veneto: [
            {
                name: 'San Marco',
                type: 'fixed',
                rule: { month: 4, day: 25 },
            },
        ],
        toscana: [
            {
                name: 'San Giovanni Battista',
                type: 'fixed',
                rule: { month: 6, day: 24 },
            },
        ],
        lazio: [
            {
                name: 'Santi Pietro e Paolo',
                type: 'fixed',
                rule: { month: 6, day: 29 },
            },
        ],
        lombardia: [
            {
                name: "Sant'Ambrogio",
                type: 'fixed',
                rule: { month: 12, day: 7 },
            },
        ],
    };
    const observances$3 = [
        {
            name: 'San Valentino',
            type: 'fixed',
            rule: { month: 2, day: 14 },
        },
        {
            name: 'Festa della Donna',
            type: 'fixed',
            rule: { month: 3, day: 8 },
        },
        {
            name: 'Festa della Mamma',
            type: 'nth-weekday',
            rule: { month: 5, weekday: 0, nth: 2 },
        },
        {
            name: 'Festa del Papà',
            type: 'fixed',
            rule: { month: 3, day: 19 },
        },
        {
            name: 'Vigilia di Natale',
            type: 'fixed',
            rule: { month: 12, day: 24 },
        },
        {
            name: 'Capodanno',
            type: 'fixed',
            rule: { month: 12, day: 31 },
        },
    ];
    const allHolidays$3 = [...holidays$3, ...observances$3];

    const locale$3 = {
        name: 'Italiano (Italia)',
        code: 'it-IT',
        months: [
            'gennaio',
            'febbraio',
            'marzo',
            'aprile',
            'maggio',
            'giugno',
            'luglio',
            'agosto',
            'settembre',
            'ottobre',
            'novembre',
            'dicembre',
        ],
        monthsShort: [
            'gen.',
            'feb.',
            'mar.',
            'apr.',
            'mag.',
            'giu.',
            'lug.',
            'ago.',
            'set.',
            'ott.',
            'nov.',
            'dic.',
        ],
        weekdays: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
        weekdaysShort: ['dom.', 'lun.', 'mar.', 'mer.', 'gio.', 'ven.', 'sab.'],
        weekdaysMin: ['do', 'lu', 'ma', 'me', 'gi', 've', 'sa'],
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D MMMM YYYY',
            LLL: 'D MMMM YYYY HH:mm',
            LLLL: 'dddd D MMMM YYYY HH:mm',
        },
        ordinal: (n) => {
            return `${n}º`;
        },
        meridiem: (hour, _minute, isLower) => {
            const m = hour < 12 ? 'del mattino' : hour < 18 ? 'del pomeriggio' : 'della sera';
            return isLower ? m : m.toUpperCase();
        },
        relativeTime: {
            future: 'tra %s',
            past: '%s fa',
            s: 'alcuni secondi',
            ss: '%d secondi',
            m: 'un minuto',
            mm: '%d minuti',
            h: "un'ora",
            hh: '%d ore',
            d: 'un giorno',
            dd: '%d giorni',
            M: 'un mese',
            MM: '%d mesi',
            y: 'un anno',
            yy: '%d anni',
        },
    };
    var index$3 = {
        name: 'locale-it-IT',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        locale: locale$3,
        install(kairos, _utils) {
            localeManager.register('it-IT', {
                ...locale$3,
                holidays: holidays$3,
                observances: observances$3,
                regionalHolidays: regionalHolidays$3,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['it-IT'] = locale$3;
            kairos.extend({
                getItalianHolidays(region) {
                    if (region && typeof region === 'string') {
                        const regionLower = region.toLowerCase();
                        const regionHols = regionalHolidays$3[regionLower];
                        if (regionHols) {
                            return [...holidays$3, ...regionHols];
                        }
                    }
                    return holidays$3;
                },
                getItalianObservances() {
                    return observances$3;
                },
                getRegionalItalianHolidays(region) {
                    if (!region || typeof region !== 'string') {
                        return [];
                    }
                    return regionalHolidays$3[region.toLowerCase()] || [];
                },
                getAllItalianHolidays() {
                    return allHolidays$3;
                },
            });
        },
    };

    const holidays$2 = [
        {
            name: 'Confraternização Universal',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            name: 'Tiradentes',
            type: 'fixed',
            rule: { month: 4, day: 21 },
        },
        {
            name: 'Dia do Trabalhador',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            name: 'Independência do Brasil',
            type: 'fixed',
            rule: { month: 9, day: 7 },
        },
        {
            name: 'Nossa Senhora Aparecida',
            type: 'fixed',
            rule: { month: 10, day: 12 },
        },
        {
            name: 'Finados',
            type: 'fixed',
            rule: { month: 11, day: 2 },
        },
        {
            name: 'Proclamação da República',
            type: 'fixed',
            rule: { month: 11, day: 15 },
        },
        {
            name: 'Natal',
            type: 'fixed',
            rule: { month: 12, day: 25 },
        },
        {
            name: 'Carnaval',
            type: 'easter-based',
            rule: { offset: -47 },
        },
        {
            name: 'Sexta-feira Santa',
            type: 'easter-based',
            rule: { offset: -2 },
        },
        {
            name: 'Corpus Christi',
            type: 'easter-based',
            rule: { offset: 60 },
        },
    ];
    const regionalHolidays$2 = {
        acre: [
            {
                name: 'Dia da Amazônia',
                type: 'fixed',
                rule: { month: 9, day: 5 },
            },
            {
                name: 'Tratado de Petrópolis',
                type: 'fixed',
                rule: { month: 11, day: 17 },
            },
        ],
        alagoas: [
            {
                name: 'São João',
                type: 'fixed',
                rule: { month: 6, day: 24 },
            },
            {
                name: 'São Pedro',
                type: 'fixed',
                rule: { month: 6, day: 29 },
            },
        ],
        bahia: [
            {
                name: 'Independência da Bahia',
                type: 'fixed',
                rule: { month: 7, day: 2 },
            },
        ],
        ceara: [
            {
                name: 'Abolição da Escravidão no Ceará',
                type: 'fixed',
                rule: { month: 3, day: 25 },
            },
        ],
        df: [
            {
                name: 'Fundação de Brasília',
                type: 'fixed',
                rule: { month: 4, day: 21 },
            },
            {
                name: 'Dia da Consciência Negra',
                type: 'fixed',
                rule: { month: 11, day: 20 },
            },
        ],
        rj: [
            {
                name: 'Morte de Zumbi dos Palmares',
                type: 'fixed',
                rule: { month: 4, day: 23 },
            },
            {
                name: 'São Jorge',
                type: 'fixed',
                rule: { month: 4, day: 23 },
            },
        ],
        sp: [
            {
                name: 'Revolução Constitucionalista',
                type: 'fixed',
                rule: { month: 7, day: 9 },
            },
            {
                name: 'Dia da Consciência Negra',
                type: 'fixed',
                rule: { month: 11, day: 20 },
            },
        ],
    };
    const observances$2 = [
        {
            name: 'Dia dos Namorados',
            type: 'fixed',
            rule: { month: 6, day: 12 },
        },
        {
            name: 'Dia das Mães',
            type: 'nth-weekday',
            rule: { month: 5, weekday: 0, nth: 2 },
        },
        {
            name: 'Dia dos Pais',
            type: 'nth-weekday',
            rule: { month: 8, weekday: 0, nth: 2 },
        },
        {
            name: 'Dia das Crianças',
            type: 'fixed',
            rule: { month: 10, day: 12 },
        },
        {
            name: 'Dia do Professor',
            type: 'fixed',
            rule: { month: 10, day: 15 },
        },
        {
            name: 'Véspera de Natal',
            type: 'fixed',
            rule: { month: 12, day: 24 },
        },
        {
            name: 'Véspera de Ano Novo',
            type: 'fixed',
            rule: { month: 12, day: 31 },
        },
    ];
    const allHolidays$2 = [...holidays$2, ...observances$2];

    const locale$2 = {
        name: 'Português (Brasil)',
        code: 'pt-BR',
        months: [
            'janeiro',
            'fevereiro',
            'março',
            'abril',
            'maio',
            'junho',
            'julho',
            'agosto',
            'setembro',
            'outubro',
            'novembro',
            'dezembro',
        ],
        monthsShort: [
            'jan.',
            'fev.',
            'mar.',
            'abr.',
            'mai.',
            'jun.',
            'jul.',
            'ago.',
            'set.',
            'out.',
            'nov.',
            'dez.',
        ],
        weekdays: [
            'domingo',
            'segunda-feira',
            'terça-feira',
            'quarta-feira',
            'quinta-feira',
            'sexta-feira',
            'sábado',
        ],
        weekdaysShort: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
        weekdaysMin: ['do', 'sg', 'te', 'qa', 'qi', 'sx', 'sá'],
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'DD/MM/YYYY',
            LL: 'D [de] MMMM [de] YYYY',
            LLL: 'D [de] MMMM [de] YYYY [às] HH:mm',
            LLLL: 'dddd, D [de] MMMM [de] YYYY [às] HH:mm',
        },
        ordinal: (n) => {
            return `${n}º`;
        },
        meridiem: (hour, _minute, isLower) => {
            const m = hour < 12 ? 'da manhã' : hour < 18 ? 'da tarde' : 'da noite';
            return isLower ? m : m.toUpperCase();
        },
        relativeTime: {
            future: 'em %s',
            past: 'há %s',
            s: 'poucos segundos',
            ss: '%d segundos',
            m: 'um minuto',
            mm: '%d minutos',
            h: 'uma hora',
            hh: '%d horas',
            d: 'um dia',
            dd: '%d dias',
            M: 'um mês',
            MM: '%d meses',
            y: 'um ano',
            yy: '%d anos',
        },
    };
    var index$2 = {
        name: 'locale-pt-BR',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        locale: locale$2,
        install(kairos, _utils) {
            localeManager.register('pt-BR', {
                ...locale$2,
                holidays: holidays$2,
                observances: observances$2,
                regionalHolidays: regionalHolidays$2,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['pt-BR'] = locale$2;
            kairos.extend({
                getBrazilianHolidays(region) {
                    if (region && typeof region === 'string') {
                        const regionLower = region.toLowerCase();
                        const regionHols = regionalHolidays$2[regionLower];
                        if (regionHols) {
                            return [...holidays$2, ...regionHols];
                        }
                    }
                    return holidays$2;
                },
                getBrazilianObservances() {
                    return observances$2;
                },
                getRegionalBrazilianHolidays(region) {
                    if (!region || typeof region !== 'string') {
                        return [];
                    }
                    return regionalHolidays$2[region.toLowerCase()] || [];
                },
                getAllBrazilianHolidays() {
                    return allHolidays$2;
                },
            });
        },
    };

    const holidays$1 = [
        {
            name: 'Новый год',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            name: 'Рождество Христово',
            type: 'fixed',
            rule: { month: 1, day: 7 },
        },
        {
            name: 'День защитника Отечества',
            type: 'fixed',
            rule: { month: 2, day: 23 },
        },
        {
            name: 'Международный женский день',
            type: 'fixed',
            rule: { month: 3, day: 8 },
        },
        {
            name: 'Праздник Весны и Труда',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            name: 'День Победы',
            type: 'fixed',
            rule: { month: 5, day: 9 },
        },
        {
            name: 'День России',
            type: 'fixed',
            rule: { month: 6, day: 12 },
        },
        {
            name: 'День народного единства',
            type: 'fixed',
            rule: { month: 11, day: 4 },
        },
        {
            name: 'Новогодние каникулы',
            type: 'fixed',
            rule: { month: 1, day: 2 },
        },
        {
            name: 'Новогодние каникулы',
            type: 'fixed',
            rule: { month: 1, day: 3 },
        },
        {
            name: 'Новогодние каникулы',
            type: 'fixed',
            rule: { month: 1, day: 4 },
        },
        {
            name: 'Новогодние каникулы',
            type: 'fixed',
            rule: { month: 1, day: 5 },
        },
        {
            name: 'Новогодние каникулы',
            type: 'fixed',
            rule: { month: 1, day: 6 },
        },
        {
            name: 'Новогодние каникулы',
            type: 'fixed',
            rule: { month: 1, day: 8 },
        },
        {
            name: 'Православная Пасха',
            type: 'easter-based',
            rule: { offset: 0 },
        },
    ];
    const regionalHolidays$1 = {
        tatarstan: [
            {
                name: 'День Республики Татарстан',
                type: 'fixed',
                rule: { month: 8, day: 30 },
            },
        ],
        bashkortostan: [
            {
                name: 'День Республики Башкортостан',
                type: 'fixed',
                rule: { month: 10, day: 11 },
            },
        ],
        sakha: [
            {
                name: 'День Республики Саха (Якутия)',
                type: 'fixed',
                rule: { month: 4, day: 27 },
            },
        ],
        chechnya: [
            {
                name: 'День мира в Чеченской Республике',
                type: 'fixed',
                rule: { month: 4, day: 16 },
            },
        ],
        dagestan: [
            {
                name: 'День единения народов Дагестана',
                type: 'fixed',
                rule: { month: 9, day: 15 },
            },
        ],
    };
    const observances$1 = [
        {
            name: 'День святого Валентина',
            type: 'fixed',
            rule: { month: 2, day: 14 },
        },
        {
            name: 'Масленица',
            type: 'easter-based',
            rule: { offset: -49 },
        },
        {
            name: 'День космонавтики',
            type: 'fixed',
            rule: { month: 4, day: 12 },
        },
        {
            name: 'Радоница',
            type: 'easter-based',
            rule: { offset: 9 },
        },
        {
            name: 'День Победы (вечером)',
            type: 'fixed',
            rule: { month: 5, day: 9 },
        },
        {
            name: 'День знаний',
            type: 'fixed',
            rule: { month: 9, day: 1 },
        },
        {
            name: 'День учителя',
            type: 'fixed',
            rule: { month: 10, day: 5 },
        },
        {
            name: 'День матери',
            type: 'nth-weekday',
            rule: { month: 11, weekday: 0, nth: -1 },
        },
        {
            name: 'День Конституции Российской Федерации',
            type: 'fixed',
            rule: { month: 12, day: 12 },
        },
    ];
    const allHolidays$1 = [...holidays$1, ...observances$1];

    const locale$1 = {
        name: 'Русский (Россия)',
        code: 'ru-RU',
        months: [
            'январь',
            'февраль',
            'март',
            'апрель',
            'май',
            'июнь',
            'июль',
            'август',
            'сентябрь',
            'октябрь',
            'ноябрь',
            'декабрь',
        ],
        monthsShort: [
            'янв.',
            'фев.',
            'мар.',
            'апр.',
            'май',
            'июн.',
            'июл.',
            'авг.',
            'сен.',
            'окт.',
            'ноя.',
            'дек.',
        ],
        weekdays: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
        weekdaysShort: ['вс.', 'пн.', 'вт.', 'ср.', 'чт.', 'пт.', 'сб.'],
        weekdaysMin: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        formats: {
            LT: 'H:mm',
            LTS: 'H:mm:ss',
            L: 'DD.MM.YYYY',
            LL: 'D MMMM YYYY [г.]',
            LLL: 'D MMMM YYYY [г.], H:mm',
            LLLL: 'dddd, D MMMM YYYY [г.], H:mm',
        },
        ordinal: (n) => {
            return `${n}-й`;
        },
        meridiem: (hour, _minute, _isLower) => {
            return hour < 4 ? 'ночи' : hour < 12 ? 'утра' : hour < 17 ? 'дня' : 'вечера';
        },
        relativeTime: {
            future: 'через %s',
            past: '%s назад',
            s: 'несколько секунд',
            ss: (n) => {
                return n % 10 === 1 && n % 100 !== 11
                    ? `${n} секунду`
                    : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
                        ? `${n} секунды`
                        : `${n} секунд`;
            },
            m: 'минуту',
            mm: (n) => {
                return n % 10 === 1 && n % 100 !== 11
                    ? `${n} минуту`
                    : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
                        ? `${n} минуты`
                        : `${n} минут`;
            },
            h: 'час',
            hh: (n) => {
                return n % 10 === 1 && n % 100 !== 11
                    ? `${n} час`
                    : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
                        ? `${n} часа`
                        : `${n} часов`;
            },
            d: 'день',
            dd: (n) => {
                return n % 10 === 1 && n % 100 !== 11
                    ? `${n} день`
                    : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
                        ? `${n} дня`
                        : `${n} дней`;
            },
            M: 'месяц',
            MM: (n) => {
                return n % 10 === 1 && n % 100 !== 11
                    ? `${n} месяц`
                    : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
                        ? `${n} месяца`
                        : `${n} месяцев`;
            },
            y: 'год',
            yy: (n) => {
                return n % 10 === 1 && n % 100 !== 11
                    ? `${n} год`
                    : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
                        ? `${n} года`
                        : `${n} лет`;
            },
        },
    };
    var index$1 = {
        name: 'locale-ru-RU',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        locale: locale$1,
        install(kairos, _utils) {
            localeManager.register('ru-RU', {
                ...locale$1,
                holidays: holidays$1,
                observances: observances$1,
                regionalHolidays: regionalHolidays$1,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['ru-RU'] = locale$1;
            kairos.extend({
                getRussianHolidays(region) {
                    if (region && typeof region === 'string') {
                        const regionLower = region.toLowerCase();
                        const regionHols = regionalHolidays$1[regionLower];
                        if (regionHols) {
                            return [...holidays$1, ...regionHols];
                        }
                    }
                    return holidays$1;
                },
                getRussianObservances() {
                    return observances$1;
                },
                getRegionalRussianHolidays(region) {
                    if (!region || typeof region !== 'string') {
                        return [];
                    }
                    return regionalHolidays$1[region.toLowerCase()] || [];
                },
                getAllRussianHolidays() {
                    return allHolidays$1;
                },
            });
        },
    };

    const holidays = [
        {
            name: '元旦',
            type: 'fixed',
            rule: { month: 1, day: 1 },
        },
        {
            name: '劳动节',
            type: 'fixed',
            rule: { month: 5, day: 1 },
        },
        {
            name: '国庆节',
            type: 'fixed',
            rule: { month: 10, day: 1 },
        },
        {
            name: '国庆黄金周',
            type: 'fixed',
            rule: { month: 10, day: 2 },
        },
        {
            name: '国庆黄金周',
            type: 'fixed',
            rule: { month: 10, day: 3 },
        },
        {
            name: '春节',
            type: 'lunar',
            rule: { calendar: 'chinese', month: 1, day: 1 },
        },
        {
            name: '春节假期',
            type: 'lunar',
            rule: { calendar: 'chinese', month: 1, day: 2 },
        },
        {
            name: '春节假期',
            type: 'lunar',
            rule: { calendar: 'chinese', month: 1, day: 3 },
        },
        {
            name: '清明节',
            type: 'fixed',
            rule: { month: 4, day: 5 },
        },
        {
            name: '端午节',
            type: 'lunar',
            rule: { calendar: 'chinese', month: 5, day: 5 },
        },
        {
            name: '中秋节',
            type: 'lunar',
            rule: { calendar: 'chinese', month: 8, day: 15 },
        },
    ];
    const regionalHolidays = {
        xinjiang: [
            {
                name: '古尔邦节',
                type: 'custom',
                rule: { calculate: (year) => [new Date(year, 8, 10)] },
            },
        ],
        tibet: [
            {
                name: '藏历新年',
                type: 'custom',
                rule: { calculate: (year) => [new Date(year, 1, 10)] },
            },
        ],
        guangxi: [
            {
                name: '三月三',
                type: 'lunar',
                rule: { month: 3, day: 3 },
            },
        ],
        hongkong: [
            {
                name: '佛诞节',
                type: 'lunar',
                rule: { month: 4, day: 8 },
            },
        ],
        macau: [
            {
                name: '澳门特别行政区成立纪念日',
                type: 'fixed',
                rule: { month: 12, day: 20 },
            },
        ],
    };
    const observances = [
        {
            name: '情人节',
            type: 'fixed',
            rule: { month: 2, day: 14 },
        },
        {
            name: '妇女节',
            type: 'fixed',
            rule: { month: 3, day: 8 },
        },
        {
            name: '植树节',
            type: 'fixed',
            rule: { month: 3, day: 12 },
        },
        {
            name: '愚人节',
            type: 'fixed',
            rule: { month: 4, day: 1 },
        },
        {
            name: '青年节',
            type: 'fixed',
            rule: { month: 5, day: 4 },
        },
        {
            name: '母亲节',
            type: 'nth-weekday',
            rule: { month: 5, weekday: 0, nth: 2 },
        },
        {
            name: '儿童节',
            type: 'fixed',
            rule: { month: 6, day: 1 },
        },
        {
            name: '父亲节',
            type: 'nth-weekday',
            rule: { month: 6, weekday: 0, nth: 3 },
        },
        {
            name: '建党节',
            type: 'fixed',
            rule: { month: 7, day: 1 },
        },
        {
            name: '建军节',
            type: 'fixed',
            rule: { month: 8, day: 1 },
        },
        {
            name: '教师节',
            type: 'fixed',
            rule: { month: 9, day: 10 },
        },
        {
            name: '重阳节',
            type: 'lunar',
            rule: { calendar: 'chinese', month: 9, day: 9 },
        },
        {
            name: '万圣节',
            type: 'fixed',
            rule: { month: 10, day: 31 },
        },
        {
            name: '光棍节',
            type: 'fixed',
            rule: { month: 11, day: 11 },
        },
        {
            name: '圣诞节',
            type: 'fixed',
            rule: { month: 12, day: 25 },
        },
    ];
    const allHolidays = [...holidays, ...observances];

    const locale = {
        name: '中文 (简体，中国)',
        code: 'zh-CN',
        months: [
            '一月',
            '二月',
            '三月',
            '四月',
            '五月',
            '六月',
            '七月',
            '八月',
            '九月',
            '十月',
            '十一月',
            '十二月',
        ],
        monthsShort: [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
        ],
        weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        weekdaysShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        weekdaysMin: ['日', '一', '二', '三', '四', '五', '六'],
        formats: {
            LT: 'HH:mm',
            LTS: 'HH:mm:ss',
            L: 'YYYY/MM/DD',
            LL: 'YYYY年M月D日',
            LLL: 'YYYY年M月D日 HH:mm',
            LLLL: 'dddd YYYY年M月D日 HH:mm',
        },
        ordinal: (n) => {
            return `第${n}`;
        },
        meridiem: (hour, _minute, _isLower) => {
            if (hour < 6) {
                return '凌晨';
            }
            else if (hour < 9) {
                return '早上';
            }
            else if (hour < 12) {
                return '上午';
            }
            else if (hour < 13) {
                return '中午';
            }
            else if (hour < 18) {
                return '下午';
            }
            else {
                return '晚上';
            }
        },
        relativeTime: {
            future: '%s后',
            past: '%s前',
            s: '几秒',
            ss: '%d秒',
            m: '1分钟',
            mm: '%d分钟',
            h: '1小时',
            hh: '%d小时',
            d: '1天',
            dd: '%d天',
            M: '1个月',
            MM: '%d个月',
            y: '1年',
            yy: '%d年',
        },
    };
    var index = {
        name: 'locale-zh-CN',
        version: '1.0.0',
        size: 1024,
        dependencies: ['holiday-engine'],
        locale,
        install(kairos, _utils) {
            localeManager.register('zh-CN', {
                ...locale,
                holidays,
                observances,
                regionalHolidays,
            });
            kairos.locales = kairos.locales || {};
            kairos.locales['zh-CN'] = locale;
            kairos.extend({
                getChineseHolidays(region) {
                    if (region && typeof region === 'string') {
                        const regionLower = region.toLowerCase();
                        const regionHols = regionalHolidays[regionLower];
                        if (regionHols) {
                            return [...holidays, ...regionHols];
                        }
                    }
                    return holidays;
                },
                getChineseObservances() {
                    return observances;
                },
                getRegionalChineseHolidays(region) {
                    if (!region || typeof region !== 'string') {
                        return [];
                    }
                    return regionalHolidays[region.toLowerCase()] || [];
                },
                getAllChineseHolidays() {
                    return allHolidays;
                },
            });
        },
    };

    const DateValidationSchema = {
        name: 'DateComponents',
        description: 'Validation schema for date components',
        version: '1.0.0',
        strict: false,
        sanitize: true,
        transform: true,
        stopOnFirstError: false,
        rules: {
            year: {
                name: 'year',
                required: true,
                type: 'number',
                min: 1000,
                max: 9999,
                message: 'Year must be between 1000 and 9999',
                custom: (value, context) => {
                    if (context.strict && value < 1900) {
                        return 'Years before 1900 are not supported in strict mode';
                    }
                    return true;
                },
            },
            month: {
                name: 'month',
                required: true,
                type: 'number',
                min: 1,
                max: 12,
                message: 'Month must be between 1 and 12',
            },
            day: {
                name: 'day',
                required: true,
                type: 'number',
                min: 1,
                max: 31,
                message: 'Day must be between 1 and 31',
                custom: (value, context) => {
                    if (context.partial)
                        return true;
                    const { year, month } = context;
                    if (year && month) {
                        const daysInMonth = new Date(year, month, 0).getDate();
                        if (value > daysInMonth) {
                            return `${month === 2 ? 'February' : `Month ${month}`} in ${year} has only ${daysInMonth} days`;
                        }
                    }
                    return true;
                },
            },
            hour: {
                name: 'hour',
                required: false,
                type: 'number',
                min: 0,
                max: 23,
                message: 'Hour must be between 0 and 23',
                transform: (value) => Math.floor(value),
            },
            minute: {
                name: 'minute',
                required: false,
                type: 'number',
                min: 0,
                max: 59,
                message: 'Minute must be between 0 and 59',
                transform: (value) => Math.floor(value),
            },
            second: {
                name: 'second',
                required: false,
                type: 'number',
                min: 0,
                max: 59,
                message: 'Second must be between 0 and 59',
                transform: (value) => Math.floor(value),
            },
            millisecond: {
                name: 'millisecond',
                required: false,
                type: 'number',
                min: 0,
                max: 999,
                message: 'Millisecond must be between 0 and 999',
                transform: (value) => Math.floor(value),
            },
        },
    };
    const HolidayValidationSchema = {
        name: 'HolidayRule',
        description: 'Validation schema for holiday rules',
        version: '1.0.0',
        strict: true,
        sanitize: false,
        transform: false,
        stopOnFirstError: false,
        rules: {
            name: {
                name: 'name',
                required: true,
                type: 'string',
                minLength: 1,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9\s\-_]+$/,
                message: 'Holiday name must be 1-100 characters and contain only letters, numbers, spaces, hyphens, and underscores',
                sanitize: true,
            },
            type: {
                name: 'type',
                required: true,
                type: 'string',
                enum: ['fixed', 'nth-weekday', 'relative', 'lunar', 'easter-based', 'custom'],
                message: 'Holiday type must be one of: fixed, nth-weekday, relative, lunar, easter-based, custom',
            },
            active: {
                name: 'active',
                required: false,
                type: 'boolean',
                transform: (value) => Boolean(value),
            },
        },
        customValidators: {
            validateHolidayRule: (value) => {
                if (!value.rule || typeof value.rule !== 'object') {
                    return 'Holiday rule must have a rule property';
                }
                switch (value.type) {
                    case 'fixed':
                        if (!value.rule.month || !value.rule.day) {
                            return 'Fixed holiday must have month and day';
                        }
                        break;
                    case 'nth-weekday':
                        if (!value.rule.month || !value.rule.weekday || !value.rule.nth) {
                            return 'Nth-weekday holiday must have month, weekday, and nth';
                        }
                        break;
                }
                return true;
            },
        },
    };
    class AdvancedValidator {
        constructor() {
            this.schemas = new Map();
            this.cache = new Map();
            this.performanceMetrics = {
                validations: 0,
                totalDuration: 0,
                cacheHits: 0,
                cacheMisses: 0,
            };
            this.registerSchema(DateValidationSchema);
            this.registerSchema(HolidayValidationSchema);
        }
        registerSchema(schema) {
            this.schemas.set(schema.name, schema);
            this.clearCache();
        }
        validate(schemaName, data, context = {}) {
            const startTime = performance.now();
            const cacheKey = this.generateCacheKey(schemaName, data, context);
            const cached = this.cache.get(cacheKey);
            if (cached) {
                this.performanceMetrics.cacheHits++;
                return cached;
            }
            this.performanceMetrics.cacheMisses++;
            const schema = this.schemas.get(schemaName);
            if (!schema) {
                throw ErrorFactory.createConfigurationError(schemaName, `Validation schema '${schemaName}' not found`);
            }
            const fullContext = {
                operation: 'validate',
                strict: schema.strict || false,
                sanitize: schema.sanitize || false,
                transform: schema.transform || false,
                stopOnFirstError: schema.stopOnFirstError || false,
                ...context,
            };
            const result = this.performValidation(schema, data, fullContext);
            const endTime = performance.now();
            result.performance.duration = endTime - startTime;
            this.performanceMetrics.validations++;
            this.performanceMetrics.totalDuration += result.performance.duration;
            this.cache.set(cacheKey, result);
            return result;
        }
        performValidation(schema, data, context) {
            const errors = [];
            const warnings = [];
            let sanitized = false;
            let transformed = false;
            let rulesChecked = 0;
            let rulesSkipped = 0;
            const result = { ...data };
            for (const [fieldName, rule] of Object.entries(schema.rules)) {
                rulesChecked++;
                const value = result[fieldName];
                const fieldPath = context.path ? `${context.path}.${fieldName}` : fieldName;
                try {
                    if (rule.required && (value === undefined || value === null || value === '')) {
                        errors.push({
                            field: fieldName,
                            value,
                            rule: 'required',
                            message: rule.message || `${fieldName} is required`,
                            code: 'REQUIRED_FIELD',
                            severity: 'error',
                            path: fieldPath,
                            context,
                        });
                        if (schema.stopOnFirstError) {
                            break;
                        }
                        continue;
                    }
                    if (!rule.required && (value === undefined || value === null || value === '')) {
                        rulesSkipped++;
                        continue;
                    }
                    if (!this.validateType(value, rule.type)) {
                        errors.push({
                            field: fieldName,
                            value,
                            rule: 'type',
                            message: `${fieldName} must be of type ${rule.type}`,
                            code: 'INVALID_TYPE',
                            severity: 'error',
                            path: fieldPath,
                            context,
                        });
                        if (schema.stopOnFirstError) {
                            break;
                        }
                        continue;
                    }
                    if (rule.type === 'number') {
                        if (rule.min !== undefined && value < rule.min) {
                            errors.push({
                                field: fieldName,
                                value,
                                rule: 'min',
                                message: rule.message || `${fieldName} must be at least ${rule.min}`,
                                code: 'MIN_VALUE',
                                severity: 'error',
                                path: fieldPath,
                                context,
                            });
                        }
                        if (rule.max !== undefined && value > rule.max) {
                            errors.push({
                                field: fieldName,
                                value,
                                rule: 'max',
                                message: rule.message || `${fieldName} must be at most ${rule.max}`,
                                code: 'MAX_VALUE',
                                severity: 'error',
                                path: fieldPath,
                                context,
                            });
                        }
                    }
                    if (rule.type === 'string') {
                        if (rule.minLength !== undefined && value.length < rule.minLength) {
                            errors.push({
                                field: fieldName,
                                value,
                                rule: 'minLength',
                                message: rule.message || `${fieldName} must be at least ${rule.minLength} characters`,
                                code: 'MIN_LENGTH',
                                severity: 'error',
                                path: fieldPath,
                                context,
                            });
                        }
                        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
                            errors.push({
                                field: fieldName,
                                value,
                                rule: 'maxLength',
                                message: rule.message || `${fieldName} must be at most ${rule.maxLength} characters`,
                                code: 'MAX_LENGTH',
                                severity: 'error',
                                path: fieldPath,
                                context,
                            });
                        }
                        if (rule.pattern && !rule.pattern.test(value)) {
                            errors.push({
                                field: fieldName,
                                value,
                                rule: 'pattern',
                                message: rule.message || `${fieldName} format is invalid`,
                                code: 'INVALID_PATTERN',
                                severity: 'error',
                                path: fieldPath,
                                context,
                            });
                        }
                        if (rule.sanitize) {
                            result[fieldName] = this.sanitizeString(value);
                            sanitized = true;
                        }
                    }
                    if (rule.enum && !rule.enum.includes(value)) {
                        errors.push({
                            field: fieldName,
                            value,
                            rule: 'enum',
                            message: rule.message || `${fieldName} must be one of: ${rule.enum.join(', ')}`,
                            code: 'INVALID_ENUM',
                            severity: 'error',
                            path: fieldPath,
                            context,
                        });
                    }
                    if (rule.custom) {
                        const customResult = rule.custom(value, { ...context, path: fieldPath });
                        if (customResult !== true) {
                            const message = typeof customResult === 'string'
                                ? customResult
                                : rule.message || `${fieldName} is invalid`;
                            errors.push({
                                field: fieldName,
                                value,
                                rule: 'custom',
                                message,
                                code: 'CUSTOM_VALIDATION',
                                severity: 'error',
                                path: fieldPath,
                                context,
                            });
                        }
                    }
                    if (rule.transform && value !== undefined) {
                        result[fieldName] = rule.transform(value);
                        transformed = true;
                    }
                }
                catch (error) {
                    errors.push({
                        field: fieldName,
                        value,
                        rule: 'system',
                        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        code: 'SYSTEM_ERROR',
                        severity: 'error',
                        path: fieldPath,
                        context,
                    });
                }
            }
            if (schema.customValidators) {
                for (const [validatorName, validator] of Object.entries(schema.customValidators)) {
                    try {
                        const customResult = validator(data, context);
                        if (customResult !== true) {
                            errors.push({
                                field: 'root',
                                value: data,
                                rule: validatorName,
                                message: typeof customResult === 'string' ? customResult : 'Custom validation failed',
                                code: 'CUSTOM_VALIDATOR',
                                severity: 'error',
                                path: context.path || 'root',
                                context,
                            });
                        }
                    }
                    catch (error) {
                        errors.push({
                            field: 'root',
                            value: data,
                            rule: validatorName,
                            message: `Custom validator error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                            code: 'CUSTOM_VALIDATOR_ERROR',
                            severity: 'error',
                            path: context.path || 'root',
                            context,
                        });
                    }
                }
            }
            const success = errors.length === 0;
            return {
                valid: success,
                data: success ? result : undefined,
                errors,
                warnings,
                context,
                sanitized,
                transformed,
                performance: {
                    duration: 0,
                    rulesChecked,
                    rulesSkipped,
                },
            };
        }
        validateType(value, expectedType) {
            switch (expectedType) {
                case 'string':
                    return typeof value === 'string';
                case 'number':
                    return typeof value === 'number' && !isNaN(value) && isFinite(value);
                case 'boolean':
                    return typeof value === 'boolean';
                case 'date':
                    return value instanceof Date && !isNaN(value.getTime());
                case 'object':
                    return typeof value === 'object' && value !== null && !Array.isArray(value);
                case 'array':
                    return Array.isArray(value);
                case 'function':
                    return typeof value === 'function';
                default:
                    return true;
            }
        }
        sanitizeString(value) {
            return value
                .trim()
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<[^>]*>/g, '')
                .replace(/[<>]/g, '');
        }
        generateCacheKey(schemaName, data, context) {
            const dataHash = JSON.stringify(data);
            const contextHash = JSON.stringify(context);
            return `${schemaName}:${dataHash}:${contextHash}`;
        }
        clearCache() {
            this.cache.clear();
        }
        getPerformanceMetrics() {
            return {
                ...this.performanceMetrics,
                averageDuration: this.performanceMetrics.validations > 0
                    ? this.performanceMetrics.totalDuration / this.performanceMetrics.validations
                    : 0,
                cacheHitRate: this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses > 0
                    ? this.performanceMetrics.cacheHits /
                        (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)
                    : 0,
            };
        }
        resetPerformanceMetrics() {
            this.performanceMetrics = {
                validations: 0,
                totalDuration: 0,
                cacheHits: 0,
                cacheMisses: 0,
            };
        }
    }
    const globalValidator = new AdvancedValidator();
    function validateDateComponents(data, context) {
        return globalValidator.validate('DateComponents', data, context);
    }
    function validateHolidayRule(data, context) {
        return globalValidator.validate('HolidayRule', data, context);
    }
    function createCustomValidator(schema) {
        const validator = new AdvancedValidator();
        validator.registerSchema(schema);
        return (data, context) => {
            return validator.validate(schema.name, data, context);
        };
    }

    class AdvancedErrorHandler {
        constructor() {
            this.recoveryConfigs = new Map();
            this.errorHistory = [];
            this.maxHistorySize = 1000;
            this.monitoringEnabled = true;
            this.errorMetrics = this.initializeMetrics();
            this.setupDefaultRecoveryConfigs();
        }
        initializeMetrics() {
            return {
                totalErrors: 0,
                errorsByType: {},
                errorsByComponent: {},
                errorsBySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
                recoveryAttempts: 0,
                successfulRecoveries: 0,
                failedRecoveries: 0,
                averageRecoveryTime: 0,
                lastError: new Date(),
                criticalErrors: 0,
            };
        }
        setupDefaultRecoveryConfigs() {
            this.setRecoveryConfig('date_parsing', {
                maxAttempts: 3,
                baseDelay: 100,
                maxDelay: 1000,
                backoffMultiplier: 2,
                jitter: true,
                retryableErrors: ['PARSING_ERROR', 'INVALID_DATE'],
                fallbackValue: new Date(),
                fallbackFunction: () => new Date(),
            });
            this.setRecoveryConfig('validation', {
                maxAttempts: 1,
                baseDelay: 0,
                maxDelay: 0,
                backoffMultiplier: 1,
                jitter: false,
                retryableErrors: ['VALIDATION_ERROR'],
                fallbackFunction: () => null,
                sanitizeFunction: (input) => {
                    if (typeof input === 'string') {
                        return input.trim().replace(/[<>]/g, '');
                    }
                    return input;
                },
            });
            this.setRecoveryConfig('holiday_calculation', {
                maxAttempts: 2,
                baseDelay: 50,
                maxDelay: 500,
                backoffMultiplier: 1.5,
                jitter: true,
                retryableErrors: ['CALCULATION_ERROR', 'INVALID_HOLIDAY_RULE'],
                fallbackValue: null,
                fallbackFunction: () => null,
            });
            this.setRecoveryConfig('plugin', {
                maxAttempts: 1,
                baseDelay: 0,
                maxDelay: 0,
                backoffMultiplier: 1,
                jitter: false,
                retryableErrors: [],
                fallbackValue: null,
                fallbackFunction: (error, context) => {
                    console.warn(`Plugin error in ${context.component}: ${error.message}`);
                    return null;
                },
            });
            this.setRecoveryConfig('critical', {
                maxAttempts: 0,
                baseDelay: 0,
                maxDelay: 0,
                backoffMultiplier: 1,
                jitter: false,
                retryableErrors: [],
                fallbackValue: null,
                fallbackFunction: () => null,
            });
        }
        setRecoveryConfig(errorType, config) {
            this.recoveryConfigs.set(errorType, config);
        }
        getRecoveryConfig(error) {
            let errorType = 'unknown';
            if (error instanceof KairosBaseError) {
                errorType = error.type.toLowerCase();
            }
            else if (error.name === 'TypeError') {
                errorType = 'type_error';
            }
            else if (error.name === 'RangeError') {
                errorType = 'range_error';
            }
            else if (error.name === 'ReferenceError') {
                errorType = 'reference_error';
            }
            return (this.recoveryConfigs.get(errorType) ||
                this.recoveryConfigs.get('unknown') || {
                maxAttempts: 0,
                baseDelay: 0,
                maxDelay: 0,
                backoffMultiplier: 1,
                jitter: false,
                retryableErrors: [],
                fallbackFunction: () => null,
                fallbackValue: null,
            });
        }
        async handleError(error, context, originalFunction) {
            const startTime = performance.now();
            this.updateErrorMetrics(error, context);
            const severity = this.determineErrorSeverity(error, context);
            this.logError(error, context, severity);
            const config = this.getRecoveryConfig(error);
            if (config.maxAttempts === 0) {
                return {
                    recovered: false,
                    strategy: 'abort',
                    error,
                    attempts: 0,
                    duration: performance.now() - startTime,
                };
            }
            let lastError = error;
            let strategy = 'retry';
            for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
                this.errorMetrics.recoveryAttempts++;
                try {
                    const delay = this.calculateDelay(attempt, config);
                    if (delay > 0) {
                        await this.sleep(delay);
                    }
                    let result;
                    if (config.retryableErrors.includes(error.name) ||
                        config.retryableErrors.some((pattern) => error.message.includes(pattern))) {
                        if (originalFunction) {
                            result = await originalFunction();
                            strategy = 'retry';
                        }
                    }
                    if (result === undefined && config.sanitizeFunction && context.input !== undefined) {
                        config.sanitizeFunction(context.input);
                        if (originalFunction) {
                            result = await originalFunction();
                        }
                        strategy = 'sanitize';
                    }
                    if (result === undefined && config.transformFunction && context.input !== undefined) {
                        config.transformFunction(context.input);
                        if (originalFunction) {
                            result = await originalFunction();
                        }
                        strategy = 'transform';
                    }
                    if (result === undefined && config.fallbackFunction) {
                        result = config.fallbackFunction(lastError, context);
                        strategy = 'fallback';
                    }
                    if (result === undefined && config.fallbackValue !== undefined) {
                        result = config.fallbackValue;
                        strategy = 'fallback';
                    }
                    if (result === undefined && config.delegateFunction) {
                        result = await config.delegateFunction(lastError, context);
                        strategy = 'delegate';
                    }
                    if (result !== undefined) {
                        this.errorMetrics.successfulRecoveries++;
                        const duration = performance.now() - startTime;
                        return {
                            recovered: true,
                            strategy,
                            result,
                            attempts: attempt,
                            duration,
                            fallbackUsed: strategy === 'fallback' || strategy === 'delegate',
                        };
                    }
                }
                catch (recoveryError) {
                    lastError =
                        recoveryError instanceof Error ? recoveryError : new Error(String(recoveryError));
                }
            }
            this.errorMetrics.failedRecoveries++;
            const duration = performance.now() - startTime;
            return {
                recovered: false,
                strategy: strategy || 'abort',
                error: lastError,
                attempts: config.maxAttempts,
                duration,
            };
        }
        calculateDelay(attempt, config) {
            let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
            delay = Math.min(delay, config.maxDelay);
            if (config.jitter) {
                const jitterFactor = 0.75 + Math.random() * 0.5;
                delay = delay * jitterFactor;
            }
            return Math.floor(delay);
        }
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }
        determineErrorSeverity(error, context) {
            if (error.message.includes('out of memory') ||
                error.message.includes('stack overflow') ||
                (error.name === 'RangeError' && error.message.includes('Maximum call stack'))) {
                return 'critical';
            }
            if ((error instanceof KairosBaseError && error.type === 'CONFIGURATION_ERROR') ||
                context.component === 'core' ||
                (error.name === 'TypeError' && error.message.includes('Cannot read property'))) {
                return 'high';
            }
            if (error instanceof KairosBaseError &&
                ['PARSING_ERROR', 'VALIDATION_ERROR', 'PLUGIN_ERROR'].includes(error.type)) {
                return 'medium';
            }
            return 'low';
        }
        updateErrorMetrics(error, context) {
            this.errorMetrics.totalErrors++;
            this.errorMetrics.lastError = new Date();
            const errorType = error instanceof KairosBaseError ? error.type : error.name;
            this.errorMetrics.errorsByType[errorType] =
                (this.errorMetrics.errorsByType[errorType] || 0) + 1;
            this.errorMetrics.errorsByComponent[context.component] =
                (this.errorMetrics.errorsByComponent[context.component] || 0) + 1;
            const severity = this.determineErrorSeverity(error, context);
            this.errorMetrics.errorsBySeverity[severity]++;
            if (severity === 'critical') {
                this.errorMetrics.criticalErrors++;
            }
            this.addToHistory(error, context);
        }
        addToHistory(error, context) {
            this.errorHistory.push({
                error,
                context,
            });
            if (this.errorHistory.length > this.maxHistorySize) {
                this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
            }
        }
        logError(error, context, severity) {
            if (!this.monitoringEnabled)
                return;
            const logLevel = severity === 'critical'
                ? 'error'
                : severity === 'high'
                    ? 'warn'
                    : severity === 'medium'
                        ? 'info'
                        : 'debug';
            const logMessage = `[${severity.toUpperCase()}] ${context.component}.${context.operation}: ${error.message}`;
            console[logLevel](logMessage, {
                error: error.name,
                type: error.type,
                context: context.component,
                operation: context.operation,
                timestamp: context.timestamp.toISOString(),
                stack: error.stack,
            });
        }
        getErrorMetrics() {
            return { ...this.errorMetrics };
        }
        getErrorHistory(limit) {
            if (limit) {
                return this.errorHistory.slice(-limit);
            }
            return [...this.errorHistory];
        }
        clearHistory() {
            this.errorHistory = [];
            this.errorMetrics = this.initializeMetrics();
        }
        setMonitoringEnabled(enabled) {
            this.monitoringEnabled = enabled;
        }
        setMaxHistorySize(size) {
            this.maxHistorySize = size;
            if (this.errorHistory.length > size) {
                this.errorHistory = this.errorHistory.slice(-size);
            }
        }
        getRecoverySuggestions(error, context) {
            const suggestions = [];
            const config = this.getRecoveryConfig(error);
            if (error instanceof KairosBaseError) {
                switch (error.type) {
                    case 'INVALID_DATE':
                        suggestions.push('Check if the date format is correct');
                        suggestions.push('Verify the date string is not empty');
                        suggestions.push('Consider using a different date format');
                        break;
                    case 'PARSING_ERROR':
                        suggestions.push('Verify the input format matches the expected pattern');
                        suggestions.push('Check for special characters in the input');
                        suggestions.push('Try a more lenient parsing approach');
                        break;
                    case 'VALIDATION_ERROR':
                        suggestions.push('Review the validation rules');
                        suggestions.push('Check if all required fields are provided');
                        suggestions.push('Verify field values are within allowed ranges');
                        break;
                    case 'INVALID_TIMEZONE':
                        suggestions.push('Verify the timezone identifier is valid');
                        suggestions.push('Use standard IANA timezone names');
                        break;
                    case 'PLUGIN_ERROR':
                        suggestions.push('Check if the plugin is properly loaded');
                        suggestions.push('Verify plugin configuration');
                        suggestions.push('Try reloading the plugin');
                        break;
                }
            }
            if (context.component === 'parser') {
                suggestions.push('Consider using a different parsing strategy');
                suggestions.push('Check if locale settings are correct');
            }
            if (context.component === 'validator') {
                suggestions.push('Review validation schema');
                suggestions.push('Consider enabling sanitization');
            }
            if (config.maxAttempts > 0) {
                suggestions.push(`System will attempt up to ${config.maxAttempts} recovery attempts`);
            }
            if (config.fallbackFunction !== undefined || config.fallbackValue !== undefined) {
                suggestions.push('Fallback behavior is configured for this error type');
            }
            return suggestions;
        }
    }
    const globalErrorHandler = new AdvancedErrorHandler();
    async function handleError(error, context, originalFunction) {
        return globalErrorHandler.handleError(error, context, originalFunction);
    }
    class ErrorBoundary {
        constructor(config) {
            this.errorHandler = config?.errorHandler || globalErrorHandler;
            this.fallbackComponent = config?.fallbackComponent;
        }
        async execute(fn, context) {
            try {
                return await fn();
            }
            catch (error) {
                const kairosError = error instanceof Error ? error : new Error(String(error));
                const recoveryResult = await this.errorHandler.handleError(kairosError, context, fn);
                if (recoveryResult.recovered && recoveryResult.result !== undefined) {
                    return recoveryResult.result;
                }
                if (this.fallbackComponent) {
                    return this.fallbackComponent(kairosError, context);
                }
                throw kairosError;
            }
        }
    }
    class ErrorMonitor {
        constructor(config) {
            this.alertCallbacks = [];
            this.errorHandler = config?.errorHandler || globalErrorHandler;
            this.alertThresholds = {
                errorRate: config?.alertThresholds?.errorRate || 0.1,
                criticalErrors: config?.alertThresholds?.criticalErrors || 5,
                recoveryFailureRate: config?.alertThresholds?.recoveryFailureRate || 0.5,
            };
        }
        checkAlerts() {
            const metrics = this.errorHandler.getErrorMetrics();
            const alerts = [];
            const totalOperations = metrics.totalErrors + metrics.successfulRecoveries;
            if (totalOperations > 0) {
                const errorRate = metrics.totalErrors / totalOperations;
                if (errorRate > this.alertThresholds.errorRate) {
                    alerts.push({
                        type: 'error_rate',
                        severity: 'high',
                        message: `Error rate (${(errorRate * 100).toFixed(2)}%) exceeds threshold (${(this.alertThresholds.errorRate * 100).toFixed(2)}%)`,
                        metrics,
                        timestamp: new Date(),
                    });
                }
            }
            if (metrics.criticalErrors > this.alertThresholds.criticalErrors) {
                alerts.push({
                    type: 'critical_errors',
                    severity: 'critical',
                    message: `Critical errors (${metrics.criticalErrors}) exceed threshold (${this.alertThresholds.criticalErrors})`,
                    metrics,
                    timestamp: new Date(),
                });
            }
            const totalRecoveries = metrics.successfulRecoveries + metrics.failedRecoveries;
            if (totalRecoveries > 0) {
                const failureRate = metrics.failedRecoveries / totalRecoveries;
                if (failureRate > this.alertThresholds.recoveryFailureRate) {
                    alerts.push({
                        type: 'recovery_failure',
                        severity: 'medium',
                        message: `Recovery failure rate (${(failureRate * 100).toFixed(2)}%) exceeds threshold (${(this.alertThresholds.recoveryFailureRate * 100).toFixed(2)}%)`,
                        metrics,
                        timestamp: new Date(),
                    });
                }
            }
            alerts.forEach((alert) => {
                this.alertCallbacks.forEach((callback) => {
                    try {
                        callback(alert);
                    }
                    catch (error) {
                        console.error('Error in alert callback:', error);
                    }
                });
            });
            return alerts;
        }
        addAlertCallback(callback) {
            this.alertCallbacks.push(callback);
        }
        removeAlertCallback(callback) {
            const index = this.alertCallbacks.indexOf(callback);
            if (index > -1) {
                this.alertCallbacks.splice(index, 1);
            }
        }
    }
    const globalErrorMonitor = new ErrorMonitor();

    class ErrorManager {
        constructor(config) {
            this.boundaries = new Map();
            this.validator = globalValidator;
            this.errorHandler = globalErrorHandler;
            this.config = this.mergeConfig(config);
            this.setupErrorHandling();
        }
        mergeConfig(config) {
            return {
                validation: {
                    strict: false,
                    sanitize: true,
                    transform: true,
                    stopOnFirstError: false,
                    cacheResults: true,
                    ...config?.validation,
                },
                handling: {
                    enableRecovery: true,
                    maxRecoveryAttempts: 3,
                    enableMonitoring: true,
                    enableAlerts: true,
                    ...config?.handling,
                },
                reporting: {
                    logLevel: 'warn',
                    includeStackTrace: true,
                    includeContext: true,
                    maxHistorySize: 1000,
                    ...config?.reporting,
                },
            };
        }
        setupErrorHandling() {
            this.errorHandler.setMonitoringEnabled(this.config.handling.enableMonitoring);
            this.errorHandler.setMaxHistorySize(this.config.reporting.maxHistorySize);
        }
        async execute(operationConfig) {
            const startTime = performance.now();
            const context = {
                operation: operationConfig.name,
                component: operationConfig.component,
                steps: [],
            };
            const result = {
                success: false,
                performance: {
                    validationTime: 0,
                    handlingTime: 0,
                    totalTime: 0,
                },
                context,
            };
            try {
                context.steps.push('started');
                if (!operationConfig.skipValidation && operationConfig.schema) {
                    const validationStart = performance.now();
                    context.steps.push('validation');
                    const validationContext = {
                        operation: operationConfig.name,
                        path: operationConfig.component,
                        strict: this.config.validation.strict,
                        sanitize: this.config.validation.sanitize,
                        transform: this.config.validation.transform,
                        stopOnFirstError: this.config.validation.stopOnFirstError,
                        ...operationConfig.validation,
                    };
                    result.validation = this.validator.validate(operationConfig.schema, operationConfig.input, validationContext);
                    result.performance.validationTime = performance.now() - validationStart;
                    if (!result.validation.valid) {
                        const validationError = ErrorFactory.createValidationError(operationConfig.schema, operationConfig.input, result.validation.errors.map((e) => e.message).join(', '));
                        if (this.config.reporting.logLevel !== 'none') {
                            this.logError(validationError, context, 'validation_failed');
                        }
                        result.error = validationError;
                        result.performance.totalTime = performance.now() - startTime;
                        return result;
                    }
                    operationConfig.input = result.validation.data;
                }
                if (operationConfig.operation) {
                    const operationStart = performance.now();
                    context.steps.push('execution');
                    const boundary = this.getBoundary(operationConfig.component);
                    let operationPromise = boundary.execute(() => operationConfig.operation(operationConfig.input), this.createErrorContext(operationConfig));
                    if (operationConfig.timeout) {
                        operationPromise = this.withTimeout(operationPromise, operationConfig.timeout, `Operation ${operationConfig.name} timed out`);
                    }
                    try {
                        result.data = await operationPromise;
                        context.steps.push('completed');
                        result.success = true;
                    }
                    catch (error) {
                        context.steps.push('failed');
                        const kairosError = this.normalizeError(error);
                        if (this.config.reporting.logLevel !== 'none') {
                            this.logError(kairosError, context, 'operation_failed');
                        }
                        result.error = kairosError;
                        if (this.config.handling.enableRecovery) {
                            context.steps.push('recovery');
                            result.recovery = await this.errorHandler.handleError(kairosError, this.createErrorContext(operationConfig), () => operationConfig.operation(operationConfig.input));
                            if (result.recovery.recovered) {
                                result.data = result.recovery.result;
                                result.success = true;
                                context.steps.push('recovered');
                                this.logInfo(context, 'operation_recovered');
                            }
                            else if (operationConfig.fallback) {
                                context.steps.push('fallback');
                                try {
                                    result.data = await operationConfig.fallback(kairosError, operationConfig.input);
                                    result.success = true;
                                    context.steps.push('fallback_succeeded');
                                    this.logInfo(context, 'fallback_succeeded');
                                }
                                catch (fallbackError) {
                                    result.error = this.normalizeError(fallbackError);
                                    context.steps.push('fallback_failed');
                                    this.logError(result.error, context, 'fallback_failed');
                                }
                            }
                        }
                        result.performance.handlingTime = performance.now() - operationStart;
                    }
                }
            }
            catch (error) {
                context.steps.push('system_error');
                result.error = this.normalizeError(error);
                this.logError(result.error, context, 'system_error');
            }
            result.performance.totalTime = performance.now() - startTime;
            return result;
        }
        validate(schemaName, data, context) {
            const startTime = performance.now();
            const operationContext = {
                operation: 'validate',
                component: 'validator',
                steps: [],
            };
            const result = {
                success: false,
                performance: {
                    validationTime: 0,
                    handlingTime: 0,
                    totalTime: 0,
                },
                context: operationContext,
            };
            try {
                operationContext.steps.push('validation_started');
                const validationContext = {
                    operation: 'validate',
                    strict: this.config.validation.strict,
                    sanitize: this.config.validation.sanitize,
                    transform: this.config.validation.transform,
                    stopOnFirstError: this.config.validation.stopOnFirstError,
                    ...context,
                };
                result.validation = this.validator.validate(schemaName, data, validationContext);
                result.performance.validationTime = performance.now() - startTime;
                if (result.validation.valid) {
                    result.success = true;
                    result.data = result.validation.data;
                    operationContext.steps.push('validation_succeeded');
                }
                else {
                    result.error = ErrorFactory.createValidationError(schemaName, data, result.validation.errors.map((e) => e.message).join(', '));
                    operationContext.steps.push('validation_failed');
                    this.logError(result.error, operationContext, 'validation_failed');
                }
            }
            catch (error) {
                result.error = this.normalizeError(error);
                operationContext.steps.push('validation_system_error');
                this.logError(result.error, operationContext, 'validation_system_error');
            }
            result.performance.totalTime = performance.now() - startTime;
            return result;
        }
        async handleError(error, context, originalFunction) {
            const startTime = performance.now();
            const operationContext = {
                operation: context.operation,
                component: context.component,
                steps: ['error_handling_started'],
            };
            const result = {
                success: false,
                performance: {
                    validationTime: 0,
                    handlingTime: 0,
                    totalTime: 0,
                },
                context: operationContext,
            };
            try {
                const kairosError = this.normalizeError(error);
                result.error = kairosError;
                if (this.config.handling.enableRecovery) {
                    operationContext.steps.push('recovery_attempted');
                    result.recovery = await this.errorHandler.handleError(kairosError, context, originalFunction);
                    result.performance.handlingTime = performance.now() - startTime;
                    if (result.recovery.recovered) {
                        result.success = true;
                        result.data = result.recovery.result;
                        operationContext.steps.push('recovery_succeeded');
                        this.logInfo(operationContext, 'error_recovery_succeeded');
                    }
                    else {
                        operationContext.steps.push('recovery_failed');
                        this.logError(kairosError, operationContext, 'error_recovery_failed');
                    }
                }
                else {
                    operationContext.steps.push('recovery_disabled');
                    this.logError(kairosError, operationContext, 'recovery_disabled');
                }
            }
            catch (handlingError) {
                result.error = this.normalizeError(handlingError);
                operationContext.steps.push('error_handling_failed');
                this.logError(result.error, operationContext, 'error_handling_failed');
            }
            result.performance.totalTime = performance.now() - startTime;
            return result;
        }
        getBoundary(component) {
            if (!this.boundaries.has(component)) {
                this.boundaries.set(component, new ErrorBoundary({
                    errorHandler: this.errorHandler,
                }));
            }
            return this.boundaries.get(component);
        }
        createErrorContext(operationConfig) {
            return {
                operation: operationConfig.name,
                component: operationConfig.component,
                input: operationConfig.input,
                timestamp: new Date(),
                metadata: {
                    schema: operationConfig.schema,
                    timeout: operationConfig.timeout,
                    retries: operationConfig.retries,
                },
            };
        }
        normalizeError(error) {
            if (error instanceof KairosBaseError) {
                return error;
            }
            if (error instanceof Error) {
                if (error.name === 'TypeError') {
                    return ErrorFactory.createValidationError('unknown', {}, error.message);
                }
                if (error.name === 'RangeError') {
                    return ErrorFactory.createValidationError('range', {}, error.message);
                }
                return ErrorFactory.createParsingError(error.message, error);
            }
            return ErrorFactory.createParsingError(String(error), new Error(String(error)));
        }
        async withTimeout(promise, timeoutMs, timeoutMessage) {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(timeoutMessage));
                }, timeoutMs);
            });
            return Promise.race([promise, timeoutPromise]);
        }
        logError(error, context, step) {
            if (this.config.reporting.logLevel === 'none')
                return;
            const logData = {
                step,
                component: context.component,
                operation: context.operation,
                timestamp: new Date().toISOString(),
            };
            if (this.config.reporting.includeStackTrace) {
                logData.stack = error.stack;
            }
            if (this.config.reporting.includeContext) {
                logData.context = context;
            }
            console.error(`[ERROR] ${context.component}.${context.operation}: ${error.message}`, logData);
        }
        logInfo(context, message) {
            if (this.config.reporting.logLevel !== 'debug')
                return;
            console.info(`[INFO] ${context.component}.${context.operation}: ${message}`, {
                steps: context.steps,
                timestamp: new Date().toISOString(),
            });
        }
        getErrorStatistics() {
            return {
                handler: this.errorHandler.getErrorMetrics(),
                validator: this.validator.getPerformanceMetrics(),
                boundaries: this.boundaries.size,
                config: this.config,
            };
        }
        updateConfig(config) {
            this.config = this.mergeConfig({ ...this.config, ...config });
            this.setupErrorHandling();
        }
        clearHistory() {
            this.errorHandler.clearHistory();
            this.validator.clearCache();
        }
        createSafeWrapper(fn, operationConfig) {
            return async (...args) => {
                const result = await this.execute({
                    ...operationConfig,
                    input: args,
                    operation: () => fn(...args),
                });
                if (result.success && result.data !== undefined) {
                    return result.data;
                }
                throw result.error || new Error('Operation failed');
            };
        }
        async executeBatch(operations, options = {}) {
            const { parallel = false, failFast = true, continueOnError = false } = options;
            if (parallel) {
                const promises = operations.map((op) => this.execute(op));
                const results = await Promise.allSettled(promises);
                return results.map((result, index) => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    }
                    else {
                        const errorResult = {
                            success: false,
                            error: this.normalizeError(result.reason),
                            performance: { validationTime: 0, handlingTime: 0, totalTime: 0 },
                            context: {
                                operation: operations[index].name,
                                component: operations[index].component,
                                steps: ['batch_failed'],
                            },
                        };
                        if (failFast) {
                            throw errorResult.error;
                        }
                        return errorResult;
                    }
                });
            }
            else {
                const results = [];
                for (const operation of operations) {
                    const result = await this.execute(operation);
                    results.push(result);
                    if (!result.success && !continueOnError && failFast) {
                        throw result.error;
                    }
                }
                return results;
            }
        }
    }
    const globalErrorManager = new ErrorManager();
    async function executeWithErrorHandling(config) {
        return globalErrorManager.execute(config);
    }
    function validateWithErrorHandling(schema, data, context) {
        return globalErrorManager.validate(schema, data, context);
    }
    async function handleWithErrorRecovery(error, context, originalFunction) {
        return globalErrorManager.handleError(error, context, originalFunction);
    }

    const VERSION = '1.1.0';
    const AUTHOR = 'Ersin Koc';
    const REPOSITORY = 'https://github.com/ersinkoc/kairos';
    const HOMEPAGE = 'https://github.com/ersinkoc/kairos#readme';
    const DESCRIPTION = 'Revolutionary zero-dependency JavaScript date/time library with modular architecture and dynamic holiday system';
    function setupBasic() {
        const kairos = require('./core/plugin-system.js').default;
        const parseFlexible = require('./plugins/parse/flexible.js').default;
        const parseISO = require('./plugins/parse/iso.js').default;
        const formatTokens = require('./plugins/format/tokens.js').default;
        kairos.use([parseFlexible, parseISO, formatTokens]);
        return kairos;
    }
    function setupWithBusiness() {
        const kairos = require('./core/plugin-system.js').default;
        const businessWorkday = require('./plugins/business/workday.js').default;
        const businessFiscal = require('./plugins/business/fiscal.js').default;
        const holidayEngine = require('./plugins/holiday/engine.js').default;
        kairos.use([businessWorkday, businessFiscal, holidayEngine]);
        return kairos;
    }
    function setupWithLocales() {
        const kairos = require('./core/plugin-system.js').default;
        const localeUS = require('./plugins/locale/en-US/index.js').default;
        const localeDE = require('./plugins/locale/de-DE/index.js').default;
        const localeTR = require('./plugins/locale/tr-TR/index.js').default;
        const localeJP = require('./plugins/locale/ja-JP/index.js').default;
        const localeFR = require('./plugins/locale/fr-FR/index.js').default;
        const localeES = require('./plugins/locale/es-ES/index.js').default;
        const localeIT = require('./plugins/locale/it-IT/index.js').default;
        const localePT = require('./plugins/locale/pt-BR/index.js').default;
        const localeRU = require('./plugins/locale/ru-RU/index.js').default;
        const localeCN = require('./plugins/locale/zh-CN/index.js').default;
        kairos.use([
            localeUS,
            localeDE,
            localeTR,
            localeJP,
            localeFR,
            localeES,
            localeIT,
            localePT,
            localeRU,
            localeCN,
        ]);
        kairos.locale('en-US');
        return kairos;
    }
    function setupFull() {
        const kairos = require('./core/plugin-system.js').default;
        const holidayEngine = require('./plugins/holiday/engine.js').default;
        const businessWorkday = require('./plugins/business/workday.js').default;
        const businessFiscal = require('./plugins/business/fiscal.js').default;
        const relativeTimePlugin = require('./plugins/relative/relative-time.js').default;
        const calendarPlugin = require('./plugins/calendar/calendar.js').default;
        const durationPlugin = require('./plugins/duration/duration.js').default;
        const rangePlugin = require('./plugins/range/range.js').default;
        const timezonePlugin = require('./plugins/timezone/timezone.js').default;
        const parseFlexible = require('./plugins/parse/flexible.js').default;
        const parseISO = require('./plugins/parse/iso.js').default;
        const parseRFC2822 = require('./plugins/parse/rfc2822.js').default;
        const parseUnix = require('./plugins/parse/unix.js').default;
        const formatTokens = require('./plugins/format/tokens.js').default;
        const localeUS = require('./plugins/locale/en-US/index.js').default;
        const localeDE = require('./plugins/locale/de-DE/index.js').default;
        const localeTR = require('./plugins/locale/tr-TR/index.js').default;
        const localeJP = require('./plugins/locale/ja-JP/index.js').default;
        const localeFR = require('./plugins/locale/fr-FR/index.js').default;
        const localeES = require('./plugins/locale/es-ES/index.js').default;
        const localeIT = require('./plugins/locale/it-IT/index.js').default;
        const localePT = require('./plugins/locale/pt-BR/index.js').default;
        const localeRU = require('./plugins/locale/ru-RU/index.js').default;
        const localeCN = require('./plugins/locale/zh-CN/index.js').default;
        const fixedCalculator = require('./plugins/holiday/calculators/fixed.js').default;
        const nthWeekdayCalculator = require('./plugins/holiday/calculators/nth-weekday.js').default;
        const easterCalculator = require('./plugins/holiday/calculators/easter.js').default;
        const lunarCalculator = require('./plugins/holiday/calculators/lunar.js').default;
        const relativeCalculator = require('./plugins/holiday/calculators/relative.js').default;
        const customCalculator = require('./plugins/holiday/calculators/custom.js').default;
        kairos.use([
            holidayEngine,
            fixedCalculator,
            nthWeekdayCalculator,
            easterCalculator,
            lunarCalculator,
            relativeCalculator,
            customCalculator,
            businessWorkday,
            businessFiscal,
            relativeTimePlugin,
            calendarPlugin,
            durationPlugin,
            rangePlugin,
            timezonePlugin,
            parseFlexible,
            parseISO,
            parseRFC2822,
            parseUnix,
            formatTokens,
            localeUS,
            localeDE,
            localeTR,
            localeJP,
            localeFR,
            localeES,
            localeIT,
            localePT,
            localeRU,
            localeCN,
        ]);
        kairos.locale('en-US');
        return kairos;
    }

    exports.AUTHOR = AUTHOR;
    exports.AdvancedErrorHandler = AdvancedErrorHandler;
    exports.AdvancedValidator = AdvancedValidator;
    exports.BusinessDayCalculator = BusinessDayCalculator;
    exports.CalendarCalculator = CalendarCalculator;
    exports.CustomCalculator = CustomCalculator;
    exports.CustomCalculatorUtils = CustomCalculatorUtils;
    exports.DESCRIPTION = DESCRIPTION;
    exports.EasterCalculator = EasterCalculator;
    exports.ErrorBoundary = ErrorBoundary;
    exports.ErrorFactory = ErrorFactory;
    exports.ErrorHandler = ErrorHandler;
    exports.ErrorManager = ErrorManager;
    exports.ErrorMonitor = ErrorMonitor;
    exports.FORMAT_TOKENS = FORMAT_TOKENS;
    exports.FiscalYearCalculator = FiscalYearCalculator;
    exports.FixedCalculator = FixedCalculator;
    exports.HOMEPAGE = HOMEPAGE;
    exports.InvalidDateError = InvalidDateError;
    exports.InvalidFormatError = InvalidFormatError;
    exports.InvalidLocaleError = InvalidLocaleError;
    exports.InvalidTimezoneError = InvalidTimezoneError;
    exports.KairosBaseError = KairosBaseError;
    exports.LRUCache = LRUCache;
    exports.LunarCalculator = LunarCalculator;
    exports.MemoryMonitor = MemoryMonitor;
    exports.NthWeekdayCalculator = NthWeekdayCalculator;
    exports.ObjectPool = ObjectPool;
    exports.PluginError = PluginError;
    exports.REPOSITORY = REPOSITORY;
    exports.RelativeCalculator = RelativeCalculator;
    exports.RelativeTimeCalculator = RelativeTimeCalculator;
    exports.VERSION = VERSION;
    exports.ValidationError = ValidationError;
    exports.allGermanHolidays = allHolidays$7;
    exports.allJapaneseHolidays = allHolidays$6;
    exports.allTurkishHolidays = allHolidays$8;
    exports.allUSHolidays = allHolidays$9;
    exports.businessFiscal = fiscal;
    exports.businessWorkday = workday;
    exports.calendarPlugin = calendarPlugin;
    exports.createBusinessDayId = createBusinessDayId;
    exports.createCustomValidator = createCustomValidator;
    exports.createDateCache = createDateCache;
    exports.createDateString = createDateString;
    exports.createDay = createDay;
    exports.createDayOfWeek = createDayOfWeek;
    exports.createDayOfYear = createDayOfYear;
    exports.createFormatString = createFormatString;
    exports.createHolidayCache = createHolidayCache;
    exports.createHolidayId = createHolidayId;
    exports.createHour = createHour;
    exports.createLocaleCode = createLocaleCode;
    exports.createMillisecond = createMillisecond;
    exports.createMinute = createMinute;
    exports.createMonth = createMonth;
    exports.createPool = createPool;
    exports.createSecond = createSecond;
    exports.createTimeZone = createTimeZone;
    exports.createTimestamp = createTimestamp;
    exports.createWeekOfYear = createWeekOfYear;
    exports.createYear = createYear;
    exports.customCalculator = custom;
    exports.datePool = datePool;
    exports["default"] = kairos;
    exports.easterCalculator = easter;
    exports.executeWithErrorHandling = executeWithErrorHandling;
    exports.fixedCalculator = fixed;
    exports.germanFederalHolidays = federalHolidays;
    exports.germanHistoricalHolidays = historicalHolidays$1;
    exports.germanHolidays = holidays$7;
    exports.germanStateHolidays = stateHolidays;
    exports.globalErrorHandler = globalErrorHandler;
    exports.globalErrorManager = globalErrorManager;
    exports.globalErrorMonitor = globalErrorMonitor;
    exports.globalMemoryMonitor = globalMemoryMonitor;
    exports.globalPoolManager = globalPoolManager;
    exports.globalValidator = globalValidator;
    exports.handleError = handleError;
    exports.handleWithErrorRecovery = handleWithErrorRecovery;
    exports.holidayEngine = engine$1;
    exports.isDay = isDay;
    exports.isDayOfWeek = isDayOfWeek;
    exports.isDayOfYear = isDayOfYear;
    exports.isFormatString = isFormatString;
    exports.isHour = isHour;
    exports.isLocaleCode = isLocaleCode;
    exports.isMillisecond = isMillisecond;
    exports.isMinute = isMinute;
    exports.isMonth = isMonth;
    exports.isSecond = isSecond;
    exports.isTimestamp = isTimestamp;
    exports.isValidDate = isValidDate;
    exports.isValidDay = isValidDay$1;
    exports.isValidDayOfWeek = isValidDayOfWeek;
    exports.isValidDayOfYear = isValidDayOfYear;
    exports.isValidFormatString = isValidFormatString;
    exports.isValidHour = isValidHour;
    exports.isValidLocaleCode = isValidLocaleCode;
    exports.isValidMillisecond = isValidMillisecond;
    exports.isValidMinute = isValidMinute;
    exports.isValidMonth = isValidMonth$1;
    exports.isValidNth = isValidNth;
    exports.isValidNumber = isValidNumber;
    exports.isValidSecond = isValidSecond;
    exports.isValidString = isValidString;
    exports.isValidTimestamp = isValidTimestamp;
    exports.isValidWeekOfYear = isValidWeekOfYear;
    exports.isValidWeekday = isValidWeekday;
    exports.isValidYear = isValidYear$1;
    exports.isWeekOfYear = isWeekOfYear;
    exports.isYear = isYear;
    exports.japaneseGoldenWeekHolidays = goldenWeekHolidays;
    exports.japaneseHeiseiHolidays = heiseiHolidays;
    exports.japaneseHistoricalHolidays = historicalHolidays;
    exports.japaneseHolidays = holidays$6;
    exports.japaneseObservances = observances$6;
    exports.japanesePublicHolidays = publicHolidays;
    exports.japaneseReiwaHolidays = reiwaHolidays;
    exports.localeCN = index;
    exports.localeDE = index$7;
    exports.localeES = index$4;
    exports.localeFR = index$5;
    exports.localeIT = index$3;
    exports.localeJP = index$6;
    exports.localePT = index$2;
    exports.localeRU = index$1;
    exports.localeTR = index$8;
    exports.localeUS = index$9;
    exports.lunarCalculator = lunar;
    exports.memoize = memoize;
    exports.nthWeekdayCalculator = nthWeekday;
    exports.relativeCalculator = relative;
    exports.relativeTimePlugin = relativeTimePlugin;
    exports.setupBasic = setupBasic;
    exports.setupFull = setupFull;
    exports.setupWithBusiness = setupWithBusiness;
    exports.setupWithLocales = setupWithLocales;
    exports.throwError = throwError;
    exports.toDay = toDay;
    exports.toDayOfWeek = toDayOfWeek;
    exports.toDayOfYear = toDayOfYear;
    exports.toFormatString = toFormatString;
    exports.toHour = toHour;
    exports.toLocaleCode = toLocaleCode;
    exports.toMillisecond = toMillisecond;
    exports.toMinute = toMinute;
    exports.toMonth = toMonth;
    exports.toSecond = toSecond;
    exports.toTimestamp = toTimestamp;
    exports.toWeekOfYear = toWeekOfYear;
    exports.toYear = toYear;
    exports.turkishHistoricalHolidays = historicalHolidays$2;
    exports.turkishHolidays = holidays$8;
    exports.turkishObservances = observances$7;
    exports.turkishPublicHolidays = publicHolidays$1;
    exports.usFederalHolidays = federalHolidays$1;
    exports.usHolidays = holidays$9;
    exports.usStateHolidays = stateHolidays$1;
    exports.validateDateComponents = validateDateComponents;
    exports.validateHolidayRule = validateHolidayRule$1;
    exports.validateHolidayRuleAdvanced = validateHolidayRule;
    exports.validateWithErrorHandling = validateWithErrorHandling;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, events);
//# sourceMappingURL=kairos.iife.js.map
