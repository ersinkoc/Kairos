export class LunarCalculator {
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
export default {
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
//# sourceMappingURL=lunar.js.map