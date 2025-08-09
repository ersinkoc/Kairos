export interface HolidayRule {
  id?: string;
  name: string;
  type: 'fixed' | 'nth-weekday' | 'relative' | 'lunar' | 'easter-based' | 'custom';
  rule: FixedRule | NthWeekdayRule | RelativeRule | LunarRule | EasterRule | CustomRule;
  duration?: number;
  regions?: string[];
  active?: boolean;
  observedRule?: ObservedRule;
}

export interface FixedRule {
  month: number;
  day: number;
}

export interface NthWeekdayRule {
  month: number;
  weekday: number;
  nth: number;
}

export interface RelativeRule {
  relativeTo: string;
  offset: number;
}

export interface LunarRule {
  calendar: 'islamic' | 'chinese' | 'hebrew' | 'persian';
  month: number;
  day: number;
}

export interface EasterRule {
  offset: number;
}

export interface CustomRule {
  calculate: (year: number, context?: any) => Date | Date[];
}

export interface ObservedRule {
  type: 'substitute' | 'bridge' | 'nearest-weekday';
  weekends?: number[];
  direction?: 'forward' | 'backward' | 'nearest';
}

export interface HolidayInfo {
  id: string;
  name: string;
  type: string;
  date: Date;
  originalDate?: Date;
  observed?: boolean;
  duration?: number;
  regions?: string[];
}

export interface HolidayCalculator {
  calculate(rule: HolidayRule, year: number, context?: any): Date[];
}

export interface HolidayEngine {
  calculate(rule: HolidayRule, year: number): Date[];
  isHoliday(date: Date, holidays: HolidayRule[]): HolidayInfo | null;
  getHolidaysForYear(year: number, holidays: HolidayRule[]): HolidayInfo[];
  getHolidaysInRange(start: Date, end: Date, holidays: HolidayRule[]): HolidayInfo[];
  getNextHoliday(after: Date, holidays: HolidayRule[]): HolidayInfo | null;
  getPreviousHoliday(before: Date, holidays: HolidayRule[]): HolidayInfo | null;
}

export interface CalendarConverter {
  toGregorian(year: number, month: number, day: number): Date;
  fromGregorian(date: Date): { year: number; month: number; day: number };
}

export interface HolidaySet {
  name: string;
  code: string;
  holidays: HolidayRule[];
  regions?: Record<string, HolidayRule[]>;
}

export interface BusinessDayConfig {
  weekends?: number[];
  holidays?: HolidayRule[];
  customRules?: ((date: Date) => boolean)[];
}
