import type { BusinessDayConfig } from '../../core/types/holiday.js';
import type { KairosInstance } from '../../core/types/base.js';
import type { KairosPlugin } from '../../core/types/plugin.js';

/**
 * Calculator for business day operations with configurable weekends and holidays.
 * Provides efficient caching for repeated calculations.
 * 
 * @example
 * ```typescript
 * import { BusinessDayCalculator } from 'kairos/plugins/business';
 * 
 * const calculator = new BusinessDayCalculator({
 *   weekends: [0, 6],  // Sunday, Saturday
 *   holidays: [
 *     { id: 'new-year', name: 'New Year', type: 'fixed', rule: { month: 1, day: 1 } }
 *   ]
 * });
 * 
 * const isBusinessDay = calculator.isBusinessDay(new Date());
 * const nextBusinessDay = calculator.nextBusinessDay(new Date());
 * ```
 */
export class BusinessDayCalculator {
  private config: BusinessDayConfig;
  private cache = new Map<string, boolean>();

  /**
   * Creates a new BusinessDayCalculator.
   * 
   * @param config - Configuration object for business day rules
   * @param config.weekends - Array of weekend days (0=Sunday, 1=Monday, etc.)
   * @param config.holidays - Array of holiday rules
   * @param config.customRules - Array of custom rule functions
   */
  constructor(config: BusinessDayConfig = {}) {
    this.config = {
      weekends: [0, 6], // Sunday, Saturday
      holidays: [],
      customRules: [],
      ...config,
    };
  }

  updateConfig(config: Partial<BusinessDayConfig>): void {
    this.config = { ...this.config, ...config };
    this.cache.clear();
  }

  /**
   * Checks if a given date is a business day.
   * Business days exclude weekends, holidays, and any custom rules.
   * Results are cached for performance.
   * 
   * @param date - The date to check
   * @returns True if the date is a business day
   * 
   * @example
   * ```typescript
   * const calc = new BusinessDayCalculator();
   * 
   * console.log(calc.isBusinessDay(new Date('2024-01-01'))); // false (New Year)
   * console.log(calc.isBusinessDay(new Date('2024-01-02'))); // true (Tuesday)
   * console.log(calc.isBusinessDay(new Date('2024-01-06'))); // false (Saturday)
   * ```
   */
  isBusinessDay(date: Date): boolean {
    const cacheKey = date.toISOString().split('T')[0];
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = this.calculateIsBusinessDay(date);
    this.cache.set(cacheKey, result);
    return result;
  }

  private calculateIsBusinessDay(date: Date): boolean {
    // Check if it's a weekend
    const dayOfWeek = date.getDay();
    if (this.config.weekends?.includes(dayOfWeek)) {
      return false;
    }

    // Check if it's a holiday
    if (this.config.holidays && this.config.holidays.length > 0) {
      const holidayEngine = (globalThis as any).kairos?.holidayEngine;
      if (holidayEngine) {
        const holidayInfo = holidayEngine.isHoliday(date, this.config.holidays);
        if (holidayInfo) {
          return false;
        }
      }
    }

    // Check custom rules
    if (this.config.customRules) {
      for (const rule of this.config.customRules) {
        if (!rule(date)) {
          return false;
        }
      }
    }

    return true;
  }

  nextBusinessDay(date: Date): Date {
    let next = new Date(date);
    next.setDate(next.getDate() + 1);

    while (!this.isBusinessDay(next)) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }

  previousBusinessDay(date: Date): Date {
    let prev = new Date(date);
    prev.setDate(prev.getDate() - 1);

    while (!this.isBusinessDay(prev)) {
      prev.setDate(prev.getDate() - 1);
    }

    return prev;
  }

  addBusinessDays(date: Date, days: number): Date {
    if (days === 0) return new Date(date);

    let current = new Date(date);
    let count = 0;
    const direction = days > 0 ? 1 : -1;
    const target = Math.abs(days);

    while (count < target) {
      current.setDate(current.getDate() + direction);

      if (this.isBusinessDay(current)) {
        count++;
      }
    }

    return current;
  }

  businessDaysBetween(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getTime() === endDate.getTime()) {
      return 0;
    }

    const isForward = startDate < endDate;
    const direction = isForward ? 1 : -1;
    let count = 0;
    let current = new Date(startDate);

    while (current.getTime() !== endDate.getTime()) {
      current.setDate(current.getDate() + direction);

      if (this.isBusinessDay(current)) {
        count++;
      }
    }

