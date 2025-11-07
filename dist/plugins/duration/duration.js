export class Duration {
    constructor(input) {
        this.ms = 0;
        this._years = 0;
        this._months = 0;
        this._weeks = 0;
        this._days = 0;
        this._hours = 0;
        this._minutes = 0;
        this._seconds = 0;
        this._milliseconds = 0;
        if (typeof input === 'number') {
            this.ms = input;
            this._milliseconds = input;
        }
        else if (typeof input === 'string') {
            const parsed = this.parseStringToObject(input);
            this.setFromObject(parsed);
        }
        else {
            this.setFromObject(input);
        }
    }
    setFromObject(obj) {
        this._years = obj.years || 0;
        this._months = obj.months || 0;
        this._weeks = obj.weeks || 0;
        this._days = obj.days || 0;
        this._hours = obj.hours || 0;
        this._minutes = obj.minutes || 0;
        this._seconds = obj.seconds || 0;
        this._milliseconds = obj.milliseconds || 0;
        this.ms = this.parseObject(obj);
    }
    parseStringToObject(input) {
        const weekOnlyMatch = input.match(/^P(\d+)W$/);
        if (weekOnlyMatch) {
            return {
                weeks: parseInt(weekOnlyMatch[1], 10),
            };
        }
        const isoMatch = input.match(/^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
        if (isoMatch) {
            const [, years, months, days, hours, minutes, seconds] = isoMatch;
            return {
                years: years ? parseInt(years, 10) : 0,
                months: months ? parseInt(months, 10) : 0,
                days: days ? parseInt(days, 10) : 0,
                hours: hours ? parseInt(hours, 10) : 0,
                minutes: minutes ? parseInt(minutes, 10) : 0,
                seconds: seconds ? parseFloat(seconds) : 0,
            };
        }
        const simpleMatch = input.match(/^(\d+(?:\.\d+)?)\s*(years?|months?|weeks?|days?|hours?|minutes?|seconds?|milliseconds?|ms|y|M|w|d|h|m|s)$/i);
        if (simpleMatch) {
            const [, amount, unit] = simpleMatch;
            const obj = {};
            const normalizedUnit = this.normalizeUnit(unit);
            obj[normalizedUnit] = parseFloat(amount);
            return obj;
        }
        const parsed = parseFloat(input);
        return { milliseconds: isNaN(parsed) ? 0 : parsed };
    }
    parseObject(obj) {
        let milliseconds = 0;
        if (obj.years)
            milliseconds += obj.years * 365.25 * 24 * 60 * 60 * 1000;
        if (obj.months)
            milliseconds += obj.months * 30.44 * 24 * 60 * 60 * 1000;
        if (obj.weeks)
            milliseconds += obj.weeks * 7 * 24 * 60 * 60 * 1000;
        if (obj.days)
            milliseconds += obj.days * 24 * 60 * 60 * 1000;
        if (obj.hours)
            milliseconds += obj.hours * 60 * 60 * 1000;
        if (obj.minutes)
            milliseconds += obj.minutes * 60 * 1000;
        if (obj.seconds)
            milliseconds += obj.seconds * 1000;
        if (obj.milliseconds)
            milliseconds += obj.milliseconds;
        return Math.round(milliseconds);
    }
    normalizeUnit(unit) {
        if (!unit || typeof unit !== 'string') {
            return 'milliseconds';
        }
        const unitMap = {
            y: 'years',
            year: 'years',
            years: 'years',
            M: 'months',
            month: 'months',
            months: 'months',
            w: 'weeks',
            week: 'weeks',
            weeks: 'weeks',
            d: 'days',
            day: 'days',
            days: 'days',
            h: 'hours',
            hour: 'hours',
            hours: 'hours',
            m: 'minutes',
            minute: 'minutes',
            minutes: 'minutes',
            s: 'seconds',
            second: 'seconds',
            seconds: 'seconds',
            ms: 'milliseconds',
            millisecond: 'milliseconds',
            milliseconds: 'milliseconds',
        };
        return unitMap[unit.toLowerCase()] || unit;
    }
    asMilliseconds() {
        return this.ms;
    }
    asSeconds() {
        return this.ms / 1000;
    }
    asMinutes() {
        return this.ms / (1000 * 60);
    }
    asHours() {
        return this.ms / (1000 * 60 * 60);
    }
    asDays() {
        return this.ms / (1000 * 60 * 60 * 24);
    }
    asWeeks() {
        return this.ms / (1000 * 60 * 60 * 24 * 7);
    }
    asMonths() {
        return this.ms / (1000 * 60 * 60 * 24 * 30.44);
    }
    asYears() {
        return this.ms / (1000 * 60 * 60 * 24 * 365.25);
    }
    get years() {
        return this._years;
    }
    get months() {
        return this._months;
    }
    get weeks() {
        return this._weeks;
    }
    get days() {
        return this._days;
    }
    get hours() {
        return this._hours;
    }
    get minutes() {
        return this._minutes;
    }
    get seconds() {
        return this._seconds;
    }
    get milliseconds() {
        return this._milliseconds;
    }
    add(amount) {
        const other = amount instanceof Duration ? amount : new Duration(amount);
        return new Duration(this.ms + other.ms);
    }
    subtract(amount) {
        const other = amount instanceof Duration ? amount : new Duration(amount);
        return new Duration(this.ms - other.ms);
    }
    multiply(factor) {
        return new Duration(this.ms * factor);
    }
    divide(divisor) {
        return new Duration(this.ms / divisor);
    }
    negate() {
        return new Duration(-this.ms);
    }
    abs() {
        return new Duration(Math.abs(this.ms));
    }
    equals(other) {
        return this.ms === other.ms;
    }
    isGreaterThan(other) {
        return this.ms > other.ms;
    }
    isLessThan(other) {
        return this.ms < other.ms;
    }
    isZero() {
        return this.ms === 0;
    }
    isNegative() {
        return this.ms < 0;
    }
    isPositive() {
        return this.ms > 0;
    }
    toString() {
        return this.toISOString();
    }
    toISOString() {
        const abs = Math.abs(this.ms);
        const sign = this.ms < 0 ? '-' : '';
        const years = Math.floor(abs / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((abs % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((abs % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((abs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((abs % (1000 * 60)) / 1000);
        const milliseconds = abs % 1000;
        let result = sign + 'P';
        if (years > 0)
            result += `${years}Y`;
        if (months > 0)
            result += `${months}M`;
        if (days > 0)
            result += `${days}D`;
        if (hours > 0 || minutes > 0 || seconds > 0 || milliseconds > 0) {
            result += 'T';
            if (hours > 0)
                result += `${hours}H`;
            if (minutes > 0)
                result += `${minutes}M`;
            if (seconds > 0 || milliseconds > 0) {
                const totalSeconds = seconds + milliseconds / 1000;
                result += `${totalSeconds}S`;
            }
        }
        return result === sign + 'P' ? sign + 'P0D' : result;
    }
    toJSON() {
        return this.toISOString();
    }
    humanize(largest) {
        const abs = Math.abs(this.ms);
        const sign = this.ms < 0 ? '-' : '';
        const units = [
            { name: 'year', value: 1000 * 60 * 60 * 24 * 365.25 },
            { name: 'month', value: 1000 * 60 * 60 * 24 * 30.44 },
            { name: 'week', value: 1000 * 60 * 60 * 24 * 7 },
            { name: 'day', value: 1000 * 60 * 60 * 24 },
            { name: 'hour', value: 1000 * 60 * 60 },
            { name: 'minute', value: 1000 * 60 },
            { name: 'second', value: 1000 },
            { name: 'millisecond', value: 1 },
        ];
        const parts = [];
        let remaining = abs;
        for (const unit of units) {
            if (remaining >= unit.value) {
                const count = Math.floor(remaining / unit.value);
                parts.push(`${count} ${unit.name}${count !== 1 ? 's' : ''}`);
                remaining %= unit.value;
                if (largest && parts.length >= largest) {
                    break;
                }
            }
        }
        if (parts.length === 0) {
            return '0 milliseconds';
        }
        const result = parts.join(', ');
        return sign + result;
    }
    toObject() {
        return {
            years: this.years,
            months: this.months,
            weeks: this.weeks,
            days: this.days,
            hours: this.hours,
            minutes: this.minutes,
            seconds: this.seconds,
            milliseconds: this.milliseconds,
        };
    }
    clone() {
        return new Duration(this.ms);
    }
}
export default {
    name: 'duration',
    version: '1.0.0',
    size: 4096,
    install(kairos, _utils) {
        kairos.extend({
            duration(other) {
                const otherDate = kairos(other);
                const diff = otherDate.valueOf() - this.valueOf();
                return new Duration(diff);
            },
            durationSince() {
                const now = kairos();
                const diff = now.valueOf() - this.valueOf();
                return new Duration(diff);
            },
            durationUntil() {
                const now = kairos();
                const diff = this.valueOf() - now.valueOf();
                return new Duration(diff);
            },
            addDuration(duration) {
                const dur = duration instanceof Duration ? duration : new Duration(duration);
                return this.add(dur.asMilliseconds(), 'milliseconds');
            },
            subtractDuration(duration) {
                const dur = duration instanceof Duration ? duration : new Duration(duration);
                return this.subtract(dur.asMilliseconds(), 'milliseconds');
            },
            fromNow() {
                return this.durationSince().humanize();
            },
            toNow() {
                return this.durationUntil().humanize();
            },
        });
        kairos.addStatic?.({
            duration(input) {
                return new Duration(input || 0);
            },
            durationFromObject(obj) {
                return new Duration(obj);
            },
            parseDuration(str) {
                return new Duration(str);
            },
            durationBetween(start, end) {
                const startDate = kairos(start);
                const endDate = kairos(end);
                const diff = endDate.valueOf() - startDate.valueOf();
                return new Duration(diff);
            },
        });
    },
};
//# sourceMappingURL=duration.js.map