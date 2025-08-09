export class CustomCalculator {
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
export const CustomCalculatorUtils = {
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
export default {
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
//# sourceMappingURL=custom.js.map