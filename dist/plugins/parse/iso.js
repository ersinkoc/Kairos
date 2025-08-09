export class ISOParser {
    parse(input) {
        if (!input || typeof input !== 'string') {
            return null;
        }
        const trimmed = input.trim();
        const isoMatch = trimmed.match(ISOParser.ISO_REGEX);
        if (isoMatch) {
            return this.parseISOMatch(isoMatch);
        }
        const dateMatch = trimmed.match(ISOParser.DATE_ONLY_REGEX);
        if (dateMatch) {
            return this.parseDateOnly(dateMatch);
        }
        return null;
    }
    parseISOMatch(match) {
        const [, year, month, day, hour = '0', minute = '0', second = '0', millisecond = '0', tzHour, tzMinute,] = match;
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), parseInt(millisecond.padEnd(3, '0'), 10));
        if (tzHour !== undefined && tzMinute !== undefined) {
            const offsetMinutes = parseInt(tzHour, 10) * 60 + parseInt(tzMinute, 10);
            date.setMinutes(date.getMinutes() - offsetMinutes);
        }
        return date;
    }
    parseDateOnly(match) {
        const [, year, month, day] = match;
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    }
    format(date, includeTime = true) {
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        if (!includeTime) {
            return `${year}-${month}-${day}`;
        }
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        const millisecond = date.getMilliseconds().toString().padStart(3, '0');
        return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`;
    }
    isValid(input) {
        return this.parse(input) !== null;
    }
}
ISOParser.ISO_REGEX = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?(?:Z|([+-]\d{2}):?(\d{2}))?)?$/;
ISOParser.DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;
export default {
    name: 'parse-iso',
    version: '1.0.0',
    size: 1024,
    patterns: [ISOParser.ISO_REGEX, ISOParser.DATE_ONLY_REGEX],
    install(kairos, _utils) {
        const parser = new ISOParser();
        kairos.addStatic?.({
            parseISO(input) {
                const parsed = parser.parse(input);
                return parsed ? kairos(parsed) : null;
            },
            isValidISO(input) {
                return parser.isValid(input);
            },
        });
        kairos.extend({
            toISO(includeTime = true) {
                return parser.format(this.toDate(), includeTime);
            },
        });
    },
};
//# sourceMappingURL=iso.js.map