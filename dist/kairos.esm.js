/*!
 * Kairos v1.0.0
 * (c) 2025 Ersin Koc
 * Released under the MIT License
 * https://github.com/ersinkoc/kairos
 */
class LRUCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
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
    }
    size() {
        return this.cache.size;
    }
}
function memoize(fn, keyGenerator) {
    const cache = new LRUCache();
    return ((...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
}
function createDateCache() {
    return new LRUCache(10000);
}
function createHolidayCache() {
    return new LRUCache(5000);
}

function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
function isValidString(value) {
    return typeof value === 'string' && value.length > 0;
}
function isValidYear(year) {
    return isValidNumber(year) && year >= 1000 && year <= 9999;
}
function isValidMonth(month) {
    return isValidNumber(month) && month >= 1 && month <= 12;
}
function isValidDay(day) {
    return isValidNumber(day) && day >= 1 && day <= 31;
}
function isValidWeekday(weekday) {
    return isValidNumber(weekday) && weekday >= 0 && weekday <= 6;
}
function isValidNth(nth) {
    return isValidNumber(nth) && ((nth >= 1 && nth <= 5) || nth === -1);
}
function validateHolidayRule(rule) {
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
            if (!isValidMonth(rule.rule.month)) {
                errors.push('Fixed rule month must be 1-12');
            }
            if (!isValidDay(rule.rule.day)) {
                errors.push('Fixed rule day must be 1-31');
            }
            break;
        case 'nth-weekday':
            if (!isValidMonth(rule.rule.month)) {
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
            if (!isValidMonth(rule.rule.month)) {
                errors.push('Lunar rule month must be 1-12');
            }
            if (!isValidDay(rule.rule.day)) {
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
class KairosCore {
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
            if (isDateLike(input) && input.date instanceof Date) {
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
const kairos = (input) => new KairosCore(input);
kairos.use = PluginSystem.use.bind(PluginSystem);
kairos.extend = PluginSystem.extend.bind(PluginSystem);
kairos.addStatic = PluginSystem.addStatic.bind(PluginSystem);
kairos.plugins = PluginSystem.plugins;
kairos.utc = (input) => {
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
    registerCalculator(type, calculator) {
        this.calculators.set(type, calculator);
    }
    calculate(rule, year) {
        const errors = validateHolidayRule(rule);
        if (errors.length > 0) {
            throw new Error(`Invalid holiday rule: ${errors.join(', ')}`);
        }
        if (!this.ruleCache.has(rule.name || 'unnamed')) {
            this.ruleCache.set(rule.name || 'unnamed', new Map());
        }
        const yearCache = this.ruleCache.get(rule.name || 'unnamed');
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
            const isWeekend = observedRule.weekends?.includes(weekday) || weekday === 0 || weekday === 6;
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
        const errors = validateHolidayRule(rule);
        if (errors.length > 0) {
            throw new Error(`Invalid holiday rule: ${errors.join(', ')}`);
        }
        if (!this.ruleCache.has(rule.name || 'unnamed')) {
            this.ruleCache.set(rule.name || 'unnamed', new Map());
        }
        const yearCache = this.ruleCache.get(rule.name || 'unnamed');
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
        const b = (4 * a + 3) / 146097;
        const c = a - Math.floor((146097 * b) / 4);
        const d = (4 * c + 3) / 1461;
        const e = c - Math.floor((1461 * d) / 4);
        const m = (5 * e + 2) / 153;
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
        const b = (4 * a + 3) / 146097;
        const c = a - Math.floor((146097 * b) / 4);
        const d = (4 * c + 3) / 1461;
        const e = c - Math.floor((1461 * d) / 4);
        const m = (5 * e + 2) / 153;
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
        const newYearOffset = Math.floor(Math.random() * 30) + 21;
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
    }
    calculate(rule, year, context) {
        const { relativeTo, offset } = rule.rule;
        if (context?.holidays) {
            this.allHolidays = context.holidays;
        }
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
            baseHoliday = this.allHolidays.find((h) => h.name.toLowerCase() === relativeTo.toLowerCase());
        }
        return baseHoliday || null;
    }
    calculateBaseHolidayDates(baseHoliday, year) {
        if (baseHoliday.type === 'relative') {
            throw new Error(`Circular dependency detected: ${baseHoliday.name} cannot be relative to another relative holiday`);
        }
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
        return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    },
    getDSTTransition(year, type) {
        if (type === 'spring') {
            return this.findWeekdayInMonth(year, 2, 0, 'first');
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
    nextBusinessDay(date) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        while (!this.isBusinessDay(next)) {
            next.setDate(next.getDate() + 1);
        }
        return next;
    }
    previousBusinessDay(date) {
        const prev = new Date(date);
        prev.setDate(prev.getDate() - 1);
        while (!this.isBusinessDay(prev)) {
            prev.setDate(prev.getDate() - 1);
        }
        return prev;
    }
    addBusinessDays(date, days) {
        if (days === 0)
            return new Date(date);
        const current = new Date(date);
        let count = 0;
        const direction = days > 0 ? 1 : -1;
        const target = Math.abs(days);
        while (count < target) {
            current.setDate(current.getDate() + direction);
            if (this.isBusinessDay(current)) {
                count++;
            }
        }
        return current;
    }
    businessDaysBetween(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (startDate.getTime() === endDate.getTime()) {
            return 0;
        }
        const isForward = startDate < endDate;
        const direction = isForward ? 1 : -1;
        let count = 0;
        const current = new Date(startDate);
        while (current.getTime() !== endDate.getTime()) {
            current.setDate(current.getDate() + direction);
            if (this.isBusinessDay(current)) {
                count++;
            }
        }
        return count * direction;
    }
    businessDaysInMonth(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return this.businessDaysBetween(firstDay, lastDay) + (this.isBusinessDay(firstDay) ? 1 : 0);
    }
    businessDaysInYear(year) {
        const firstDay = new Date(year, 0, 1);
        const lastDay = new Date(year, 11, 31);
        return this.businessDaysBetween(firstDay, lastDay) + (this.isBusinessDay(firstDay) ? 1 : 0);
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
        const quarterStartMonth = (startMonth - 1 + (quarter - 1) * 3) % 12;
        const quarterStartYear = quarter === 1
            ? fiscalYear
            : startMonth + (quarter - 1) * 3 > 12
                ? fiscalYear + 1
                : fiscalYear;
        return new Date(quarterStartYear, quarterStartMonth, 1);
    }
    getFiscalQuarterEnd(fiscalYear, quarter) {
        const startMonth = this.getStartMonth();
        const quarterEndMonth = (startMonth - 1 + quarter * 3 - 1) % 12;
        const quarterEndYear = quarter === 1 ? fiscalYear : startMonth + quarter * 3 - 1 > 12 ? fiscalYear + 1 : fiscalYear;
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
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        return Math.floor(diff / 86400000);
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
                const clone = this.clone();
                const yearStart = new Date(clone.year(), 0, 1);
                yearStart.setDate(value);
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

const holidays$3 = [
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
const federalHolidays$1 = holidays$3.filter((h) => [
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
].includes(h.id));
const allHolidays$3 = [...holidays$3, ...Object.values(stateHolidays$1).flat()];

const locale$3 = {
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
var index$3 = {
    name: 'locale-en-US',
    version: '1.0.0',
    size: 1024,
    dependencies: ['holiday-engine'],
    locale: locale$3,
    install(kairos, _utils) {
        localeManager.register('en-US', {
            ...locale$3,
            holidays: holidays$3,
            federalHolidays: federalHolidays$1,
            stateHolidays: stateHolidays$1,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['en-US'] = locale$3;
        kairos.extend({
            getUSHolidays(state) {
                if (state) {
                    const stateLower = state.toLowerCase();
                    const stateHols = stateHolidays$1[stateLower];
                    if (stateHols) {
                        return [...federalHolidays$1, ...stateHols];
                    }
                }
                return holidays$3;
            },
            getFederalHolidays() {
                return federalHolidays$1;
            },
            getStateHolidays(state) {
                return stateHolidays$1[state.toLowerCase()] || [];
            },
            getAllUSHolidays() {
                return allHolidays$3;
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

const holidays$2 = [
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
const observances$1 = [
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
const allHolidays$2 = [...holidays$2, ...observances$1, ...historicalHolidays$2];
const publicHolidays$1 = holidays$2.filter((h) => [
    'new-years-day',
    'national-sovereignty-day',
    'labor-day',
    'ataturk-commemoration-day',
    'democracy-day',
    'victory-day',
    'republic-day',
    'ramadan-feast',
    'sacrifice-feast',
].includes(h.id));

const locale$2 = {
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
var index$2 = {
    name: 'locale-tr-TR',
    version: '1.0.0',
    size: 1536,
    dependencies: ['holiday-engine'],
    locale: locale$2,
    install(kairos, _utils) {
        localeManager.register('tr-TR', {
            ...locale$2,
            holidays: holidays$2,
            publicHolidays: publicHolidays$1,
            observances: observances$1,
            historicalHolidays: historicalHolidays$2,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['tr-TR'] = locale$2;
        kairos.extend({
            getTurkishHolidays(type) {
                switch (type) {
                    case 'public':
                        return publicHolidays$1;
                    case 'religious':
                        return holidays$2.filter((h) => h.type === 'lunar' || h.type === 'custom');
                    case 'historical':
                        return historicalHolidays$2;
                    case 'all':
                        return allHolidays$2;
                    default:
                        return holidays$2;
                }
            },
            getPublicHolidays() {
                return publicHolidays$1;
            },
            getReligiousHolidays() {
                return holidays$2.filter((h) => h.type === 'lunar' || h.type === 'custom');
            },
            getObservances() {
                return observances$1;
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
                const ramadanFeast = holidays$2.find((h) => h.id === 'ramadan-feast');
                if (ramadanFeast) {
                    const dates = kairos.holidayEngine.calculate(ramadanFeast, year);
                    return dates.map((date) => kairos(date));
                }
                return [];
            },
            getKurbanBayrami(year) {
                const sacrificeFeast = holidays$2.find((h) => h.id === 'sacrifice-feast');
                if (sacrificeFeast) {
                    const dates = kairos.holidayEngine.calculate(sacrificeFeast, year);
                    return dates.map((date) => kairos(date));
                }
                return [];
            },
            getKandilGecesi(year) {
                const kandilNights = holidays$2.filter((h) => h.name.includes('Kandil') || h.name.includes('Kadir'));
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

const holidays$1 = [
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
const federalHolidays = holidays$1;
const allHolidays$1 = [...holidays$1, ...Object.values(stateHolidays).flat()];
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

const locale$1 = {
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
var index$1 = {
    name: 'locale-de-DE',
    version: '1.0.0',
    size: 2048,
    dependencies: ['holiday-engine'],
    locale: locale$1,
    install(kairos, _utils) {
        localeManager.register('de-DE', {
            ...locale$1,
            holidays: holidays$1,
            federalHolidays,
            stateHolidays: stateHolidays,
            historicalHolidays: historicalHolidays$1,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['de-DE'] = locale$1;
        kairos.extend({
            getGermanHolidays(state) {
                if (state) {
                    const stateLower = state.toLowerCase();
                    const stateHols = stateHolidays[stateLower];
                    if (stateHols) {
                        return [...federalHolidays, ...stateHols];
                    }
                }
                return holidays$1;
            },
            getFederalHolidays() {
                return federalHolidays;
            },
            getStateHolidays(state) {
                return stateHolidays[state.toLowerCase()] || [];
            },
            getAllHolidays() {
                return allHolidays$1;
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
                const easterHolidays = holidays$1.filter((h) => h.type === 'easter-based');
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

const holidays = [
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
const observances = [
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
const goldenWeekHolidays = holidays.filter((h) => [
    'showa-day',
    'constitution-day',
    'greenery-day',
    'childrens-day',
    'golden-week-substitute',
].includes(h.id));
const publicHolidays = holidays.filter((h) => h.id !== 'golden-week-substitute');
const allHolidays = [...holidays, ...observances, ...historicalHolidays];
const reiwaHolidays = holidays.filter((h) => h.id !== 'emperors-birthday-showa' && h.id !== 'emperors-birthday-heisei');
const heiseiHolidays = [
    ...holidays.filter((h) => h.id !== 'emperors-birthday'),
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

const locale = {
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
var index = {
    name: 'locale-ja-JP',
    version: '1.0.0',
    size: 2048,
    dependencies: ['holiday-engine', 'holiday-custom-calculator'],
    locale,
    install(kairos, _utils) {
        localeManager.register('ja-JP', {
            ...locale,
            holidays,
            publicHolidays,
            observances,
            historicalHolidays,
            goldenWeekHolidays,
            reiwaHolidays,
            heiseiHolidays,
        });
        kairos.locales = kairos.locales || {};
        kairos.locales['ja-JP'] = locale;
        kairos.extend({
            getJapaneseHolidays(type) {
                switch (type) {
                    case 'public':
                        return publicHolidays;
                    case 'observances':
                        return observances;
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
                        return allHolidays;
                    default:
                        return holidays;
                }
            },
            getPublicHolidays() {
                return publicHolidays;
            },
            getObservances() {
                return observances;
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
                const holidayInfo = this.getHolidayInfo(observances);
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
                const equinoxHolidays = holidays.filter((h) => ['vernal-equinox-day', 'autumnal-equinox-day'].includes(h.id));
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
                const obon = observances.find((h) => h.id === 'obon');
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
                        return holidays;
                    default:
                        return holidays;
                }
            },
        });
    },
};

const VERSION = '1.0.0';
const AUTHOR = 'Ersin Koc';
const REPOSITORY = 'https://github.com/ersinkoc/kairos';
const HOMEPAGE = 'https://github.com/ersinkoc/kairos#readme';
const DESCRIPTION = 'Revolutionary zero-dependency JavaScript date/time library with modular architecture and dynamic holiday system';
function setupBasic() {
    const kairos = require('./core/plugin-system.js').default;
    return kairos;
}
function setupWithBusiness() {
    const kairos = require('./core/plugin-system.js').default;
    return kairos;
}
function setupWithLocales() {
    const kairos = require('./core/plugin-system.js').default;
    return kairos;
}
function setupFull() {
    const kairos = require('./core/plugin-system.js').default;
    return kairos;
}

export { AUTHOR, BusinessDayCalculator, CalendarCalculator, CustomCalculator, CustomCalculatorUtils, DESCRIPTION, EasterCalculator, FiscalYearCalculator, FixedCalculator, HOMEPAGE, LRUCache, LunarCalculator, NthWeekdayCalculator, REPOSITORY, RelativeCalculator, RelativeTimeCalculator, VERSION, allHolidays$1 as allGermanHolidays, allHolidays as allJapaneseHolidays, allHolidays$2 as allTurkishHolidays, allHolidays$3 as allUSHolidays, fiscal as businessFiscal, workday as businessWorkday, calendarPlugin, createDateCache, createHolidayCache, custom as customCalculator, kairos as default, easter as easterCalculator, fixed as fixedCalculator, federalHolidays as germanFederalHolidays, historicalHolidays$1 as germanHistoricalHolidays, holidays$1 as germanHolidays, stateHolidays as germanStateHolidays, engine$1 as holidayEngine, isValidDate, isValidDay, isValidMonth, isValidNth, isValidNumber, isValidString, isValidWeekday, isValidYear, goldenWeekHolidays as japaneseGoldenWeekHolidays, heiseiHolidays as japaneseHeiseiHolidays, historicalHolidays as japaneseHistoricalHolidays, holidays as japaneseHolidays, observances as japaneseObservances, publicHolidays as japanesePublicHolidays, reiwaHolidays as japaneseReiwaHolidays, index$1 as localeDE, index as localeJP, index$2 as localeTR, index$3 as localeUS, lunar as lunarCalculator, memoize, nthWeekday as nthWeekdayCalculator, relative as relativeCalculator, relativeTimePlugin, setupBasic, setupFull, setupWithBusiness, setupWithLocales, throwError, historicalHolidays$2 as turkishHistoricalHolidays, holidays$2 as turkishHolidays, observances$1 as turkishObservances, publicHolidays$1 as turkishPublicHolidays, federalHolidays$1 as usFederalHolidays, holidays$3 as usHolidays, stateHolidays$1 as usStateHolidays, validateHolidayRule };
//# sourceMappingURL=kairos.esm.js.map
