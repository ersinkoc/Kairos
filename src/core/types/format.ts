/**
 * Advanced Template Literal Types for Date Formatting
 * Provides compile-time validation of format strings and auto-completion
 */

// Format token types
type FormatToken =
  | 'YYYY'
  | 'YY'
  | 'Y' // Year
  | 'MMMM'
  | 'MMM'
  | 'MM'
  | 'M' // Month
  | 'DDDD'
  | 'DD'
  | 'D' // Day of year / Day of month
  | 'dddd'
  | 'ddd'
  | 'dd'
  | 'd' // Day of week
  | 'HH'
  | 'H'
  | 'hh'
  | 'h' // Hours
  | 'mm'
  | 'm' // Minutes
  | 'ss'
  | 's' // Seconds
  | 'SSS'
  | 'SS'
  | 'S' // Milliseconds
  | 'A'
  | 'a' // AM/PM
  | 'Z'
  | 'ZZ'
  | 'ZZZ' // Timezone
  | 'X'
  | 'x' // Unix timestamp
  | 'Q'
  | 'QQ' // Quarter
  | 'wo'
  | 'w'
  | 'ww' // Week of year
  | 'gg'
  | 'gggg' // Week year
  | 'k'
  | 'kk' // ISO week year
  | 'E'
  | 'EE'
  | 'EEE' // ISO day of week
  | 'L'
  | 'LL'
  | 'LLL'; // ISO week of year

// Format token categories
type YearToken = 'YYYY' | 'YY' | 'Y';
type MonthToken = 'MMMM' | 'MMM' | 'MM' | 'M';
type DayToken = 'DDDD' | 'DD' | 'D';
type WeekdayToken = 'dddd' | 'ddd' | 'dd' | 'd';
type HourToken = 'HH' | 'H' | 'hh' | 'h';
type MinuteToken = 'mm' | 'm';
type SecondToken = 'ss' | 's';
type MillisecondToken = 'SSS' | 'SS' | 'S';
type MeridiemToken = 'A' | 'a';
type TimezoneToken = 'Z' | 'ZZ' | 'ZZZ';
type TimestampToken = 'X' | 'x';
type QuarterToken = 'Q' | 'QQ';
type WeekToken = 'wo' | 'ww' | 'w';
type WeekYearToken = 'gg' | 'gggg' | 'k' | 'kk';
type ISODayToken = 'E' | 'EE' | 'EEE';
type ISOWeekToken = 'L' | 'LL' | 'LLL';

// Literal format patterns
type LiteralChars = ' ' | '-' | '/' | '.' | ',' | ':' | 'T' | '[' | ']' | '(' | ')';

// Template literal type for format strings
type FormatString<T extends string = string> = T extends `${infer First}${infer Rest}`
  ? First extends FormatToken
    ? `${First}${FormatString<Rest>}`
    : First extends LiteralChars
      ? `${First}${FormatString<Rest>}`
      : never
  : T extends ''
    ? ''
    : never;

// Predefined format patterns
type StandardFormats = {
  'YYYY-MM-DD': 'YYYY-MM-DD';
  'YYYY/MM/DD': 'YYYY/MM/DD';
  'DD/MM/YYYY': 'DD/MM/YYYY';
  'MM/DD/YYYY': 'MM/DD/YYYY';
  'YYYY-MM-DD HH:mm:ss': 'YYYY-MM-DD HH:mm:ss';
  'YYYY-MM-DDTHH:mm:ssZ': 'YYYY-MM-DDTHH:mm:ssZ';
  'dddd, MMMM D, YYYY': 'dddd, MMMM D, YYYY';
  'MMM D, YYYY': 'MMM D, YYYY';
  'M/D/YY': 'M/D/YY';
  'h:mm A': 'h:mm A';
  'HH:mm:ss': 'HH:mm:ss';
  'YYYY-MM-DDTHH:mm:ss.SSSZ': 'YYYY-MM-DDTHH:mm:ss.SSSZ';
  X: 'X';
  x: 'x';
};

// Format string validation
type IsValidFormat<T extends string> = T extends FormatString<T> ? T : never;

// Format token information
interface FormatTokenInfo {
  token: FormatToken;
  category:
    | 'year'
    | 'month'
    | 'day'
    | 'weekday'
    | 'hour'
    | 'minute'
    | 'second'
    | 'millisecond'
    | 'meridiem'
    | 'timezone'
    | 'timestamp'
    | 'quarter'
    | 'week'
    | 'iso'
    | 'weekYear'
    | 'isoDay'
    | 'isoWeek';
  length: number;
  description: string;
  example: string;
}

