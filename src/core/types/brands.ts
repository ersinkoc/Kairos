/**
 * Advanced Branded Types for Kairos
 * Provides type-safe identifiers and prevents accidental mixing of different value types
 */

// Branded type utility
declare const brand: unique symbol;
type Brand<T, B> = T & { [brand]: B };

// Core branded types
export type Timestamp = Brand<number, 'Timestamp'>;
export type Year = Brand<number, 'Year'>;
export type Month = Brand<number, 'Month'>;
export type Day = Brand<number, 'Day'>;
export type Hour = Brand<number, 'Hour'>;
export type Minute = Brand<number, 'Minute'>;
export type Second = Brand<number, 'Second'>;
export type Millisecond = Brand<number, 'Millisecond'>;

export type DayOfWeek = Brand<number, 'DayOfWeek'>; // 0-6 (Sun-Sat)
export type DayOfYear = Brand<number, 'DayOfYear'>; // 1-366
export type WeekOfYear = Brand<number, 'WeekOfYear'>; // 1-53

export type LocaleCode = Brand<string, 'LocaleCode'>;
export type TimeZone = Brand<string, 'TimeZone'>;
export type FormatString = Brand<string, 'FormatString'>;
export type DateString = Brand<string, 'DateString'>;

export type HolidayId = Brand<string, 'HolidayId'>;
export type BusinessDayId = Brand<string, 'BusinessDayId'>;

// Branded type factories
export const createTimestamp = (value: number): Timestamp => value as Timestamp;
export const createYear = (value: number): Year => value as Year;
export const createMonth = (value: number): Month => value as Month;
export const createDay = (value: number): Day => value as Day;
export const createHour = (value: number): Hour => value as Hour;
export const createMinute = (value: number): Minute => value as Minute;
export const createSecond = (value: number): Second => value as Second;
export const createMillisecond = (value: number): Millisecond => value as Millisecond;

export const createDayOfWeek = (value: number): DayOfWeek => value as DayOfWeek;
export const createDayOfYear = (value: number): DayOfYear => value as DayOfYear;
export const createWeekOfYear = (value: number): WeekOfYear => value as WeekOfYear;

export const createLocaleCode = (value: string): LocaleCode => value as LocaleCode;
export const createTimeZone = (value: string): TimeZone => value as TimeZone;
export const createFormatString = (value: string): FormatString => value as FormatString;
export const createDateString = (value: string): DateString => value as DateString;

export const createHolidayId = (value: string): HolidayId => value as HolidayId;
export const createBusinessDayId = (value: string): BusinessDayId => value as BusinessDayId;

// Validation functions for branded types
export const isValidTimestamp = (value: number): value is Timestamp =>
  Number.isInteger(value) && value >= -8640000000000000 && value <= 8640000000000000;

export const isValidYear = (value: number): value is Year =>
  Number.isInteger(value) && value >= 1 && value <= 9999;

export const isValidMonth = (value: number): value is Month =>
  Number.isInteger(value) && value >= 1 && value <= 12;

export const isValidDay = (value: number): value is Day =>
  Number.isInteger(value) && value >= 1 && value <= 31;

export const isValidHour = (value: number): value is Hour =>
  Number.isInteger(value) && value >= 0 && value <= 23;

export const isValidMinute = (value: number): value is Minute =>
  Number.isInteger(value) && value >= 0 && value <= 59;

export const isValidSecond = (value: number): value is Second =>
  Number.isInteger(value) && value >= 0 && value <= 59;

export const isValidMillisecond = (value: number): value is Millisecond =>
  Number.isInteger(value) && value >= 0 && value <= 999;

export const isValidDayOfWeek = (value: number): value is DayOfWeek =>
  Number.isInteger(value) && value >= 0 && value <= 6;

export const isValidDayOfYear = (value: number): value is DayOfYear =>
  Number.isInteger(value) && value >= 1 && value <= 366;

export const isValidWeekOfYear = (value: number): value is WeekOfYear =>
  Number.isInteger(value) && value >= 1 && value <= 53;

export const isValidLocaleCode = (value: string): value is LocaleCode =>
  /^[a-z]{2}-[A-Z]{2}$/.test(value);

export const isValidFormatString = (value: string): value is FormatString =>
  value.length > 0 && /^[A-Za-z0-9\-\s]+$/.test(value);

