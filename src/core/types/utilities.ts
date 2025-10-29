/**
 * Advanced Utility Types for Common Date Operations
 * Provides type-safe manipulation and validation of date-related data
 */

// Date component types
export type DateComponents = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour?: number; // 0-23
  minute?: number; // 0-59
  second?: number; // 0-59
  millisecond?: number; // 0-999
};

export type StrictDateComponents = Required<DateComponents>;

export type PartialDateComponents = Partial<DateComponents>;

// Date range types
export type DateRange = {
  start: Date | string | number;
  end: Date | string | number;
  inclusive?: boolean;
};

export type DateRangeInclusive = DateRange & { inclusive: true };
export type DateRangeExclusive = DateRange & { inclusive: false };

// Date arithmetic types
export type DateArithmeticOperation =
  | { add: { amount: number; unit: TimeUnit } }
  | { subtract: { amount: number; unit: TimeUnit } }
  | { set: DateComponents }
  | { startOf: TimeUnit }
  | { endOf: TimeUnit };

export type TimeUnit =
  | 'year'
  | 'years'
  | 'month'
  | 'months'
  | 'week'
  | 'weeks'
  | 'day'
  | 'days'
  | 'hour'
  | 'hours'
  | 'minute'
  | 'minutes'
  | 'second'
  | 'seconds'
  | 'millisecond'
  | 'milliseconds';

// Comparison result types
export type ComparisonResult = -1 | 0 | 1;
export type DateComparison =
  | 'before'
  | 'after'
  | 'same'
  | 'less'
  | 'greater'
  | 'equal'
  | ComparisonResult;

// Validation types
export type ValidationResult<T> = { valid: true; data: T } | { valid: false; errors: string[] };

export type DateValidation = ValidationResult<DateComponents>;

// Parser/Formatter types
export type DateParser<T = unknown> = (input: T) => Date | null;
export type DateFormatter = (date: Date, format?: string) => string;

// Locale types
export type LocaleData = {
  name: string;
  code: string;
  months: string[];
  monthsShort: string[];
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  meridiem: (hour: number, minute: number, isLowercase: boolean) => string;
  formats: {
    LTS: string;
    LT: string;
    L: string;
    LL: string;
    LLL: string;
    LLLL: string;
  };
};

// Holiday types
export type HolidayType =
  | 'fixed'
  | 'nth-weekday'
  | 'easter-based'
  | 'lunar'
  | 'relative'
  | 'custom';

export type HolidayRuleBase<T extends HolidayType> = {
  name: string;
  type: T;
  active?: boolean;
  observedRule?: {
    weekends?: number[];
    type: 'substitute' | 'observed' | 'shifted';
    shiftTo?: number;
  };
  duration?: number;
};

export type FixedHoliday = HolidayRuleBase<'fixed'> & {
  month: number;
  day: number;
};

export type NthWeekdayHoliday = HolidayRuleBase<'nth-weekday'> & {
  month: number;
  weekday: number;
  nth: number;
};

export type EasterHoliday = HolidayRuleBase<'easter-based'> & {
  offset: number;
  calendar?: 'western' | 'orthodox';
};

export type LunarHoliday = HolidayRuleBase<'lunar'> & {
  month: number;
  day: number;
  calendar: 'chinese' | 'hebrew' | 'islamic';
  yearOffset?: number;
};

export type RelativeHoliday = HolidayRuleBase<'relative'> & {
  relativeTo: string;
  offset: number;
  condition?: string;
};

export type CustomHoliday = HolidayRuleBase<'custom'> & {
  calculate: (year: number) => Date[];
};

export type HolidayRule =
  | FixedHoliday
  | NthWeekdayHoliday
  | EasterHoliday
  | LunarHoliday
  | RelativeHoliday
  | CustomHoliday;

// Business day types
export type BusinessDayConfig = {
  weekdays: number[]; // 0-6 (Sun-Sat), typically [1,2,3,4,5] for Mon-Fri
  holidays?: string[]; // Holiday names or IDs
  customRules?: Array<{
    date: string | Date;
    isBusinessDay: boolean;
    reason?: string;
  }>;
  timezone?: string;
  locale?: string;
};

export type BusinessDayResult = {
  date: Date;
  isBusinessDay: boolean;
  reason?: string;
  nextBusinessDay?: Date;
  previousBusinessDay?: Date;
};

