export class EasterCalculator {
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
export default {
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
//# sourceMappingURL=easter.js.map