export class FlexibleParser {
    parse(input, options) {
        if (!input || typeof input !== 'string') {
            return null;
        }
        const trimmed = input.trim();
        for (const format of FlexibleParser.FORMATS) {
            if (format.european && !options?.european) {
                continue;
            }
            if (format.us && options?.european) {
                continue;
            }
            const match = trimmed.match(format.regex);
            if (match) {
                try {
                    const date = format.parse(match);
                    if (!isNaN(date.getTime())) {
                        const year = date.getFullYear();
                        const month = date.getMonth();
                        const day = date.getDate();
                        if (year < 1900 || year > 2100) {
                            continue;
                        }
                        if (match.length >= 4 && /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmed)) {
                            const parts = trimmed.split(/[\/\-]/).map(p => parseInt(p, 10));
                            if ((parts[0] > 31 || parts[1] > 31) &&
                                (parts[0] > 12 && parts[1] > 12)) {
                                continue;
                            }
                        }
                        if (options?.strict) {
                            if (month < 0 || month > 11) {
                                continue;
                            }
                            if (day < 1 || day > 31) {
                                continue;
                            }
                        }
                        return date;
                    }
                }
                catch (e) {
                    continue;
                }
            }
        }
        if (!options?.strict) {
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(trimmed) ||
                /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/.test(trimmed)) {
                const nativeDate = new Date(trimmed);
                if (!isNaN(nativeDate.getTime()) && nativeDate.getFullYear() > 1900 && nativeDate.getFullYear() < 2200) {
                    return nativeDate;
                }
            }
        }
        return null;
    }
    guessFormat(input) {
        if (!input || typeof input !== 'string') {
            return null;
        }
        const trimmed = input.trim();
        for (const format of FlexibleParser.FORMATS) {
            if (trimmed.match(format.regex)) {
                const pattern = format.regex.source;
                if (pattern.includes('YYYY'))
                    return 'YYYY-MM-DD';
                if (pattern.includes('MM') && pattern.includes('DD'))
                    return 'MM/DD/YYYY';
                if (pattern.includes('today'))
                    return 'natural';
                if (pattern.includes('ago'))
                    return 'relative';
                return 'custom';
            }
        }
        return null;
    }
}
FlexibleParser.FORMATS = [
    {
        regex: /^(\d{4})-(\d{2})-(\d{2})$/,
        parse: (m) => new Date(+m[1], +m[2] - 1, +m[3]),
    },
    {
        regex: /^(\d{4})\/(\d{2})\/(\d{2})$/,
        parse: (m) => new Date(+m[1], +m[2] - 1, +m[3]),
    },
    {
        regex: /^(\d{4})\.(\d{2})\.(\d{2})$/,
        parse: (m) => new Date(+m[1], +m[2] - 1, +m[3]),
    },
    {
        regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        parse: (m) => new Date(+m[3], +m[1] - 1, +m[2]),
        us: true,
    },
    {
        regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
        parse: (m) => new Date(+m[3], +m[2] - 1, +m[1]),
        european: true,
    },
    {
        regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        parse: (m) => new Date(+m[3], +m[1] - 1, +m[2]),
        us: true,
    },
    {
        regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        parse: (m) => new Date(+m[3], +m[2] - 1, +m[1]),
        european: true,
    },
    {
        regex: /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/,
        parse: (m) => new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]),
    },
    {
        regex: /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
        parse: (m) => new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]),
    },
    {
        regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
        parse: (m) => new Date(+m[3], +m[1] - 1, +m[2], +m[4], +m[5]),
    },
    {
        regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
        parse: (m) => new Date(+m[3], +m[1] - 1, +m[2], +m[4], +m[5], +m[6]),
    },
    {
        regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
        parse: (m) => new Date(+m[3], +m[2] - 1, +m[1]),
    },
    {
        regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/,
        parse: (m) => new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]),
    },
    {
        regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
        parse: (m) => new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]),
    },
    { regex: /^today$/i, parse: () => new Date() },
    {
        regex: /^tomorrow$/i,
        parse: () => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return d;
        },
    },
    {
        regex: /^yesterday$/i,
        parse: () => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d;
        },
    },
    { regex: /^now$/i, parse: () => new Date() },
    {
        regex: /^(\d+)\s+(second|seconds|sec|s)\s+ago$/i,
        parse: (m) => new Date(Date.now() - +m[1] * 1000),
    },
    {
        regex: /^(\d+)\s+(minute|minutes|min|m)\s+ago$/i,
        parse: (m) => new Date(Date.now() - +m[1] * 60000),
    },
    {
        regex: /^(\d+)\s+(hour|hours|hr|h)\s+ago$/i,
        parse: (m) => new Date(Date.now() - +m[1] * 3600000),
    },
    {
        regex: /^(\d+)\s+(day|days|d)\s+ago$/i,
        parse: (m) => new Date(Date.now() - +m[1] * 86400000),
    },
    {
        regex: /^(\d+)\s+(week|weeks|w)\s+ago$/i,
        parse: (m) => new Date(Date.now() - +m[1] * 604800000),
    },
    {
        regex: /^(\d+)\s+(month|months)\s+ago$/i,
        parse: (m) => {
            const d = new Date();
            d.setMonth(d.getMonth() - +m[1]);
            return d;
        },
    },
    {
        regex: /^(\d+)\s+(year|years|yr|y)\s+ago$/i,
        parse: (m) => {
            const d = new Date();
            d.setFullYear(d.getFullYear() - +m[1]);
            return d;
        },
    },
    {
        regex: /^in\s+(\d+)\s+(second|seconds|sec|s)$/i,
        parse: (m) => new Date(Date.now() + +m[1] * 1000),
    },
    {
        regex: /^in\s+(\d+)\s+(minute|minutes|min|m)$/i,
        parse: (m) => new Date(Date.now() + +m[1] * 60000),
    },
    {
        regex: /^in\s+(\d+)\s+(hour|hours|hr|h)$/i,
        parse: (m) => new Date(Date.now() + +m[1] * 3600000),
    },
    {
        regex: /^in\s+(\d+)\s+(day|days|d)$/i,
        parse: (m) => new Date(Date.now() + +m[1] * 86400000),
    },
    {
        regex: /^in\s+(\d+)\s+(week|weeks|w)$/i,
        parse: (m) => new Date(Date.now() + +m[1] * 604800000),
    },
    {
        regex: /^in\s+(\d+)\s+(month|months)$/i,
        parse: (m) => {
            const d = new Date();
            d.setMonth(d.getMonth() + +m[1]);
            return d;
        },
    },
    {
        regex: /^in\s+(\d+)\s+(year|years|yr|y)$/i,
        parse: (m) => {
            const d = new Date();
            d.setFullYear(d.getFullYear() + +m[1]);
            return d;
        },
    },
    {
        regex: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})$/i,
        parse: (m) => {
            const months = {
                jan: 0,
                feb: 1,
                mar: 2,
                apr: 3,
                may: 4,
                jun: 5,
                jul: 6,
                aug: 7,
                sep: 8,
                oct: 9,
                nov: 10,
                dec: 11,
            };
            return new Date(+m[3], months[m[1].toLowerCase()], +m[2]);
        },
    },
    {
        regex: /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i,
        parse: (m) => {
            const months = {
                january: 0,
                february: 1,
                march: 2,
                april: 3,
                may: 4,
                june: 5,
                july: 6,
                august: 7,
                september: 8,
                october: 9,
                november: 10,
                december: 11,
            };
            return new Date(+m[3], months[m[2].toLowerCase()], +m[1]);
        },
    },
    {
        regex: /^(\d{4})(\d{2})(\d{2})$/,
        parse: (m) => new Date(+m[1], +m[2] - 1, +m[3]),
    },
    {
        regex: /^(\d{8})$/,
        parse: (m) => new Date(+m[1].slice(0, 4), +m[1].slice(4, 6) - 1, +m[1].slice(6, 8)),
    },
];
const parser = new FlexibleParser();
export default {
    name: 'parse-flexible',
    version: '1.0.0',
    size: 3072,
    install(kairos, _utils) {
        kairos.parseFlexible = (input, options) => {
            const parsed = parser.parse(input, options);
            return parsed ? kairos(parsed) : null;
        };
        kairos.guessDateFormat = (input) => {
            return parser.guessFormat(input);
        };
        kairos.today = () => kairos(new Date());
        kairos.tomorrow = () => {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            return kairos(d);
        };
        kairos.yesterday = () => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return kairos(d);
        };
        const originalParse = kairos.parse || ((input) => kairos(input));
        kairos.parse = (input, options) => {
            if (typeof input === 'string') {
                const flexibleResult = parser.parse(input, options);
                if (flexibleResult) {
                    return kairos(flexibleResult);
                }
            }
            return originalParse(input);
        };
    },
};
//# sourceMappingURL=flexible.js.map