// Format token registry
type FormatTokenRegistry = {
  [K in FormatToken]: FormatTokenInfo;
};

// Format validation utilities
type ValidateFormat<T extends string> = T extends keyof StandardFormats
  ? StandardFormats[T]
  : T extends FormatString<T>
    ? T
    : never;

// Note: Format string parsing simplified for compilation compatibility

// Format token extraction
type ExtractTokens<T extends string> = T extends `${infer First}${infer Rest}`
  ? First extends FormatToken
    ? First | ExtractTokens<Rest>
    : ExtractTokens<Rest>
  : never;

// Format categorization
type GetTokenCategories<T extends string> =
  T extends FormatString<T>
    ? {
        [K in ExtractTokens<T>]: K extends YearToken
          ? 'year'
          : K extends MonthToken
            ? 'month'
            : K extends DayToken
              ? 'day'
              : K extends WeekdayToken
                ? 'weekday'
                : K extends HourToken
                  ? 'hour'
                  : K extends MinuteToken
                    ? 'minute'
                    : K extends SecondToken
                      ? 'second'
                      : K extends MillisecondToken
                        ? 'millisecond'
                        : K extends MeridiemToken
                          ? 'meridiem'
                          : K extends TimezoneToken
                            ? 'timezone'
                            : K extends TimestampToken
                              ? 'timestamp'
                              : K extends QuarterToken
                                ? 'quarter'
                                : K extends WeekToken
                                  ? 'week'
                                  : K extends WeekYearToken
                                    ? 'weekYear'
                                    : K extends ISODayToken
                                      ? 'isoDay'
                                      : K extends ISOWeekToken
                                        ? 'isoWeek'
                                        : never;
      }
    : never;

// Format string validation with context
type FormatWithContext<
  T extends string,
  Context extends {
    includeTime?: boolean;
    includeDate?: boolean;
    includeTimezone?: boolean;
    includeTimestamp?: boolean;
  },
> =
  T extends FormatString<T>
    ? Context['includeTime'] extends false
      ? T extends `${string}${HourToken | MinuteToken | SecondToken | MillisecondToken | MeridiemToken}${string}`
        ? never
        : T
      : Context['includeDate'] extends false
        ? T extends `${string}${YearToken | MonthToken | DayToken | WeekdayToken}${string}`
          ? never
          : T
        : T
    : never;

// Date-only formats
type DateOnlyFormat = FormatWithContext<
  string,
  { includeTime: false; includeDate: true; includeTimezone: false; includeTimestamp: false }
>;

// Time-only formats
type TimeOnlyFormat = FormatWithContext<
  string,
  { includeTime: true; includeDate: false; includeTimezone: false; includeTimestamp: false }
>;

// ISO formats
type ISOFormat =
  | 'YYYY-MM-DDTHH:mm:ssZ'
  | 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  | 'YYYY-MM-DD'
  | 'THH:mm:ss'
  | 'THH:mm:ss.SSS';

// Locale-aware format patterns
type LocaleFormat<T extends string> = T extends `${infer Locale}:${infer Format}`
  ? Locale extends `${string}-${string}`
    ? Format extends FormatString<Format>
      ? `${Locale}:${Format}`
      : never
    : never
  : never;

// Format string builder utility types
type FormatBuilder = {
  year: (pattern: YearToken) => FormatBuilder;
  month: (pattern: MonthToken) => FormatBuilder;
  day: (pattern: DayToken) => FormatBuilder;
  weekday: (pattern: WeekdayToken) => FormatBuilder;
  hour: (pattern: HourToken) => FormatBuilder;
  minute: (pattern: MinuteToken) => FormatBuilder;
  second: (pattern: SecondToken) => FormatBuilder;
  millisecond: (pattern: MillisecondToken) => FormatBuilder;
  meridiem: (pattern: MeridiemToken) => FormatBuilder;
  timezone: (pattern: TimezoneToken) => FormatBuilder;
  literal: (text: string) => FormatBuilder;
  build: () => string;
};

