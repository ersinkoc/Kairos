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
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }));
            const offset = (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
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
            return currentOffset < Math.max(janOffset, julOffset);
        }
        catch (error) {
            return false;
        }
    }
    static getOffset(date, timezone) {
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        return (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
    }
    static convertToTimezone(date, timezone) {
        const normalizedTz = this.normalizeTimezone(timezone);
        return new Date(date.toLocaleString('en-US', { timeZone: normalizedTz }));
    }
    static convertTimezone(date, fromTz, toTz) {
        const normalizedFromTz = this.normalizeTimezone(fromTz);
        const normalizedToTz = this.normalizeTimezone(toTz);
        const sourceDate = new Date(date.toLocaleString('en-US', { timeZone: normalizedFromTz }));
        return new Date(sourceDate.toLocaleString('en-US', { timeZone: normalizedToTz }));
    }
    static normalizeTimezone(timezone) {
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
                return kairos(converted);
            },
            utc() {
                return this.tz('UTC');
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
                return !!this._isUTC || this.offset() === 0;
            },
            local() {
                if (!this.isUTC()) {
                    return this.clone();
                }
                const localDate = new Date(this.toDate().getTime());
                return kairos(localDate);
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