// Safe conversion functions
export const toTimestamp = (value: number): Timestamp | null =>
  isValidTimestamp(value) ? createTimestamp(value) : null;

export const toYear = (value: number): Year | null =>
  isValidYear(value) ? createYear(value) : null;

export const toMonth = (value: number): Month | null =>
  isValidMonth(value) ? createMonth(value) : null;

export const toDay = (value: number): Day | null => (isValidDay(value) ? createDay(value) : null);

export const toHour = (value: number): Hour | null =>
  isValidHour(value) ? createHour(value) : null;

export const toMinute = (value: number): Minute | null =>
  isValidMinute(value) ? createMinute(value) : null;

export const toSecond = (value: number): Second | null =>
  isValidSecond(value) ? createSecond(value) : null;

export const toMillisecond = (value: number): Millisecond | null =>
  isValidMillisecond(value) ? createMillisecond(value) : null;

export const toDayOfWeek = (value: number): DayOfWeek | null =>
  isValidDayOfWeek(value) ? createDayOfWeek(value) : null;

export const toDayOfYear = (value: number): DayOfYear | null =>
  isValidDayOfYear(value) ? createDayOfYear(value) : null;

export const toWeekOfYear = (value: number): WeekOfYear | null =>
  isValidWeekOfYear(value) ? createWeekOfYear(value) : null;

export const toLocaleCode = (value: string): LocaleCode | null =>
  isValidLocaleCode(value) ? createLocaleCode(value) : null;

export const toFormatString = (value: string): FormatString | null =>
  isValidFormatString(value) ? createFormatString(value) : null;

// Type guards for runtime checking
export const isTimestamp = (value: unknown): value is Timestamp =>
  typeof value === 'number' && isValidTimestamp(value);

export const isYear = (value: unknown): value is Year =>
  typeof value === 'number' && isValidYear(value);

export const isMonth = (value: unknown): value is Month =>
  typeof value === 'number' && isValidMonth(value);

export const isDay = (value: unknown): value is Day =>
  typeof value === 'number' && isValidDay(value);

export const isHour = (value: unknown): value is Hour =>
  typeof value === 'number' && isValidHour(value);

export const isMinute = (value: unknown): value is Minute =>
  typeof value === 'number' && isValidMinute(value);

export const isSecond = (value: unknown): value is Second =>
  typeof value === 'number' && isValidSecond(value);

export const isMillisecond = (value: unknown): value is Millisecond =>
  typeof value === 'number' && isValidMillisecond(value);

export const isDayOfWeek = (value: unknown): value is DayOfWeek =>
  typeof value === 'number' && isValidDayOfWeek(value);

export const isDayOfYear = (value: unknown): value is DayOfYear =>
  typeof value === 'number' && isValidDayOfYear(value);

export const isWeekOfYear = (value: unknown): value is WeekOfYear =>
  typeof value === 'number' && isValidWeekOfYear(value);

export const isLocaleCode = (value: unknown): value is LocaleCode =>
  typeof value === 'string' && isValidLocaleCode(value);

export const isFormatString = (value: unknown): value is FormatString =>
  typeof value === 'string' && isValidFormatString(value);

// Simplified branded type utilities
// Note: Complex conditional types have been simplified for compilation compatibility

// Basic branded type comparison
export type Compare = {
  equals: (other: number) => boolean;
  greaterThan: (other: number) => boolean;
  lessThan: (other: number) => boolean;
};

// Basic range check
export type InRange = (min: number, max: number) => boolean;

// Example usage type definitions
export type SafeDateArithmetic = {
  addYears: (years: Year) => void;
  addMonths: (months: Month) => void;
  addDays: (days: Day) => void;
  addHours: (hours: Hour) => void;
  addMinutes: (minutes: Minute) => void;
  addSeconds: (seconds: Second) => void;
  addMilliseconds: (milliseconds: Millisecond) => void;
};

export type SafeDateComponents = {
  year: Year;
  month: Month;
  day: Day;
  hour: Hour;
  minute: Minute;
  second: Second;
  millisecond: Millisecond;
  dayOfWeek: DayOfWeek;
  dayOfYear: DayOfYear;
  weekOfYear: WeekOfYear;
};

export type SafeDateValidation = {
  isValidYear: (year: unknown) => year is Year;
  isValidMonth: (month: unknown) => month is Month;
  isValidDay: (day: unknown) => day is Day;
  // ... other validations
};
