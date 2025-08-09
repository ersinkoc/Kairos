import { createHolidayCache } from '../../core/utils/cache.js';
import { validateHolidayRule } from '../../core/utils/validators.js';
import { localeManager } from '../../core/locale-manager.js';
export class HolidayEngine {
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
export default {
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
//# sourceMappingURL=engine.js.map