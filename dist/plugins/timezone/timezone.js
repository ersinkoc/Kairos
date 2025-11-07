export class TimezoneManager {
    static getTimezoneInfo(date, timezone) {
        const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const formatter = new Intl.DateTimeFormat('en', {
                timeZone: tz,
                timeZoneName: 'short',
            });
            const parts = formatter.formatToParts(date);
            const timeZoneName = parts.find((part) => part.type === 'timeZoneName')?.value || '';
            const offset = this.getOffset(date, tz);
            return {
                name: tz,
                abbreviation: timeZoneName,
                offset,
                dst: this.isDST(date, tz),
            };
        }
        catch (error) {
            return {
                name: 'UTC',
                abbreviation: 'UTC',
                offset: 0,
                dst: false,
            };
        }
    }
    static isDST(date, timezone) {
        const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const jan = new Date(date.getFullYear(), 0, 1);
            const jul = new Date(date.getFullYear(), 6, 1);
            const janOffset = this.getOffset(jan, tz);
            const julOffset = this.getOffset(jul, tz);
            const currentOffset = this.getOffset(date, tz);
            return currentOffset > Math.min(janOffset, julOffset);
        }
        catch (error) {
            return false;
        }
    }
    static getOffset(date, timezone) {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const parts = formatter.formatToParts(date);
        const tzYear = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
        const tzMonth = parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10) - 1;
        const tzDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);
        const tzHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
        const tzMinute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
        const tzSecond = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
        const tzTime = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond);
        const offset = (tzTime - date.getTime()) / (1000 * 60);
        return offset;
    }
    static convertToTimezone(date, timezone) {
        const normalizedTz = this.normalizeTimezone(timezone);
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: normalizedTz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const parts = formatter.formatToParts(date);
        const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
        const month = parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10) - 1;
        const day = parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);
        const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
        const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
        const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);
        return new Date(year, month, day, hour, minute, second, date.getMilliseconds());
    }
    static convertTimezone(date, fromTz, toTz) {
        const normalizedFromTz = this.normalizeTimezone(fromTz);
        const normalizedToTz = this.normalizeTimezone(toTz);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const ms = date.getMilliseconds();
        const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
        const fromOffset = this.getOffset(utcDate, normalizedFromTz);
        const correctUTC = new Date(utcDate.getTime() - fromOffset * 60 * 1000);
        return this.convertToTimezone(correctUTC, normalizedToTz);
    }
    static normalizeTimezone(timezone) {
        if (!timezone || typeof timezone !== 'string') {
            return 'UTC';
        }
        return this.TIMEZONE_MAP[timezone.toUpperCase()] || timezone;
    }
    static getAvailableTimezones() {
        try {
            return Intl.supportedValuesOf('timeZone');
        }
        catch (error) {
            return [
                'UTC',
                'America/New_York',
                'America/Los_Angeles',
                'America/Chicago',
                'America/Denver',
                'Europe/London',
                'Europe/Paris',
                'Europe/Berlin',
                'Asia/Tokyo',
                'Asia/Shanghai',
                'Asia/Kolkata',
                'Australia/Sydney',
                'Pacific/Auckland',
            ];
        }
    }
    static getCommonTimezones() {
        return { ...this.TIMEZONE_MAP };
    }
    static formatOffset(offset) {
        const hours = Math.floor(Math.abs(offset) / 60);
        const minutes = Math.abs(offset) % 60;
        const sign = offset >= 0 ? '+' : '-';
        return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    static parseOffset(offsetStr) {
        const match = offsetStr.match(/^([+-])(\d{1,2}):?(\d{2})$/);
        if (!match)
            return 0;
        const [, sign, hours, minutes] = match;
        const offset = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
        return sign === '-' ? -offset : offset;
    }
    static getTimezoneFromOffset(offset) {
        const availableTimezones = this.getAvailableTimezones();
        const testDate = new Date();
        return availableTimezones.filter((tz) => {
            try {
                const tzOffset = this.getOffset(testDate, tz);
                return Math.abs(tzOffset - offset) < 1;
            }
            catch (error) {
                return false;
            }
        });
    }
}
TimezoneManager.TIMEZONE_MAP = {
    EST: 'America/New_York',
    PST: 'America/Los_Angeles',
    CST: 'America/Chicago',
    MST: 'America/Denver',
    GMT: 'Europe/London',
    UTC: 'UTC',
    CET: 'Europe/Paris',
    JST: 'Asia/Tokyo',
    IST: 'Asia/Kolkata',
    CST_CN: 'Asia/Shanghai',
    AEST: 'Australia/Sydney',
};
export default {
    name: 'timezone',
    version: '1.0.0',
    size: 2048,
    install(kairos) {
        kairos.extend({
            timezone(tz) {
                return TimezoneManager.getTimezoneInfo(this.toDate(), tz);
            },
            tz(timezone) {
                const converted = TimezoneManager.convertToTimezone(this.toDate(), timezone);
                const instance = kairos(converted);
                if (timezone === 'UTC') {
                    instance._isUTC = true;
                }
                return instance;
            },
            utc() {
                const instance = this.tz('UTC');
                instance._isUTC = true;
                return instance;
            },
            utcOffset(offset) {
                if (offset === undefined) {
                    return -this.toDate().getTimezoneOffset();
                }
                const current = -this.toDate().getTimezoneOffset();
                const diff = offset - current;
                return this.add(diff, 'minutes');
            },
            isDST() {
                return TimezoneManager.isDST(this.toDate());
            },
            isUTC() {
                return !!this._isUTC;
            },
            local() {
                if (!this.isUTC()) {
                    return this.clone();
                }
                const instance = kairos(this.toDate());
                delete instance._isUTC;
                return instance;
            },
        });
        kairos.addStatic?.({
            getTimezoneInfo(date, timezone) {
                const d = kairos(date);
                return TimezoneManager.getTimezoneInfo(d.toDate(), timezone);
            },
            convertTimezone(date, fromTz, toTz) {
                const d = kairos(date);
                const converted = TimezoneManager.convertTimezone(d.toDate(), fromTz, toTz);
                return kairos(converted);
            },
            getAvailableTimezones() {
                return TimezoneManager.getAvailableTimezones();
            },
            getCommonTimezones() {
                return TimezoneManager.getCommonTimezones();
            },
            parseTimezoneOffset(offsetStr) {
                return TimezoneManager.parseOffset(offsetStr);
            },
            formatTimezoneOffset(offset) {
                return TimezoneManager.formatOffset(offset);
            },
            getTimezonesForOffset(offset) {
                return TimezoneManager.getTimezoneFromOffset(offset);
            },
            inTimezone(input, timezone) {
                const date = kairos(input);
                return date.tz(timezone);
            },
        });
    },
};
//# sourceMappingURL=timezone.js.map