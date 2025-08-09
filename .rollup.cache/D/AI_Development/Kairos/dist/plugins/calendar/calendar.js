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
                return kairos(new Date(this.year(), month, 1))
                    .startOf('day');
            },
            endOfQuarter() {
                const quarter = this.quarter();
                const month = quarter * 3;
                return kairos(new Date(this.year(), month, 0))
                    .endOf('day');
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
                return this.quarter() === other.quarter() &&
                    this.year() === other.year();
            },
            isSameWeek(other, startDay = 0) {
                const thisStart = this.startOfWeek(startDay);
                const otherStart = other.startOfWeek(startDay);
                return thisStart.format('YYYY-MM-DD') === otherStart.format('YYYY-MM-DD');
            },
            isSameISOWeek(other) {
                return this.isoWeek() === other.isoWeek() &&
                    this.isoWeekYear() === other.isoWeekYear();
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
export default calendarPlugin;
export { CalendarCalculator };
//# sourceMappingURL=calendar.js.map