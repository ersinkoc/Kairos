import { LRUCache, memoize, memoizeDate } from './utils/cache.js';
import { globalPoolManager, datePool } from './utils/object-pool.js';
import { globalMemoryMonitor } from './utils/memory-monitor.js';
import { throwError } from './utils/validators.js';
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
export class KairosCore {
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
export class PluginSystem {
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
export default kairos;
//# sourceMappingURL=plugin-system.js.map