    return count * direction;
  }

  businessDaysInMonth(year: number, month: number): number {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return this.businessDaysBetween(firstDay, lastDay) + (this.isBusinessDay(firstDay) ? 1 : 0);
  }

  businessDaysInYear(year: number): number {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);

    return this.businessDaysBetween(firstDay, lastDay) + (this.isBusinessDay(firstDay) ? 1 : 0);
  }

  // Settlement date calculation (T+N business days)
  settlementDate(date: Date, days: number): Date {
    return this.addBusinessDays(date, days);
  }

  // Get all business days in a month
  getBusinessDaysInMonth(year: number, month: number): Date[] {
    const result: Date[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let current = new Date(firstDay);

    while (current <= lastDay) {
      if (this.isBusinessDay(current)) {
        result.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  // Get all business days in a date range
  getBusinessDaysInRange(start: Date, end: Date): Date[] {
    const result: Date[] = [];
    let current = new Date(start);

    while (current <= end) {
      if (this.isBusinessDay(current)) {
        result.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  // Get Nth business day of month
  getNthBusinessDay(year: number, month: number, nth: number): Date | null {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let current = new Date(firstDay);
    let count = 0;

    while (current <= lastDay) {
      if (this.isBusinessDay(current)) {
        count++;
        if (count === nth) {
          return new Date(current);
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return null;
  }

  // Get last business day of month
  getLastBusinessDay(year: number, month: number): Date | null {
    const lastDay = new Date(year, month + 1, 0);
    let current = new Date(lastDay);

    while (current.getMonth() === month) {
      if (this.isBusinessDay(current)) {
        return new Date(current);
      }
      current.setDate(current.getDate() - 1);
    }

    return null;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Default business day calculator
const defaultCalculator = new BusinessDayCalculator();

export default {
  name: 'business-workday',
  version: '1.0.0',
  size: 2048,
  dependencies: ['holiday-engine'],
  install(kairos, _utils) {
    // Add business day methods to Kairos instances
    kairos.extend({
      isBusinessDay(config?: BusinessDayConfig): boolean {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;

        // Get holidays from current locale if available
        if (!config?.holidays && this.getHolidays) {
          const holidays = this.getHolidays();
          calculator.updateConfig({ holidays });
        }

        return calculator.isBusinessDay(this.toDate());
      },

      isWeekend(): boolean {
        const dayOfWeek = this.day();
        return dayOfWeek === 0 || dayOfWeek === 6;
      },

      nextBusinessDay(config?: BusinessDayConfig): KairosInstance {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;

        if (!config?.holidays && this.getHolidays) {
          const holidays = this.getHolidays();
          calculator.updateConfig({ holidays });
        }

        const nextDate = calculator.nextBusinessDay(this.toDate());
        return kairos(nextDate);
      },

      previousBusinessDay(config?: BusinessDayConfig): KairosInstance {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;

        if (!config?.holidays && this.getHolidays) {
          const holidays = this.getHolidays();
          calculator.updateConfig({ holidays });
        }

        const prevDate = calculator.previousBusinessDay(this.toDate());
        return kairos(prevDate);
      },

      addBusinessDays(days: number, config?: BusinessDayConfig): KairosInstance {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;

        if (!config?.holidays && this.getHolidays) {
          const holidays = this.getHolidays();
          calculator.updateConfig({ holidays });
        }

        const resultDate = calculator.addBusinessDays(this.toDate(), days);
        return kairos(resultDate);
      },

      businessDaysBetween(other: KairosInstance, config?: BusinessDayConfig): number {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;

        if (!config?.holidays && this.getHolidays) {
          const holidays = this.getHolidays();
          calculator.updateConfig({ holidays });
        }

        return calculator.businessDaysBetween(this.toDate(), other.toDate());
      },

      businessDaysInMonth(config?: BusinessDayConfig): number {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;

        if (!config?.holidays && this.getHolidays) {
          const holidays = this.getHolidays();
          calculator.updateConfig({ holidays });
        }

        return calculator.businessDaysInMonth(this.year(), this.month() - 1);
      },

      settlementDate(days: number, config?: BusinessDayConfig): KairosInstance {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;

        if (!config?.holidays && this.getHolidays) {
          const holidays = this.getHolidays();
          calculator.updateConfig({ holidays });
        }

        const settlementDate = calculator.settlementDate(this.toDate(), days);
        return kairos(settlementDate);
      },

      // Check if it's a working hour (9 AM to 5 PM by default)
      isWorkingHour(startHour: number = 9, endHour: number = 17): boolean {
        const hour = this.hour();
        return this.isBusinessDay() && hour >= startHour && hour < endHour;
      },
    });

    // Add static methods
    kairos.addStatic?.({
      businessDayCalculator: defaultCalculator,

      createBusinessDayCalculator(config: BusinessDayConfig): BusinessDayCalculator {
        return new BusinessDayCalculator(config);
      },

      getBusinessDaysInMonth(year: number, month: number, config?: BusinessDayConfig): any[] {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
        const dates = calculator.getBusinessDaysInMonth(year, month - 1);
        return dates.map((date) => kairos(date));
      },

      getBusinessDaysInRange(start: any, end: any, config?: BusinessDayConfig): any[] {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
        const startDate = kairos(start).toDate();
        const endDate = kairos(end).toDate();
        const dates = calculator.getBusinessDaysInRange(startDate, endDate);
        return dates.map((date) => kairos(date));
      },

      getNthBusinessDay(year: number, month: number, nth: number, config?: BusinessDayConfig): any {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
        const date = calculator.getNthBusinessDay(year, month - 1, nth);
        return date ? kairos(date) : null;
      },

      getLastBusinessDay(year: number, month: number, config?: BusinessDayConfig): any {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
        const date = calculator.getLastBusinessDay(year, month - 1);
        return date ? kairos(date) : null;
      },

      businessDaysInYear(year: number, config?: BusinessDayConfig): number {
        const calculator = config ? new BusinessDayCalculator(config) : defaultCalculator;
        return calculator.businessDaysInYear(year);
      },
    });
  },
} as KairosPlugin;
