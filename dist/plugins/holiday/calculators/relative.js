export class RelativeCalculator {
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
export default {
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
//# sourceMappingURL=relative.js.map