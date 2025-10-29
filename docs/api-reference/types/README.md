# Type Reference

This section contains comprehensive type definitions used throughout Kairos.

## Type Aliases

### TimeUnit

```typescript
type TimeUnit = | 'year'
  | 'years'
  | 'y'
  | 'month'
  | 'months'
  | 'M'
  | 'week'
  | 'weeks'
  | 'w'
  | 'day'
  | 'days'
  | 'd'
  | 'hour'
  | 'hours'
  | 'h'
  | 'minute'
  | 'minutes'
  | 'm'
  | 'second'
  | 'seconds'
  | 's'
  | 'millisecond'
  | 'milliseconds'
  | 'ms';
```

### KairosInput

```typescript
type KairosInput = string | number | Date | KairosInstance | DateLike | undefined;
```

### Timestamp

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Timestamp = Brand<number, 'Timestamp'>;
```

### Year

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Year = Brand<number, 'Year'>;
```

### Month

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Month = Brand<number, 'Month'>;
```

### Day

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Day = Brand<number, 'Day'>;
```

### Hour

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Hour = Brand<number, 'Hour'>;
```

### Minute

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Minute = Brand<number, 'Minute'>;
```

### Second

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Second = Brand<number, 'Second'>;
```

### Millisecond

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Millisecond = Brand<number, 'Millisecond'>;
```

### DayOfWeek

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type DayOfWeek = Brand<number, 'DayOfWeek'>;
```

### DayOfYear

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type DayOfYear = Brand<number, 'DayOfYear'>;
```

### WeekOfYear

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type WeekOfYear = Brand<number, 'WeekOfYear'>;
```

### LocaleCode

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type LocaleCode = Brand<string, 'LocaleCode'>;
```

### TimeZone

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type TimeZone = Brand<string, 'TimeZone'>;
```

### FormatString

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type FormatString = Brand<string, 'FormatString'>;
```

### DateString

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type DateString = Brand<string, 'DateString'>;
```

### HolidayId

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type HolidayId = Brand<string, 'HolidayId'>;
```

### BusinessDayId

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type BusinessDayId = Brand<string, 'BusinessDayId'>;
```

### Compare

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type Compare = {
  equals: (other: number) => boolean;
```

### InRange

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type InRange = (min: number, max: number) => boolean;
```

### SafeDateArithmetic

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type SafeDateArithmetic = {
  addYears: (years: Year) => void;
```