// Duration types
export type DurationComponents = {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export type DurationUnit = keyof DurationComponents;

export type Duration = {
  as: (unit: DurationUnit) => number;
  humanize: (options?: { suffix?: boolean; round?: boolean }) => string;
  toISOString: () => string;
  toJSON: () => DurationComponents;
};

// Plugin types
export type PluginType =
  | 'parser'
  | 'formatter'
  | 'locale'
  | 'holiday'
  | 'business'
  | 'relative'
  | 'timezone'
  | 'duration'
  | 'range'
  | 'calendar';

export type PluginHook =
  | 'beforeParse'
  | 'afterParse'
  | 'beforeFormat'
  | 'afterFormat'
  | 'beforeValidation'
  | 'afterValidation';

export type PluginContext = {
  config: any;
  locale: string;
  timezone: string;
  strict: boolean;
};

// Configuration types
export type KairosConfig = {
  locale?: string;
  timezone?: string;
  strict?: boolean;
  format?: string;
  plugins?: string[];
  memory?: {
    monitoring?: boolean;
    pooling?: boolean;
    thresholds?: any;
  };
};

// Error types
export type KairosErrorType =
  | 'INVALID_DATE'
  | 'INVALID_FORMAT'
  | 'INVALID_LOCALE'
  | 'INVALID_TIMEZONE'
  | 'PARSING_ERROR'
  | 'VALIDATION_ERROR'
  | 'PLUGIN_ERROR'
  | 'CONFIGURATION_ERROR';

export type KairosError = {
  type: KairosErrorType;
  message: string;
  input?: any;
  code?: string;
  stack?: string;
};

// Event types
export type KairosEvent =
  | 'change:locale'
  | 'change:timezone'
  | 'plugin:loaded'
  | 'plugin:unloaded'
  | 'memory:warning'
  | 'memory:critical'
  | 'error';

export type EventHandler<T = any> = (data: T) => void;

// Type guards
export type TypeGuard<T> = (value: unknown) => value is T;

// Async operation types
export type AsyncResult<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export type AsyncFunction<T = any, A extends any[] = any[]> = (...args: A) => Promise<T>;

// Functional programming types
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, value: T, index: number, array: T[]) => U;

// Collection types
export type DateCollection = Date[];
export type DateSet = Set<Date>;
export type DateMap<K> = Map<K, Date>;

// Immutable operation types
export type ImmutableOperation<T> = (value: T) => T;
export type ImmutableTransformer<T, U> = (value: T) => U;

// Serialization types
export type SerializedDate =
  | string
  | number
  | {
      year: number;
      month: number;
      day: number;
      hour?: number;
      minute?: number;
      second?: number;
      millisecond?: number;
      timezone?: string;
    };

export type SerializationFormat = 'iso' | 'timestamp' | 'object' | 'custom';

// Advanced utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

// Conditional utility types
export type NonNullable<T> = T extends null | undefined ? never : T;
export type NonUndefined<T> = T extends undefined ? never : T;
export type NonNull<T> = T extends null ? never : T;

// Simplified utility types for better compatibility
export type RequireAtLeastOne<T> = Partial<T> & {
  [K in keyof T]-?: T[K];
};

export type ExactlyOne<T> = Partial<T> & {
  [K in keyof T]?: T[K];
};

// Path types for nested object access
export type Path<T> = T extends object
  ? {
      [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${Path<T[K]>}` : K) : never;
    }[keyof T]
  : never;

export type PathValue<T, P extends string> = P extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? Rest extends Path<T[First]>
      ? PathValue<T[First], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

// Function type utilities
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
export type ArgumentsType<T> = T extends (...args: infer P) => any ? P : never;

// Event emitter types
export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventListener<T extends EventMap, K extends EventKey<T>> = (payload: T[K]) => void;

// Generic function builder types
export type FunctionBuilder<T extends any[]> = {
  <R>(fn: (...args: T) => R): (...args: T) => R;
  <R>(fn: (...args: T) => Promise<R>): (...args: T) => Promise<R>;
};

// Validation schema types
export type ValidationSchema<T> = {
  [K in keyof T]: {
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean | string;
  };
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

// Note: Types are already exported individually throughout the file
// No duplicate export block needed to avoid conflicts
