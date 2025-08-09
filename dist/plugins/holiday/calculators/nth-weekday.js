export class NthWeekdayCalculator {
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
export default {
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
//# sourceMappingURL=nth-weekday.js.map