import type {
  HolidayRule,
  HolidayInfo,
  HolidayEngine as IHolidayEngine,
  HolidayCalculator,
} from '../../core/types/holiday.js';
import type { KairosPlugin } from '../../core/types/plugin.js';
import { createHolidayCache } from '../../core/utils/cache.js';
import { validateHolidayRule } from '../../core/utils/validators.js';
import { localeManager } from '../../core/locale-manager.js';

export class HolidayEngine implements IHolidayEngine {
  private calculators = new Map<string, HolidayCalculator>();
  private cache = createHolidayCache();
  private ruleCache = new Map<string, Map<number, Date[]>>();

  constructor() {
    this.registerCalculators();
  }

  private registerCalculators(): void {
    // Calculators are registered by their respective plugins
  }

  registerCalculator(type: string, calculator: HolidayCalculator): void {
    this.calculators.set(type, calculator);
  }

  calculate(rule: HolidayRule, year: number): Date[] {
    const errors = validateHolidayRule(rule);
    if (errors.length > 0) {
      throw new Error(`Invalid holiday rule: ${errors.join(', ')}`);
    }


    if (!this.ruleCache.has(rule.name || 'unnamed')) {
      this.ruleCache.set(rule.name || 'unnamed', new Map());
    }

    const yearCache = this.ruleCache.get(rule.name || 'unnamed')!;
    if (yearCache.has(year)) {
      return yearCache.get(year)!;
    }

    const calculator = this.calculators.get(rule.type);
    if (!calculator) {
      throw new Error(`Unknown holiday type: ${rule.type}`);
    }

    let dates = calculator.calculate(rule, year);

    // Apply observed rules if present
    if (rule.observedRule) {
      dates = this.applyObservedRules(dates, rule.observedRule);
    }

    // Apply duration if specified
    if (rule.duration && rule.duration > 1) {
      dates = this.expandDuration(dates, rule.duration);
    }

    // Cache the result
    yearCache.set(year, dates);

    return dates;
  }

  private applyObservedRules(dates: Date[], observedRule: any): Date[] {
    const result: Date[] = [];

    for (const date of dates) {
      const weekday = date.getDay();
      const isWeekend = observedRule.weekends?.includes(weekday) || weekday === 0 || weekday === 6;

      if (!isWeekend) {
        result.push(date);
        continue;
      }

      switch (observedRule.type) {
        case 'substitute':
          result.push(this.findSubstituteDate(date, observedRule));
          break;
        case 'nearest-weekday':
          result.push(this.findNearestWeekday(date));
          break;
        case 'bridge':
          result.push(date);
          result.push(this.findBridgeDate(date));
          break;
        default:
          result.push(date);
      }
    }

    return result;
  }

  private findSubstituteDate(date: Date, observedRule: any): Date {
    const direction = observedRule.direction || 'forward';
    const weekends = observedRule.weekends || [0, 6];

    let current = new Date(date);
    const increment = direction === 'forward' ? 1 : -1;

    while (weekends.includes(current.getDay())) {
      current.setDate(current.getDate() + increment);
    }

    return current;
  }

  private findNearestWeekday(date: Date): Date {
    const weekday = date.getDay();

    if (weekday === 0) {
      // Sunday
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    } else if (weekday === 6) {
      // Saturday
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    }

    return date;
  }

  private findBridgeDate(date: Date): Date {
    // Simple bridge logic - can be enhanced
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  }

  private expandDuration(dates: Date[], duration: number): Date[] {
    const result: Date[] = [];

    for (const date of dates) {
      for (let i = 0; i < duration; i++) {
        const expandedDate = new Date(date);
        expandedDate.setDate(expandedDate.getDate() + i);
        result.push(expandedDate);
      }
    }

    return result;
  }

  isHoliday(date: Date, holidays: HolidayRule[]): HolidayInfo | null {
    const year = date.getFullYear();

    for (const holiday of holidays) {
      if (!holiday.active && holiday.active !== undefined) {
        continue;
      }

      const holidayDates = this.calculateWithContext(holiday, year, holidays);

      for (const holidayDate of holidayDates) {
        if (this.isSameDay(date, holidayDate)) {
          return {
            id: holiday.id || holiday.name,
            name: holiday.name,
            type: holiday.type,
            date: holidayDate,
            regions: holiday.regions || [],
          };
        }
      }
    }

    return null;
  }