// Format validation function signatures
type FormatValidator = {
  validate<T extends string>(format: T): T extends FormatString<T> ? true : false;
  tokenize<T extends string>(format: T): ExtractTokens<T>[];
  getCategories<T extends string>(format: T): GetTokenCategories<T>;
  isValidISO<T extends string>(format: T): T extends ISOFormat ? true : false;
};

// Format compilation types
type CompiledFormat = {
  tokens: FormatToken[];
  literals: string[];
  pattern: string;
  validators: Array<(date: Date) => string>;
};

// Format compilation function signatures
type FormatCompiler = {
  compile<T extends string>(format: T): CompiledFormat;
  compileISO<T extends string>(format: T): T extends ISOFormat ? CompiledFormat : never;
  compileLocale<T extends string>(format: T): T extends LocaleFormat<T> ? CompiledFormat : never;
};

// Runtime format type guards (simplified for compatibility)
type FormatTypeGuard = {
  isDateOnly(format: string): boolean;
  isTimeOnly(format: string): boolean;
  isISO(format: string): boolean;
  isLocale(format: string): boolean;
  containsTokens(format: string, tokens: string[]): boolean;
};

// Advanced format features
type ConditionalFormat<T extends string, Condition extends boolean> = Condition extends true
  ? T
  : never;

type LocalizedFormat<T extends string, Locale extends string> = `${Locale}:${T}`;

type FlexibleFormat<T extends string> = T extends `${string}{${string}}${infer Rest}`
  ? FlexibleFormat<Rest> | T
  : T;

// Format string template literal types with validation
type SafeFormatString<T extends string> = T extends `${infer Start}{${string}}${infer End}`
  ? `${Start}${string}${SafeFormatString<End>}`
  : FormatString<T>;

// Export type aliases
export type {
  FormatString,
  StandardFormats,
  FormatToken,
  FormatTokenInfo,
  FormatTokenRegistry,
  FormatWithContext,
  DateOnlyFormat,
  TimeOnlyFormat,
  ISOFormat,
  LocaleFormat,
  FormatBuilder,
  FormatValidator,
  FormatCompiler,
  CompiledFormat,
  FormatTypeGuard,
  ConditionalFormat,
  LocalizedFormat,
  FlexibleFormat,
  SafeFormatString,
  IsValidFormat,
  ValidateFormat,
  ExtractTokens,
  GetTokenCategories,
};

