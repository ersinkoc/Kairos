export class UnixTimestampParser {
    parse(input) {
        if (input === null || input === undefined) {
            return null;
        }
        let timestamp;
        if (typeof input === 'number') {
            timestamp = input;
        }
        else if (typeof input === 'string') {
            if (!/^\d+$/.test(input)) {
                return null;
            }
            timestamp = parseInt(input, 10);
        }
        else {
            return null;
        }
        let date;
        if (timestamp < 10000000000) {
            date = new Date(timestamp * 1000);
        }
        else if (timestamp < 10000000000000) {
            date = new Date(timestamp);
        }
        else if (timestamp < 10000000000000000) {
            date = new Date(Math.floor(timestamp / 1000));
        }
        else {
            date = new Date(Math.floor(timestamp / 1000000));
        }
        if (isNaN(date.getTime())) {
            return null;
        }
        const year = date.getFullYear();
        if (year < 1970 || year >= 2100) {
            return null;
        }
        return date;
    }
    toUnix(date, unit = 'seconds') {
        const milliseconds = date.getTime();
        switch (unit) {
            case 'seconds':
                return Math.floor(milliseconds / 1000);
            case 'milliseconds':
                return milliseconds;
            case 'microseconds':
                return milliseconds * 1000;
            case 'nanoseconds':
                return milliseconds * 1000000;
            default:
                return Math.floor(milliseconds / 1000);
        }
    }
    isUnixTimestamp(input) {
        if (typeof input === 'number') {
            return input > 0 && input < 10000000000000;
        }
        if (typeof input === 'string') {
            return (UnixTimestampParser.UNIX_SECONDS_REGEX.test(input) ||
                UnixTimestampParser.UNIX_MILLISECONDS_REGEX.test(input) ||
                UnixTimestampParser.UNIX_MICROSECONDS_REGEX.test(input) ||
                UnixTimestampParser.UNIX_NANOSECONDS_REGEX.test(input));
        }
        return false;
    }
}
UnixTimestampParser.UNIX_SECONDS_REGEX = /^\d{10}$/;
UnixTimestampParser.UNIX_MILLISECONDS_REGEX = /^\d{13}$/;
UnixTimestampParser.UNIX_MICROSECONDS_REGEX = /^\d{16}$/;
UnixTimestampParser.UNIX_NANOSECONDS_REGEX = /^\d{19}$/;
const parser = new UnixTimestampParser();
export default {
    name: 'parse-unix',
    version: '1.0.0',
    size: 1536,
    install(kairos) {
        kairos.unix = (timestamp) => {
            const parsed = parser.parse(timestamp);
            return parsed ? kairos(parsed) : null;
        };
        kairos.fromUnix = kairos.unix;
        kairos.isUnixTimestamp = (input) => parser.isUnixTimestamp(input);
        kairos.extend({
            unix(unit) {
                return parser.toUnix(this.toDate(), unit);
            },
            toUnix(unit) {
                return parser.toUnix(this.toDate(), unit);
            },
            fromNow() {
                const now = Date.now();
                const timestamp = this.toDate().getTime();
                const diff = now - timestamp;
                const seconds = Math.floor(Math.abs(diff) / 1000);
                if (seconds < 60) {
                    return diff > 0 ? `${seconds} seconds ago` : `in ${seconds} seconds`;
                }
                const minutes = Math.floor(seconds / 60);
                if (minutes < 60) {
                    return diff > 0 ? `${minutes} minutes ago` : `in ${minutes} minutes`;
                }
                const hours = Math.floor(minutes / 60);
                if (hours < 24) {
                    return diff > 0 ? `${hours} hours ago` : `in ${hours} hours`;
                }
                const days = Math.floor(hours / 24);
                if (days < 30) {
                    return diff > 0 ? `${days} days ago` : `in ${days} days`;
                }
                const months = Math.floor(days / 30);
                if (months < 12) {
                    return diff > 0 ? `${months} months ago` : `in ${months} months`;
                }
                const years = Math.floor(months / 12);
                return diff > 0 ? `${years} years ago` : `in ${years} years`;
            },
        });
        const originalParse = kairos.parse || ((input) => kairos(input));
        kairos.parse = (input) => {
            if (parser.isUnixTimestamp(input)) {
                const unixResult = parser.parse(input);
                if (unixResult) {
                    return kairos(unixResult);
                }
            }
            return originalParse(input);
        };
    },
};
//# sourceMappingURL=unix.js.map