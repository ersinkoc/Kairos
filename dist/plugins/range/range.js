export class DateRange {
    constructor(start, end, unit = 'day', step = 1) {
        this.start = new Date(start);
        this.end = new Date(end);
        this.unit = unit;
        this.step = step;
    }
    *[Symbol.iterator]() {
        let current = new Date(this.start);
        while (current <= this.end) {
            yield new Date(current);
            current = this.addUnit(current, this.unit, this.step);
        }
    }
    toArray() {
        return Array.from(this);
    }
    map(callback) {
        const result = [];
        let index = 0;
        for (const date of this) {
            result.push(callback(date, index++));
        }
        return result;
    }
    filter(callback) {
        const result = [];
        let index = 0;
        for (const date of this) {
            if (callback(date, index++)) {
                result.push(date);
            }
        }
        return result;
    }
    find(callback) {
        let index = 0;
        for (const date of this) {
            if (callback(date, index++)) {
                return date;
            }
        }
        return undefined;
    }
    every(callback) {
        let index = 0;
        for (const date of this) {
            if (!callback(date, index++)) {
                return false;
            }
        }
        return true;
    }
    some(callback) {
        let index = 0;
        for (const date of this) {
            if (callback(date, index++)) {
                return true;
            }
        }
        return false;
    }
    reduce(callback, initialValue) {
        let accumulator = initialValue;
        let index = 0;
        for (const date of this) {
            accumulator = callback(accumulator, date, index++);
        }
        return accumulator;
    }
    count() {
        let count = 0;
        for (const _ of this) {
            count++;
        }
        return count;
    }
    businessDays() {
        return this.filter((date) => {
            const day = date.getDay();
            return day !== 0 && day !== 6;
        });
    }
    weekends() {
        return this.filter((date) => {
            const day = date.getDay();
            return day === 0 || day === 6;
        });
    }
    weekday(weekday) {
        return this.filter((date) => date.getDay() === weekday);
    }
    month(month) {
        return this.filter((date) => date.getMonth() === month - 1);
    }
    year(year) {
        return this.filter((date) => date.getFullYear() === year);
    }
    chunk(size) {
        const dates = this.toArray();
        const chunks = [];
        for (let i = 0; i < dates.length; i += size) {
            const chunkDates = dates.slice(i, i + size);
            if (chunkDates.length > 0) {
                chunks.push(new DateRange(chunkDates[0], chunkDates[chunkDates.length - 1], this.unit, this.step));
            }
        }
        return chunks;
    }
    includes(date) {
        return date >= this.start && date <= this.end;
    }
    contains(date) {
        return this.includes(date);
    }
    getStart() {
        return new Date(this.start);
    }
    getEnd() {
        return new Date(this.end);
    }
    overlaps(other) {
        return this.start <= other.end && this.end >= other.start;
    }
    intersection(other) {
        const start = new Date(Math.max(this.start.getTime(), other.start.getTime()));
        const end = new Date(Math.min(this.end.getTime(), other.end.getTime()));
        if (start <= end) {
            return new DateRange(start, end, this.unit, this.step);
        }
        return null;
    }
    union(other) {
        if (this.overlaps(other) || this.isAdjacent(other)) {
            const start = new Date(Math.min(this.start.getTime(), other.start.getTime()));
            const end = new Date(Math.max(this.end.getTime(), other.end.getTime()));
            return new DateRange(start, end, this.unit, this.step);
        }
        return null;
    }
    isAdjacent(other) {
        const nextDay = new Date(this.end);
        nextDay.setDate(nextDay.getDate() + 1);
        const prevDay = new Date(this.start);
        prevDay.setDate(prevDay.getDate() - 1);
        return nextDay.getTime() === other.start.getTime() || prevDay.getTime() === other.end.getTime();
    }
    duration() {
        return this.end.getTime() - this.start.getTime();
    }
    durationIn(unit) {
        const ms = this.duration();
        switch (unit) {
            case 'millisecond':
            case 'milliseconds':
            case 'ms':
                return ms;
            case 'second':
            case 'seconds':
            case 's':
                return ms / 1000;
            case 'minute':
            case 'minutes':
            case 'm':
                return ms / (1000 * 60);
            case 'hour':
            case 'hours':
            case 'h':
                return ms / (1000 * 60 * 60);
            case 'day':
            case 'days':
            case 'd':
                return ms / (1000 * 60 * 60 * 24);
            case 'week':
            case 'weeks':
            case 'w':
                return ms / (1000 * 60 * 60 * 24 * 7);
            case 'month':
            case 'months':
            case 'M':
                return ms / (1000 * 60 * 60 * 24 * 30.44);
            case 'year':
            case 'years':
            case 'y':
                return ms / (1000 * 60 * 60 * 24 * 365.25);
            default:
                return ms;
        }
    }
    addUnit(date, unit, amount) {
        const result = new Date(date);
        switch (unit) {
            case 'year':
            case 'years':
            case 'y':
                result.setFullYear(result.getFullYear() + amount);
                break;
            case 'month':
            case 'months':
            case 'M':
                result.setMonth(result.getMonth() + amount);
                break;
            case 'week':
            case 'weeks':
            case 'w':
                result.setDate(result.getDate() + amount * 7);
                break;
            case 'day':
            case 'days':
            case 'd':
                result.setDate(result.getDate() + amount);
                break;
            case 'hour':
            case 'hours':
            case 'h':
                result.setHours(result.getHours() + amount);
                break;
            case 'minute':
            case 'minutes':
            case 'm':
                result.setMinutes(result.getMinutes() + amount);
                break;
            case 'second':
            case 'seconds':
            case 's':
                result.setSeconds(result.getSeconds() + amount);
                break;
            case 'millisecond':
            case 'milliseconds':
            case 'ms':
                result.setMilliseconds(result.getMilliseconds() + amount);
                break;
        }
        return result;
    }
}
export default {
    name: 'range',
    version: '1.0.0',
    size: 3072,
    install(kairos) {
        kairos.extend({
            range(end, unit = 'day', step = 1) {
                return new DateRange(this.toDate(), end.toDate(), unit, step);
            },
            until(end, unit = 'day') {
                return new DateRange(this.toDate(), end.toDate(), unit).toArray();
            },
            since(start, unit = 'day') {
                return new DateRange(start.toDate(), this.toDate(), unit).toArray();
            },
            datesInMonth() {
                const start = this.clone().date(1);
                const end = this.clone().add(1, 'month').date(1).subtract(1, 'day');
                return new DateRange(start.toDate(), end.toDate()).toArray();
            },
            datesInYear() {
                const start = this.clone().month(1).date(1);
                const end = this.clone().add(1, 'year').month(1).date(1).subtract(1, 'day');
                return new DateRange(start.toDate(), end.toDate()).toArray();
            },
            businessDaysInCurrentMonth() {
                const start = this.clone().date(1);
                const end = this.clone().add(1, 'month').date(1).subtract(1, 'day');
                return new DateRange(start.toDate(), end.toDate()).businessDays();
            },
            rangeFor(amount, unit) {
                const end = this.add(amount, unit);
                return new DateRange(this.toDate(), end.toDate());
            },
            businessDaysUntil(end) {
                return new DateRange(this.toDate(), end.toDate()).businessDays();
            },
            datesInWeek() {
                const currentDay = this.day();
                const startOfWeek = this.clone().subtract(currentDay, 'days');
                const endOfWeek = startOfWeek.clone().add(6, 'days');
                return new DateRange(startOfWeek.toDate(), endOfWeek.toDate()).toArray();
            },
        });
        kairos.addStatic?.({
            range(start, end, unit = 'day', step = 1) {
                const startDate = kairos(start);
                const endDate = kairos(end);
                return new DateRange(startDate.toDate(), endDate.toDate(), unit, step);
            },
            monthRange(year, month) {
                const start = new Date(year, month - 1, 1);
                const end = new Date(year, month, 0);
                return new DateRange(start, end);
            },
            yearRange(year) {
                const start = new Date(year, 0, 1);
                const end = new Date(year, 11, 31);
                return new DateRange(start, end);
            },
            next(amount, unit) {
                const start = new Date();
                const end = kairos(start).add(amount, unit).toDate();
                return new DateRange(start, end);
            },
            previous(amount, unit) {
                const end = new Date();
                const start = kairos(end).subtract(amount, unit).toDate();
                return new DateRange(start, end);
            },
            createRange: (start, end, unit, step) => new DateRange(start, end, unit, step),
        });
    },
};
//# sourceMappingURL=range.js.map