### SafeDateComponents

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type SafeDateComponents = {
  year: Year;
```

### SafeDateValidation

Provides type-safe identifiers and prevents accidental mixing of different value types

```typescript
type SafeDateValidation = {
  isValidYear: (year: unknown) => year is Year;
```

### DateComponents

Provides type-safe manipulation and validation of date-related data

```typescript
type DateComponents = {
  year: number;
```

### StrictDateComponents

Provides type-safe manipulation and validation of date-related data

```typescript
type StrictDateComponents = Required<DateComponents>;
```

### PartialDateComponents

Provides type-safe manipulation and validation of date-related data

```typescript
type PartialDateComponents = Partial<DateComponents>;
```

### DateRange

Provides type-safe manipulation and validation of date-related data

```typescript
type DateRange = {
  start: Date | string | number;
```

### DateRangeInclusive

Provides type-safe manipulation and validation of date-related data

```typescript
type DateRangeInclusive = DateRange & { inclusive: true };
```

### DateRangeExclusive

Provides type-safe manipulation and validation of date-related data

```typescript
type DateRangeExclusive = DateRange & { inclusive: false };
```

### DateArithmeticOperation

Provides type-safe manipulation and validation of date-related data

```typescript
type DateArithmeticOperation = | { add: { amount: number;
```

### TimeUnit

Provides type-safe manipulation and validation of date-related data

```typescript
type TimeUnit = | 'year' | 'years'
  | 'month' | 'months'
  | 'week' | 'weeks'
  | 'day' | 'days'
  | 'hour' | 'hours'
  | 'minute' | 'minutes'
  | 'second' | 'seconds'
  | 'millisecond' | 'milliseconds';
```

### ComparisonResult

Provides type-safe manipulation and validation of date-related data

```typescript
type ComparisonResult = -1 | 0 | 1;
```

### DateComparison

Provides type-safe manipulation and validation of date-related data

```typescript
type DateComparison = | 'before' | 'after' | 'same'
  | 'less' | 'greater' | 'equal'
  | ComparisonResult;
```

### ValidationResult

Provides type-safe manipulation and validation of date-related data

```typescript
type ValidationResult = | { valid: true;
```

### DateValidation

Provides type-safe manipulation and validation of date-related data

```typescript
type DateValidation = ValidationResult<DateComponents>;
```

### DateParser

Provides type-safe manipulation and validation of date-related data

```typescript
type DateParser = (input: T) => Date | null;
```

### DateFormatter

Provides type-safe manipulation and validation of date-related data

```typescript
type DateFormatter = (date: Date, format?: string) => string;
```

### LocaleData

Provides type-safe manipulation and validation of date-related data

```typescript
type LocaleData = {
  name: string;
```

### HolidayType

Provides type-safe manipulation and validation of date-related data

```typescript
type HolidayType = | 'fixed'
  | 'nth-weekday'
  | 'easter-based'
  | 'lunar'
  | 'relative'
  | 'custom';
```

### HolidayRuleBase

Provides type-safe manipulation and validation of date-related data

```typescript
type HolidayRuleBase = {
  name: string;
```

### FixedHoliday

Provides type-safe manipulation and validation of date-related data

```typescript
type FixedHoliday = HolidayRuleBase<'fixed'> & {
  month: number;
```

### NthWeekdayHoliday

Provides type-safe manipulation and validation of date-related data

```typescript
type NthWeekdayHoliday = HolidayRuleBase<'nth-weekday'> & {
  month: number;
```

### EasterHoliday

Provides type-safe manipulation and validation of date-related data

```typescript
type EasterHoliday = HolidayRuleBase<'easter-based'> & {
  offset: number;
```

### LunarHoliday

Provides type-safe manipulation and validation of date-related data

```typescript
type LunarHoliday = HolidayRuleBase<'lunar'> & {
  month: number;
```

### RelativeHoliday

Provides type-safe manipulation and validation of date-related data

```typescript
type RelativeHoliday = HolidayRuleBase<'relative'> & {
  relativeTo: string;
```

### CustomHoliday

Provides type-safe manipulation and validation of date-related data

```typescript
type CustomHoliday = HolidayRuleBase<'custom'> & {
  calculate: (year: number) => Date[];
```

### HolidayRule

Provides type-safe manipulation and validation of date-related data

```typescript
type HolidayRule = | FixedHoliday
  | NthWeekdayHoliday
  | EasterHoliday
  | LunarHoliday
  | RelativeHoliday
  | CustomHoliday;
```

### BusinessDayConfig

Provides type-safe manipulation and validation of date-related data

```typescript
type BusinessDayConfig = {
  weekdays: number[];
```

### BusinessDayResult

Provides type-safe manipulation and validation of date-related data

```typescript
type BusinessDayResult = {
  date: Date;
```

### DurationComponents

Provides type-safe manipulation and validation of date-related data

```typescript
type DurationComponents = {
  years?: number;
```

### DurationUnit

Provides type-safe manipulation and validation of date-related data

```typescript
type DurationUnit = keyof DurationComponents;
```

### Duration

Provides type-safe manipulation and validation of date-related data

```typescript
type Duration = {
  as: (unit: DurationUnit) => number;
```

### PluginType

Provides type-safe manipulation and validation of date-related data

```typescript
type PluginType = | 'parser'
  | 'formatter'
  | 'locale'
  | 'holiday'
  | 'business'
  | 'relative'
  | 'timezone'
  | 'duration'
  | 'range'
  | 'calendar';
```

### PluginHook

Provides type-safe manipulation and validation of date-related data

```typescript
type PluginHook = 'beforeParse' | 'afterParse' | 'beforeFormat' | 'afterFormat' | 'beforeValidation' | 'afterValidation';
```

### PluginContext

Provides type-safe manipulation and validation of date-related data

```typescript
type PluginContext = {
  config: any;
```

### KairosConfig

Provides type-safe manipulation and validation of date-related data

```typescript
type KairosConfig = {
  locale?: string;
```

### KairosErrorType

Provides type-safe manipulation and validation of date-related data

```typescript
type KairosErrorType = | 'INVALID_DATE'
  | 'INVALID_FORMAT'
  | 'INVALID_LOCALE'
  | 'INVALID_TIMEZONE'
  | 'PARSING_ERROR'
  | 'VALIDATION_ERROR'
  | 'PLUGIN_ERROR'
  | 'CONFIGURATION_ERROR';
```

### KairosError

Provides type-safe manipulation and validation of date-related data

```typescript
type KairosError = {
  type: KairosErrorType;
```

### KairosEvent

Provides type-safe manipulation and validation of date-related data

```typescript
type KairosEvent = | 'change:locale'
  | 'change:timezone'
  | 'plugin:loaded'
  | 'plugin:unloaded'
  | 'memory:warning'
  | 'memory:critical'
  | 'error';
```

### EventHandler

Provides type-safe manipulation and validation of date-related data

```typescript
type EventHandler = (data: T) => void;
```

### TypeGuard

Provides type-safe manipulation and validation of date-related data

```typescript
type TypeGuard = (value: unknown) => value is T;
```

### AsyncResult

Provides type-safe manipulation and validation of date-related data

```typescript
type AsyncResult = | { success: true;
```

### AsyncFunction

Provides type-safe manipulation and validation of date-related data

```typescript
type AsyncFunction = (...args: A) => Promise<T>;
```

### Predicate

Provides type-safe manipulation and validation of date-related data

```typescript
type Predicate = (value: T) => boolean;
```

### Mapper

Provides type-safe manipulation and validation of date-related data

```typescript
type Mapper = (value: T) => U;
```

### Reducer

Provides type-safe manipulation and validation of date-related data

```typescript
type Reducer = (accumulator: U, value: T, index: number, array: T[]) => U;
```

### DateCollection

Provides type-safe manipulation and validation of date-related data

```typescript
type DateCollection = Date[];
```

### DateSet

Provides type-safe manipulation and validation of date-related data

```typescript
type DateSet = Set<Date>;
```

### DateMap

Provides type-safe manipulation and validation of date-related data

```typescript
type DateMap = Map<K, Date>;
```

### ImmutableOperation

Provides type-safe manipulation and validation of date-related data

```typescript
type ImmutableOperation = (value: T) => T;
```

### ImmutableTransformer

Provides type-safe manipulation and validation of date-related data

```typescript
type ImmutableTransformer = (value: T) => U;
```

### SerializedDate

Provides type-safe manipulation and validation of date-related data

```typescript
type SerializedDate = string | number | {
  year: number;
```

### SerializationFormat

Provides type-safe manipulation and validation of date-related data

```typescript
type SerializationFormat = | 'iso'
  | 'timestamp'
  | 'object'
  | 'custom';
```

### DeepPartial

Provides type-safe manipulation and validation of date-related data

```typescript
type DeepPartial = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
```

### DeepRequired

Provides type-safe manipulation and validation of date-related data

```typescript
type DeepRequired = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
```

### DeepReadonly

Provides type-safe manipulation and validation of date-related data

```typescript
type DeepReadonly = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
```

### DeepMutable

Provides type-safe manipulation and validation of date-related data

```typescript
type DeepMutable = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
```

### NonNullable

Provides type-safe manipulation and validation of date-related data

```typescript
type NonNullable = T extends null | undefined ? never : T;
```

### NonUndefined

Provides type-safe manipulation and validation of date-related data

```typescript
type NonUndefined = T extends undefined ? never : T;
```

### NonNull

Provides type-safe manipulation and validation of date-related data

```typescript
type NonNull = T extends null ? never : T;
```

### RequireAtLeastOne

Provides type-safe manipulation and validation of date-related data

```typescript
type RequireAtLeastOne = Partial<T> & {
  [K in keyof T]-?: T[K];
```

### ExactlyOne

Provides type-safe manipulation and validation of date-related data

```typescript
type ExactlyOne = Partial<T> & {
  [K in keyof T]?: T[K];
```

### Path

Provides type-safe manipulation and validation of date-related data

```typescript
type Path = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${Path<T[K]>}`
          : K
        : never;
```

### PathValue

Provides type-safe manipulation and validation of date-related data

```typescript
type PathValue = P extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? Rest extends Path<T[First]>
      ? PathValue<T[First], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;
```

### Parameters

Provides type-safe manipulation and validation of date-related data

```typescript
type Parameters = T extends (...args: infer P) => any ? P : never;
```

### ReturnType

Provides type-safe manipulation and validation of date-related data

```typescript
type ReturnType = T extends (...args: any[]) => infer R ? R : never;
```

### ArgumentsType

Provides type-safe manipulation and validation of date-related data

```typescript
type ArgumentsType = T extends (...args: infer P) => any ? P : never;
```

### EventMap

Provides type-safe manipulation and validation of date-related data

```typescript
type EventMap = Record<string, any>;
```

### EventKey

Provides type-safe manipulation and validation of date-related data

```typescript
type EventKey = string & keyof T;
```

### FunctionBuilder

Provides type-safe manipulation and validation of date-related data

```typescript
type FunctionBuilder = {
  <R>(fn: (...args: T) => R): (...args: T) => R;
```

### ValidationSchema

Provides type-safe manipulation and validation of date-related data

```typescript
type ValidationSchema = {
  [K in keyof T]: {
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
```

### ValidationErrors

Provides type-safe manipulation and validation of date-related data

```typescript
type ValidationErrors = {
  [K in keyof T]?: string[];
```

### RecoveryStrategy

Provides comprehensive error handling, recovery strategies, and monitoring

```typescript
type RecoveryStrategy = | 'ignore'
  | 'retry'
  | 'fallback'
  | 'sanitize'
  | 'transform'
  | 'delegate'
  | 'abort';
```

### ErrorSeverity

Provides comprehensive error handling, recovery strategies, and monitoring

```typescript
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
```

## Interfaces

### LocaleConfig

**Extends:** LocaleData

#### Properties

- `holidays`: `HolidayRule[]` (Optional)
- `stateHolidays`: `Record<string, HolidayRule[]>` (Optional)
- `federalHolidays`: `HolidayRule[]` (Optional)
- `publicHolidays`: `HolidayRule[]` (Optional)
- `observances`: `HolidayRule[]` (Optional)
- `key`: `string]: any`

#### Index Signatures

- `[key: string]`: `any`

### KairosInstance

#### Properties

- `value`: `number): KairosInstance`
- `value`: `number): KairosInstance`
- `value`: `number): KairosInstance`
- `value`: `number): KairosInstance`
- `value`: `number): KairosInstance`
- `value`: `number): KairosInstance`
- `value`: `number): KairosInstance`
- `amount`: `number, unit: TimeUnit): KairosInstance`
- `amount`: `number, unit: TimeUnit): KairosInstance`
- `other`: `KairosInstance): boolean`
- `other`: `KairosInstance): boolean`
- `other`: `KairosInstance): boolean`
- `template`: `string): string` (Optional)
- `key`: `string]: any`

#### Methods

- `valueOf`(``): `number`
- `toString`(``): `string`
- `toISOString`(``): `string`
- `toDate`(``): `Date`
- `clone`(``): `KairosInstance`
- `year`(``): `number`
- `month`(``): `number`
- `date`(``): `number`
- `day`(``): `number`
- `hour`(``): `number`
- `minute`(``): `number`
- `second`(``): `number`
- `millisecond`(``): `number`
- `year`(`value: number`): `KairosInstance`
- `month`(`value: number`): `KairosInstance`
- `date`(`value: number`): `KairosInstance`
- `hour`(`value: number`): `KairosInstance`
- `minute`(`value: number`): `KairosInstance`
- `second`(`value: number`): `KairosInstance`
- `millisecond`(`value: number`): `KairosInstance`
- `add`(`amount: number, unit: TimeUnit`): `KairosInstance`
- `subtract`(`amount: number, unit: TimeUnit`): `KairosInstance`
- `isBefore`(`other: KairosInstance`): `boolean`
- `isAfter`(`other: KairosInstance`): `boolean`
- `isSame`(`other: KairosInstance`): `boolean`
- `format`(`template: string`): `string`

#### Index Signatures

- `[key: string]`: `any`

### DateLike

#### Properties

- `_date`: `Date` (Optional)
- `year`: `number` (Optional)
- `month`: `number` (Optional)
- `day`: `number` (Optional)
- `hour`: `number` (Optional)
- `minute`: `number` (Optional)
- `second`: `number` (Optional)
- `millisecond`: `number` (Optional)
- `date`: `Date` (Optional)

### KairosPlugin

#### Properties

- `name`: `string`
- `version`: `string` (Optional)
- `size`: `number` (Optional)
- `dependencies`: `string[]` (Optional)
- `kairos`: `KairosStatic, utils: any): void`

#### Methods

- `install`(`kairos: KairosStatic, utils: any`): `void`

### KairosStatic

#### Properties

- `input`: `KairosInput): KairosInstance` (Optional)
- `plugin`: `KairosPlugin | KairosPlugin[]): KairosStatic`
- `methods`: `Record<string, (...args: any[]) => any>): void`
- `name`: `string): string | void` (Optional)
- `input`: `KairosInput): KairosInstance` (Optional)
- `timestamp`: `number): KairosInstance`
- `plugins`: `Map<string, KairosPlugin>`
- `key`: `string]: any`

#### Methods

- `use`(`plugin: KairosPlugin | KairosPlugin[]`): `KairosStatic`
- `locale`(`name: string`): `string | void`
- `utc`(`input: KairosInput`): `KairosInstance`
- `unix`(`timestamp: number`): `KairosInstance`

#### Index Signatures

- `[key: string]`: `any`

### KairosConfig

#### Properties

- `locale`: `string`
- `timezone`: `string` (Optional)
- `strict`: `boolean` (Optional)
- `suppressDeprecationWarnings`: `boolean` (Optional)

### HolidayRule

#### Properties

- `id`: `string` (Optional)
- `name`: `string`
- `type`: `'fixed' | 'nth-weekday' | 'relative' | 'lunar' | 'easter-based' | 'custom'`
- `rule`: `FixedRule | NthWeekdayRule | RelativeRule | LunarRule | EasterRule | CustomRule`
- `duration`: `number` (Optional)
- `regions`: `string[]` (Optional)
- `active`: `boolean` (Optional)
- `observedRule`: `ObservedRule` (Optional)

### FixedRule

#### Properties

- `month`: `number`
- `day`: `number`

### NthWeekdayRule

#### Properties

- `month`: `number`
- `weekday`: `number`
- `nth`: `number`

### RelativeRule

#### Properties

- `relativeTo`: `string`
- `offset`: `number`

### LunarRule

#### Properties

- `calendar`: `'islamic' | 'chinese' | 'hebrew' | 'persian'`
- `month`: `number`
- `day`: `number`

### EasterRule

#### Properties

- `offset`: `number`

### CustomRule

#### Properties

- `calculate`: `(year: number, context?: any) => Date | Date[]`

### ObservedRule

#### Properties

- `type`: `'substitute' | 'bridge' | 'nearest-weekday'`
- `weekends`: `number[]` (Optional)
- `direction`: `'forward' | 'backward' | 'nearest'` (Optional)

### HolidayInfo

#### Properties

- `id`: `string`
- `name`: `string`
- `type`: `string`
- `date`: `Date`
- `originalDate`: `Date` (Optional)
- `observed`: `boolean` (Optional)
- `duration`: `number` (Optional)
- `regions`: `string[]` (Optional)

### HolidayCalculator

#### Properties

- `rule`: `HolidayRule, year: number, context?: any): Date[]`

#### Methods

- `calculate`(`rule: HolidayRule, year: number, context: any`): `Date[]`

### HolidayEngine

#### Properties

- `rule`: `HolidayRule, year: number): Date[]`
- `date`: `Date, holidays: HolidayRule[]): HolidayInfo | null`
- `year`: `number, holidays: HolidayRule[]): HolidayInfo[]`
- `start`: `Date, end: Date, holidays: HolidayRule[]): HolidayInfo[]`
- `after`: `Date, holidays: HolidayRule[]): HolidayInfo | null`
- `before`: `Date, holidays: HolidayRule[]): HolidayInfo | null`

#### Methods

- `calculate`(`rule: HolidayRule, year: number`): `Date[]`
- `isHoliday`(`date: Date, holidays: HolidayRule[]`): `HolidayInfo | null`
- `getHolidaysForYear`(`year: number, holidays: HolidayRule[]`): `HolidayInfo[]`
- `getHolidaysInRange`(`start: Date, end: Date, holidays: HolidayRule[]`): `HolidayInfo[]`
- `getNextHoliday`(`after: Date, holidays: HolidayRule[]`): `HolidayInfo | null`
- `getPreviousHoliday`(`before: Date, holidays: HolidayRule[]`): `HolidayInfo | null`

### CalendarConverter

#### Properties

- `year`: `number, month: number, day: number): Date`
- `date`: `Date): { year: number`
- `month`: `number`

#### Methods

- `toGregorian`(`year: number, month: number, day: number`): `Date`
- `fromGregorian`(`date: Date`): `{ year: number`

### HolidaySet

#### Properties

- `name`: `string`
- `code`: `string`
- `holidays`: `HolidayRule[]`
- `regions`: `Record<string, HolidayRule[]>` (Optional)

### BusinessDayConfig

#### Properties

- `weekends`: `number[]` (Optional)
- `holidays`: `HolidayRule[]` (Optional)
- `customRules`: `((date: Date) => boolean)[]` (Optional)

### KairosPlugin

#### Properties

- `name`: `string`
- `version`: `string` (Optional)
- `dependencies`: `string[]` (Optional)
- `install`: `(kairos: KairosStatic, config?: any) => void`
- `size`: `number` (Optional)

### PluginContext

#### Properties

- `kairos`: `KairosStatic`
- `config`: `any`
- `utils`: `PluginUtils`

### PluginUtils

#### Properties

- `cache`: `Map<string, any>`
- `memoize`: `<T extends (...args: any[]) => any>(fn: T) => T`
- `validateInput`: `(input: any, type: string) => boolean`
- `throwError`: `(message: string, code?: string) => never`

### ParsePlugin

**Extends:** KairosPlugin

#### Properties

- `parse`: `(input: string, format?: string) => Date | null`
- `patterns`: `RegExp[]` (Optional)

### FormatPlugin

**Extends:** KairosPlugin

#### Properties

- `format`: `(date: Date, template: string) => string`
- `tokens`: `Record<string, (date: Date) => string>` (Optional)

### LocalePlugin

**Extends:** KairosPlugin

#### Properties

- `locale`: `{
    name: string`
- `code`: `string`
- `months`: `string[]`
- `monthsShort`: `string[]`
- `weekdays`: `string[]`
- `weekdaysShort`: `string[]`
- `weekdaysMin`: `string[]`
- `formats`: `{
      LT: string`
- `LTS`: `string`
- `L`: `string`
- `LL`: `string`
- `LLL`: `string`
- `LLLL`: `string`

### ExtensionMethods

#### Properties

- `key`: `string]: (this: KairosInstance, ...args: any[]) => any`

#### Index Signatures

- `[key: string]`: `(this: KairosInstance, ...args: any[]) => any`

### StaticMethods

#### Properties

- `key`: `string]: (...args: any[]) => any`

#### Index Signatures

- `[key: string]`: `(...args: any[]) => any`

### ErrorContext

Provides comprehensive error handling, recovery strategies, and monitoring

#### Properties

- `operation`: `string`
- `component`: `string`
- `input`: `any` (Optional)
- `timestamp`: `Date`
- `userId`: `string` (Optional)
- `sessionId`: `string` (Optional)
- `requestId`: `string` (Optional)
- `metadata`: `Record<string, any>` (Optional)

### ErrorRecoveryResult

Provides comprehensive error handling, recovery strategies, and monitoring

#### Properties

- `recovered`: `boolean`
- `strategy`: `RecoveryStrategy`
- `result`: `any` (Optional)
- `error`: `Error` (Optional)
- `attempts`: `number`
- `duration`: `number`
- `fallbackUsed`: `boolean` (Optional)

### RecoveryConfig

Provides comprehensive error handling, recovery strategies, and monitoring

#### Properties

- `maxAttempts`: `number`
- `baseDelay`: `number`
- `maxDelay`: `number`
- `backoffMultiplier`: `number`
- `jitter`: `boolean`
- `retryableErrors`: `string[]`
- `fallbackValue`: `any` (Optional)
- `fallbackFunction`: `(error: Error, context: ErrorContext) => any`
- `sanitizeFunction`: `(input: any) => any` (Optional)
- `transformFunction`: `(input: any) => any` (Optional)
- `delegateFunction`: `(error: Error, context: ErrorContext) => Promise<any>` (Optional)

### ErrorMetrics

Provides comprehensive error handling, recovery strategies, and monitoring

#### Properties

- `totalErrors`: `number`
- `errorsByType`: `Record<string, number>`
- `errorsByComponent`: `Record<string, number>`
- `errorsBySeverity`: `Record<ErrorSeverity, number>`
- `recoveryAttempts`: `number`
- `successfulRecoveries`: `number`
- `failedRecoveries`: `number`
- `averageRecoveryTime`: `number`
- `lastError`: `Date`
- `criticalErrors`: `number`

### ErrorAlert

Provides comprehensive error handling, recovery strategies, and monitoring

#### Properties

- `type`: `'error_rate' | 'critical_errors' | 'recovery_failure'`
- `severity`: `'low' | 'medium' | 'high' | 'critical'`
- `message`: `string`
- `metrics`: `ErrorMetrics`
- `timestamp`: `Date`

### ErrorManagerConfig

Integrates validation, error handling, and recovery into a unified system

#### Properties

- `validation`: `{
    strict: boolean`
- `sanitize`: `boolean`
- `transform`: `boolean`
- `stopOnFirstError`: `boolean`
- `cacheResults`: `boolean`

### ErrorManagerResult

Integrates validation, error handling, and recovery into a unified system

#### Properties

- `success`: `boolean`
- `data`: `T` (Optional)
- `error`: `KairosBaseError` (Optional)
- `validation`: `EnhancedValidationResult` (Optional)
- `recovery`: `ErrorRecoveryResult` (Optional)
- `performance`: `{
    validationTime: number`
- `handlingTime`: `number`
- `totalTime`: `number`

### OperationConfig

Integrates validation, error handling, and recovery into a unified system

#### Properties

- `name`: `string`
- `component`: `string`
- `input`: `TInput` (Optional)
- `schema`: `string` (Optional)
- `validation`: `Partial<ValidationContext>` (Optional)
- `operation`: `(input: TInput) => TOutput | Promise<TOutput>` (Optional)
- `fallback`: `(error: KairosBaseError, input: TInput) => TOutput | Promise<TOutput>` (Optional)
- `timeout`: `number` (Optional)
- `retries`: `number` (Optional)
- `skipValidation`: `boolean` (Optional)

### MemorySnapshot

Provides real-time memory usage tracking and alerting

#### Properties

- `timestamp`: `number`
- `rss`: `number`
- `heapTotal`: `number`
- `heapUsed`: `number`
- `external`: `number`
- `arrayBuffers`: `number`
- `heapLimit`: `number` (Optional)

### MemoryAlert

Provides real-time memory usage tracking and alerting

#### Properties

- `type`: `'warning' | 'critical' | 'emergency'`
- `message`: `string`
- `threshold`: `number`
- `current`: `number`
- `timestamp`: `number`

### MemoryThresholds

Provides real-time memory usage tracking and alerting

#### Properties

- `heapUsed`: `{ warning: number` (Optional)
- `critical`: `number`

### PoolableObject

Provides efficient object reuse to reduce garbage collection overhead

### ValidationContext

Provides comprehensive validation with schema definitions, context, and detailed error reporting

#### Properties

- `operation`: `string`
- `path`: `string` (Optional)
- `strict`: `boolean` (Optional)
- `sanitize`: `boolean` (Optional)
- `transform`: `boolean` (Optional)
- `stopOnFirstError`: `boolean` (Optional)
- `locale`: `string` (Optional)
- `timezone`: `string` (Optional)
- `partial`: `boolean` (Optional)

### ValidationRule

Provides comprehensive validation with schema definitions, context, and detailed error reporting

#### Properties

- `name`: `string`
- `required`: `boolean` (Optional)
- `type`: `'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'function'`
- `min`: `number` (Optional)
- `max`: `number` (Optional)
- `minLength`: `number` (Optional)
- `maxLength`: `number` (Optional)
- `pattern`: `RegExp` (Optional)
- `enum`: `T[]` (Optional)
- `custom`: `(value: any, context: ValidationContext) => boolean | string` (Optional)
- `message`: `string` (Optional)
- `transform`: `(value: any) => any` (Optional)
- `sanitize`: `boolean` (Optional)

### EnhancedValidationResult

Provides comprehensive validation with schema definitions, context, and detailed error reporting

#### Properties

- `valid`: `boolean`
- `data`: `T` (Optional)
- `errors`: `ValidationErrorDetail[]`
- `warnings`: `ValidationWarning[]`
- `context`: `ValidationContext`
- `sanitized`: `boolean`
- `transformed`: `boolean`
- `performance`: `{
    duration: number`
- `rulesChecked`: `number`
- `rulesSkipped`: `number`

### ValidationErrorDetail

Provides comprehensive validation with schema definitions, context, and detailed error reporting

#### Properties

- `field`: `string`
- `value`: `any`
- `rule`: `string`
- `message`: `string`
- `code`: `string`
- `severity`: `'error' | 'warning' | 'info'`
- `path`: `string`
- `context`: `ValidationContext`

### ValidationWarning

Provides comprehensive validation with schema definitions, context, and detailed error reporting

#### Properties

- `field`: `string`
- `value`: `any`
- `message`: `string`
- `code`: `string`
- `suggestion`: `string` (Optional)

### EnhancedValidationSchema

Provides comprehensive validation with schema definitions, context, and detailed error reporting

#### Properties

- `name`: `string`
- `description`: `string` (Optional)
- `version`: `string`
- `rules`: `Record<keyof T, ValidationRule>`
- `strict`: `boolean` (Optional)
- `sanitize`: `boolean` (Optional)
- `transform`: `boolean` (Optional)
- `stopOnFirstError`: `boolean` (Optional)
- `customValidators`: `Record<string, (value: any, context: ValidationContext) => boolean | string>` (Optional)

### FiscalYearConfig

#### Properties

- `start`: `number | string`
- `skipHolidays`: `boolean` (Optional)
- `country`: `string` (Optional)

### DurationObject

Object representation of duration components.

#### Properties

- `years`: `number` (Optional)
- `months`: `number` (Optional)
- `weeks`: `number` (Optional)
- `days`: `number` (Optional)
- `hours`: `number` (Optional)
- `minutes`: `number` (Optional)
- `seconds`: `number` (Optional)
- `milliseconds`: `number` (Optional)

### TimezoneInfo

#### Properties

- `name`: `string`
- `abbreviation`: `string`
- `offset`: `number`
- `dst`: `boolean`