// Runtime format token registry (for actual implementation)
export const FORMAT_TOKENS: Record<FormatToken, FormatTokenInfo> = {
  // Year tokens
  YYYY: {
    token: 'YYYY',
    category: 'year',
    length: 4,
    description: '4-digit year',
    example: '2024',
  },
  YY: { token: 'YY', category: 'year', length: 2, description: '2-digit year', example: '24' },
  Y: { token: 'Y', category: 'year', length: 1, description: 'Year (flexible)', example: '2024' },

  // Month tokens
  MMMM: {
    token: 'MMMM',
    category: 'month',
    length: 4,
    description: 'Full month name',
    example: 'January',
  },
  MMM: {
    token: 'MMM',
    category: 'month',
    length: 3,
    description: 'Short month name',
    example: 'Jan',
  },
  MM: {
    token: 'MM',
    category: 'month',
    length: 2,
    description: 'Zero-padded month',
    example: '01',
  },
  M: { token: 'M', category: 'month', length: 1, description: 'Month', example: '1' },

  // Day tokens
  DDDD: { token: 'DDDD', category: 'day', length: 4, description: 'Day of year', example: '001' },
  DD: { token: 'DD', category: 'day', length: 2, description: 'Zero-padded day', example: '01' },
  D: { token: 'D', category: 'day', length: 1, description: 'Day', example: '1' },

  // Weekday tokens
  dddd: {
    token: 'dddd',
    category: 'weekday',
    length: 4,
    description: 'Full weekday name',
    example: 'Monday',
  },
  ddd: {
    token: 'ddd',
    category: 'weekday',
    length: 3,
    description: 'Short weekday name',
    example: 'Mon',
  },
  dd: {
    token: 'dd',
    category: 'weekday',
    length: 2,
    description: 'Min weekday name',
    example: 'Mo',
  },
  d: { token: 'd', category: 'weekday', length: 1, description: 'Weekday', example: '1' },

  // Hour tokens
  HH: {
    token: 'HH',
    category: 'hour',
    length: 2,
    description: '24-hour, zero-padded',
    example: '14',
  },
  H: { token: 'H', category: 'hour', length: 1, description: '24-hour', example: '14' },
  hh: {
    token: 'hh',
    category: 'hour',
    length: 2,
    description: '12-hour, zero-padded',
    example: '02',
  },
  h: { token: 'h', category: 'hour', length: 1, description: '12-hour', example: '2' },

  // Minute tokens
  mm: {
    token: 'mm',
    category: 'minute',
    length: 2,
    description: 'Zero-padded minutes',
    example: '05',
  },
  m: { token: 'm', category: 'minute', length: 1, description: 'Minutes', example: '5' },

  // Second tokens
  ss: {
    token: 'ss',
    category: 'second',
    length: 2,
    description: 'Zero-padded seconds',
    example: '09',
  },
  s: { token: 's', category: 'second', length: 1, description: 'Seconds', example: '9' },

  // Millisecond tokens
  SSS: {
    token: 'SSS',
    category: 'millisecond',
    length: 3,
    description: 'Zero-padded milliseconds',
    example: '123',
  },
  SS: {
    token: 'SS',
    category: 'millisecond',
    length: 2,
    description: '2-digit milliseconds',
    example: '12',
  },
  S: { token: 'S', category: 'millisecond', length: 1, description: 'Milliseconds', example: '1' },

  // Meridiem tokens
  A: { token: 'A', category: 'meridiem', length: 1, description: 'AM/PM uppercase', example: 'PM' },
  a: { token: 'a', category: 'meridiem', length: 1, description: 'am/pm lowercase', example: 'pm' },

  // Timezone tokens
  Z: {
    token: 'Z',
    category: 'timezone',
    length: 1,
    description: 'Timezone offset',
    example: '+00:00',
  },
  ZZ: {
    token: 'ZZ',
    category: 'timezone',
    length: 2,
    description: 'Timezone offset',
    example: '+0000',
  },
  ZZZ: {
    token: 'ZZZ',
    category: 'timezone',
    length: 3,
    description: 'Timezone name',
    example: 'UTC',
  },

  // Timestamp tokens
  X: {
    token: 'X',
    category: 'timestamp',
    length: 1,
    description: 'Unix timestamp (seconds)',
    example: '1640995200',
  },
  x: {
    token: 'x',
    category: 'timestamp',
    length: 1,
    description: 'Unix timestamp (milliseconds)',
    example: '1640995200000',
  },

  // Quarter tokens
  Q: { token: 'Q', category: 'quarter', length: 1, description: 'Quarter', example: '1' },
  QQ: {
    token: 'QQ',
    category: 'quarter',
    length: 2,
    description: 'Zero-padded quarter',
    example: '01',
  },

  // Week tokens
  wo: {
    token: 'wo',
    category: 'week',
    length: 2,
    description: 'Week of year ordinal',
    example: '1st',
  },
  ww: { token: 'ww', category: 'week', length: 2, description: 'Week of year', example: '01' },
  w: { token: 'w', category: 'week', length: 1, description: 'Week of year', example: '1' },

  // Week year tokens
  gg: {
    token: 'gg',
    category: 'weekYear',
    length: 2,
    description: '2-digit week year',
    example: '24',
  },
  gggg: {
    token: 'gggg',
    category: 'weekYear',
    length: 4,
    description: '4-digit week year',
    example: '2024',
  },
  k: { token: 'k', category: 'weekYear', length: 1, description: 'ISO week year', example: '2024' },
  kk: {
    token: 'kk',
    category: 'weekYear',
    length: 2,
    description: '2-digit ISO week year',
    example: '24',
  },

  // ISO day tokens
  E: { token: 'E', category: 'isoDay', length: 1, description: 'ISO day of week', example: '1' },
  EE: { token: 'EE', category: 'isoDay', length: 2, description: '2-digit ISO day', example: '01' },
  EEE: { token: 'EEE', category: 'isoDay', length: 3, description: 'ISO day name', example: 'Mon' },

  // ISO week tokens
  L: { token: 'L', category: 'isoWeek', length: 1, description: 'ISO week of year', example: '1' },
  LL: {
    token: 'LL',
    category: 'isoWeek',
    length: 2,
    description: '2-digit ISO week',
    example: '01',
  },
  LLL: {
    token: 'LLL',
    category: 'isoWeek',
    length: 3,
    description: '3-digit ISO week',
    example: '001',
  },
};
