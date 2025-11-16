import type { KairosPlugin } from '../../core/types/plugin.js';

export class FlexibleParser {
  // Common date formats
  private static readonly FORMATS = [
    // ISO 8601 variations
    {
      regex: /^(\d{4})-(\d{2})-(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[1], +m[2] - 1, +m[3]),
    },
    {
      regex: /^(\d{4})\/(\d{2})\/(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[1], +m[2] - 1, +m[3]),
    },
    {
      regex: /^(\d{4})\.(\d{2})\.(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[1], +m[2] - 1, +m[3]),
    },

    // US format (MM/DD/YYYY)
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[1] - 1, +m[2]),
      us: true,
    },

    // European format (DD/MM/YYYY or DD.MM.YYYY)
    {
      regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[2] - 1, +m[1]),
      european: true,
    },

    // BUG FIX (BUG-005): Clarified ambiguous date format handling
    // IMPORTANT: The dash-delimited format (XX-XX-XXXX) is inherently ambiguous:
    //   - DD-MM-YYYY (European) vs MM-DD-YYYY (US)
    //   - Use options.european flag to specify format preference
    //   - Default (no option): US format (MM-DD-YYYY)
    //   - Recommended: Use unambiguous formats (ISO: YYYY-MM-DD, European: DD.MM.YYYY, US: MM/DD/YYYY)
    // European format: DD-MM-YYYY (only used when options.european = true)
    {
      regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[2] - 1, +m[1]), // European: DD-MM-YYYY
      european: true,
    },
    // US format: MM-DD-YYYY (used when options.european = false or undefined)
    {
      regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[1] - 1, +m[2]), // US: MM-DD-YYYY
      us: true,
    },

    // With time
    {
      regex: /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]),
    },
    {
      regex: /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]),
    },
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[1] - 1, +m[2], +m[4], +m[5]),
    },
    {
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[1] - 1, +m[2], +m[4], +m[5], +m[6]),
    },

    // European date format DD.MM.YYYY with time
    {
      regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]),
      european: true,
    },
    {
      regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]),
      european: true,
    },

    // Natural language
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

    // Relative time
    {
      regex: /^(\d+)\s+(second|seconds|sec|s)\s+ago$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() - +m[1] * 1000),
    },
    {
      regex: /^(\d+)\s+(minute|minutes|min|m)\s+ago$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() - +m[1] * 60000),
    },
    {
      regex: /^(\d+)\s+(hour|hours|hr|h)\s+ago$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() - +m[1] * 3600000),
    },
    {
      regex: /^(\d+)\s+(day|days|d)\s+ago$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() - +m[1] * 86400000),
    },
    {
      regex: /^(\d+)\s+(week|weeks|w)\s+ago$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() - +m[1] * 604800000),
    },
    {
      regex: /^(\d+)\s+(month|months)\s+ago$/i,
      parse: (m: RegExpMatchArray) => {
        const d = new Date();
        d.setMonth(d.getMonth() - +m[1]);
        return d;
      },
    },
    {
      regex: /^(\d+)\s+(year|years|yr|y)\s+ago$/i,
      parse: (m: RegExpMatchArray) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - +m[1]);
        return d;
      },
    },

    // Future relative time
    {
      regex: /^in\s+(\d+)\s+(second|seconds|sec|s)$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() + +m[1] * 1000),
    },
    {
      regex: /^in\s+(\d+)\s+(minute|minutes|min|m)$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() + +m[1] * 60000),
    },
    {
      regex: /^in\s+(\d+)\s+(hour|hours|hr|h)$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() + +m[1] * 3600000),
    },
    {
      regex: /^in\s+(\d+)\s+(day|days|d)$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() + +m[1] * 86400000),
    },
    {
      regex: /^in\s+(\d+)\s+(week|weeks|w)$/i,
      parse: (m: RegExpMatchArray) => new Date(Date.now() + +m[1] * 604800000),
    },
    {
      regex: /^in\s+(\d+)\s+(month|months)$/i,
      parse: (m: RegExpMatchArray) => {
        const d = new Date();
        d.setMonth(d.getMonth() + +m[1]);
        return d;
      },
    },
    {
      regex: /^in\s+(\d+)\s+(year|years|yr|y)$/i,
      parse: (m: RegExpMatchArray) => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + +m[1]);
        return d;
      },
    },

    // Month names
    {
      regex: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})$/i,
      parse: (m: RegExpMatchArray) => {
        const months: Record<string, number> = {
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
      regex:
        /^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i,
      parse: (m: RegExpMatchArray) => {
        const months: Record<string, number> = {
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

    // Special formats
    {
      regex: /^(\d{4})(\d{2})(\d{2})$/,
      parse: (m: RegExpMatchArray) => new Date(+m[1], +m[2] - 1, +m[3]),
    }, // YYYYMMDD
    {
      regex: /^(\d{8})$/,
      parse: (m: RegExpMatchArray) =>
        new Date(+m[1].slice(0, 4), +m[1].slice(4, 6) - 1, +m[1].slice(6, 8)),
    }, // YYYYMMDD as single number
  ];

  parse(input: string, options?: { european?: boolean; strict?: boolean }): Date | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const trimmed = input.trim();

    // Try each format
    for (const format of FlexibleParser.FORMATS) {
      // Skip European formats if not in European mode, and US formats if in European mode
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

          // Validate the date
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();

            // Always check basic bounds
            if (year < 1900 || year > 2100) {
              continue;
            }

            // Reject dates that were clearly adjusted by Date constructor (invalid dates that rolled over)
            if (match.length >= 4 && /^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(trimmed)) {
              const parts = trimmed.split(/[/-]/).map((p) => parseInt(p, 10));

              // Check for obviously invalid month/day values that would cause rollover
              // Reject if any part is clearly invalid (> 31) OR both parts are > 12
              if (parts[0] > 31 || parts[1] > 31 || (parts[0] > 12 && parts[1] > 12)) {
                continue;
              }
            }

            // Additional validation in strict mode
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
        } catch (e) {
          // BUG FIX (BUG-E01): Added debug logging for parse errors
          // This helps with debugging parse failures in development
          if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
            console.debug(`Parse format failed for "${trimmed}":`, e);
          }
          // Continue to next format
          continue;
        }
      }
    }

    // Try native Date parsing as last resort, but be more restrictive
    if (!options?.strict) {
      // Only allow native parsing for strings that look like valid dates
      if (
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(trimmed) ||
        /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2}:\d{2})?$/.test(trimmed)
      ) {
        const nativeDate = new Date(trimmed);
        if (
          !isNaN(nativeDate.getTime()) &&
          nativeDate.getFullYear() > 1900 &&
          nativeDate.getFullYear() < 2200
        ) {
          return nativeDate;
        }
      }
    }

    return null;
  }

  // Guess the format of a date string
  guessFormat(input: string): string | null {
    if (!input || typeof input !== 'string') {
      return null;
    }

    const trimmed = input.trim();

    for (const format of FlexibleParser.FORMATS) {
      if (trimmed.match(format.regex)) {
        // Return a descriptive format string
        const pattern = format.regex.source;
        if (pattern.includes('YYYY')) return 'YYYY-MM-DD';
        if (pattern.includes('MM') && pattern.includes('DD')) return 'MM/DD/YYYY';
        if (pattern.includes('today')) return 'natural';
        if (pattern.includes('ago')) return 'relative';
        return 'custom';
      }
    }

    return null;
  }
}

const parser = new FlexibleParser();

export default {
  name: 'parse-flexible',
  version: '1.0.0',
  size: 3072,
  install(kairos, _utils) {
    // Add flexible parsing
    kairos.parseFlexible = (
      input: string,
      options?: { european?: boolean; strict?: boolean }
    ): any => {
      const parsed = parser.parse(input, options);
      return parsed ? kairos(parsed) : null;
    };

    kairos.guessDateFormat = (input: string) => {
      return parser.guessFormat(input);
    };

    // Natural language helpers
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

    // Register with main parse chain
    const originalParse = kairos.parse || ((input: any) => kairos(input));
    kairos.parse = (input: any, options?: { european?: boolean; strict?: boolean }) => {
      if (typeof input === 'string') {
        // Try flexible parser
        const flexibleResult = parser.parse(input, options);
        if (flexibleResult) {
          return kairos(flexibleResult);
        }
      }
      // Fall back to original parser
      return originalParse(input);
    };
  },
} as KairosPlugin;
