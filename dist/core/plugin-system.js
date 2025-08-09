import { LRUCache, memoize } from './utils/cache.js';
import { throwError } from './utils/validators.js';
const globalCache = new LRUCache(1000);
export class KairosCore {
    constructor(input) {
        this._date = this.parseInput(input);
    }
    parseInput(input) {
        if (input === undefined) {
            return new Date();
        }
        if (input instanceof Date) {
            return new Date(input.getTime());
        }
        if (typeof input === 'number') {
            if (isNaN(input)) {
                return new Date(NaN);
            }
            return new Date(input);
        }
        if (typeof input === 'string') {
            if (input.toLowerCase() === 'invalid' || input === '') {
                return new Date(NaN);
            }
            const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
            if (dateOnlyPattern.test(input)) {
                const [year, month, day] = input.split('-').map(Number);
                if (month < 1 || month > 12) {
                    return new Date(NaN);
                }
                const date = new Date(year, month - 1, day, 0, 0, 0, 0);
                if (date.getFullYear() !== year ||
                    date.getMonth() !== month - 1 ||
                    date.getDate() !== day) {
                    return new Date(NaN);
                }
                return date;
            }
            const europeanPattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
            if (europeanPattern.test(input)) {
                const match = input.match(europeanPattern);
                if (match) {
                    const day = parseInt(match[1], 10);
                    const month = parseInt(match[2], 10);
                    const year = parseInt(match[3], 10);
                    if (month < 1 || month > 12 || day < 1 || day > 31) {
                        return new Date(NaN);
                    }
                    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
                    if (date.getFullYear() !== year ||
                        date.getMonth() !== month - 1 ||
                        date.getDate() !== day) {
                        return new Date(NaN);
                    }
                    return date;
                }
            }
            const parsed = new Date(input);
            if (isNaN(parsed.getTime())) {
                if (KairosCore.config.strict) {
                    throwError(`Invalid date string: ${input}`, 'INVALID_DATE');
                }
                return new Date(NaN);
            }
            return parsed;
        }
        if (input && typeof input === 'object') {
            if ('_date' in input && input._date instanceof Date) {
                return new Date(input._date.getTime());
            }
            if (typeof input.toDate === 'function') {
                return input.toDate();
            }
            if ('year' in input && 'month' in input && 'day' in input) {
                const obj = input;
                const year = obj.year;
                const month = obj.month - 1;
                const day = obj.day;
                const hour = obj.hour || 0;
                const minute = obj.minute || 0;
                const second = obj.second || 0;
                const millisecond = obj.millisecond || 0;
                const date = new Date(year, month, day, hour, minute, second, millisecond);
                if (date.getFullYear() !== year ||
                    date.getMonth() !== month ||
                    date.getDate() !== day) {
                    return new Date(NaN);
                }
                return date;
            }
            if ('date' in input) {
                const dateValue = input.date;
                if (dateValue instanceof Date) {
                    return new Date(dateValue.getTime());
                }
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
            case 'week':
                const day = clone._date.getDay();
                clone._date.setDate(clone._date.getDate() - day);
                clone._date.setHours(0, 0, 0, 0);
                break;
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
            case 'week':
                const day = clone._date.getDay();
                clone._date.setDate(clone._date.getDate() + (6 - day));
                clone._date.setHours(23, 59, 59, 999);
                break;
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
const kairos = (input) => new KairosCore(input);
kairos.use = PluginSystem.use.bind(PluginSystem);
kairos.extend = PluginSystem.extend.bind(PluginSystem);
kairos.addStatic = PluginSystem.addStatic.bind(PluginSystem);
kairos.plugins = PluginSystem.plugins;
kairos.utc = (input) => {
    let utcDate;
    if (typeof input === 'string' && !input.endsWith('Z') && !input.includes('+') && !/[+-]\d{2}:?\d{2}$/.test(input)) {
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