  getHolidaysForYear(year: number, holidays: HolidayRule[]): HolidayInfo[] {
    const result: HolidayInfo[] = [];

    for (const holiday of holidays) {
      if (!holiday.active && holiday.active !== undefined) {
        continue;
      }

      const dates = this.calculateWithContext(holiday, year, holidays);

      for (const date of dates) {
        result.push({
          id: holiday.id || holiday.name,
          name: holiday.name,
          type: holiday.type,
          date,
          regions: holiday.regions || [],
        });
      }
    }

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculateWithContext(rule: HolidayRule, year: number, allHolidays: HolidayRule[]): Date[] {
    const errors = validateHolidayRule(rule);
    if (errors.length > 0) {
      throw new Error(`Invalid holiday rule: ${errors.join(', ')}`);
    }


    if (!this.ruleCache.has(rule.name || 'unnamed')) {
      this.ruleCache.set(rule.name || 'unnamed', new Map());
    }

    const yearCache = this.ruleCache.get(rule.name || 'unnamed')!;
    if (yearCache.has(year)) {
      return yearCache.get(year)!;
    }

    const calculator = this.calculators.get(rule.type);
    if (!calculator) {
      throw new Error(`Unknown holiday type: ${rule.type}`);
    }

    // Pass context with all holidays for relative calculations
    let dates: Date[];
    if (rule.type === 'relative') {
      dates = (calculator as any).calculate(rule, year, { holidays: allHolidays });
    } else {
      dates = calculator.calculate(rule, year);
    }

    // Apply observed rules if present
    if (rule.observedRule) {
      dates = this.applyObservedRules(dates, rule.observedRule);
    }

    // Apply duration if specified
    if (rule.duration && rule.duration > 1) {
      dates = this.expandDuration(dates, rule.duration);
    }

    // Cache the result
    yearCache.set(year, dates);

    return dates;
  }

  getHolidaysInRange(start: Date, end: Date, holidays: HolidayRule[]): HolidayInfo[] {
    const result: HolidayInfo[] = [];
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const yearHolidays = this.getHolidaysForYear(year, holidays);

      for (const holiday of yearHolidays) {
        if (holiday.date >= start && holiday.date <= end) {
          result.push(holiday);
        }
      }
    }

    return result;
  }

  getNextHoliday(after: Date, holidays: HolidayRule[]): HolidayInfo | null {
    const year = after.getFullYear();

    // Check current year
    const currentYearHolidays = this.getHolidaysForYear(year, holidays);
    for (const holiday of currentYearHolidays) {
      if (holiday.date > after) {
        return holiday;
      }
    }

    // Check next year
    const nextYearHolidays = this.getHolidaysForYear(year + 1, holidays);
    return nextYearHolidays[0] || null;
  }

  getPreviousHoliday(before: Date, holidays: HolidayRule[]): HolidayInfo | null {
    const year = before.getFullYear();

    // Check current year
    const currentYearHolidays = this.getHolidaysForYear(year, holidays);
    for (let i = currentYearHolidays.length - 1; i >= 0; i--) {
      const holiday = currentYearHolidays[i];
      if (holiday.date < before) {
        return holiday;
      }
    }

    // Check previous year
    const prevYearHolidays = this.getHolidaysForYear(year - 1, holidays);
    return prevYearHolidays[prevYearHolidays.length - 1] || null;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  clearCache(): void {
    this.cache.clear();
    this.ruleCache.clear();
  }
}

// Global engine instance
const engine = new HolidayEngine();

export default {
  name: 'holiday-engine',
  version: '1.0.0',
  size: 2048,
  install(kairos, _utils) {
    kairos.extend({
      isHoliday(holidays?: HolidayRule[]): boolean {
        const rules = holidays || localeManager.getHolidays();
        return engine.isHoliday(this.toDate(), rules) !== null;
      },

      getHolidayInfo(holidays?: HolidayRule[]): HolidayInfo | null {
        const rules = holidays || localeManager.getHolidays();
        return engine.isHoliday(this.toDate(), rules);
      },

      nextHoliday(holidays?: HolidayRule[]): any {
        const rules = holidays || localeManager.getHolidays();
        const next = engine.getNextHoliday(this.toDate(), rules);
        return next ? kairos(next.date) : null;
      },

      previousHoliday(holidays?: HolidayRule[]): any {
        const rules = holidays || localeManager.getHolidays();
        const prev = engine.getPreviousHoliday(this.toDate(), rules);
        return prev ? kairos(prev.date) : null;
      },

      // Generic getHolidays that uses the locale manager
      getHolidays(type?: string): HolidayRule[] {
        return localeManager.getHolidays(undefined, type);
      },
    });

    kairos.addStatic?.({
      getYearHolidays(year: number, holidays: HolidayRule[]): HolidayInfo[] {
        return engine.getHolidaysForYear(year, holidays);
      },

      getHolidaysInRange(start: any, end: any, holidays: HolidayRule[]): HolidayInfo[] {
        const startDate = kairos(start).toDate();
        const endDate = kairos(end).toDate();
        return engine.getHolidaysInRange(startDate, endDate, holidays);
      },

      holidayEngine: engine,
    });
  },
} as KairosPlugin;
