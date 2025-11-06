import type { HolidayRule, HolidayCalculator, CustomRule } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';

export class CustomCalculator implements HolidayCalculator {
  calculate(rule: HolidayRule, year: number, context?: any): Date[] {
    const { calculate } = rule.rule as CustomRule;

    if (typeof calculate !== 'function') {
      throw new Error(`Custom rule '${rule.name}' must have a calculate function`);
    }

    try {
      const result = calculate(year, context);

      // Normalize result to array of dates
      if (result instanceof Date) {
        return [result];
      } else if (Array.isArray(result)) {
        return result.filter((item) => item instanceof Date);
      } else {
        throw new Error(`Custom rule '${rule.name}' must return Date or Date[]`);
      }
    } catch (error) {
      throw new Error(
        `Error calculating custom rule '${rule.name}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Utility functions for custom calculations
export const CustomCalculatorUtils = {
  // Calculate vernal equinox (approximate)
  calculateVernalEquinox(year: number): Date {
    // Simplified calculation - in practice use more accurate astronomical calculations
    const base = new Date(year, 2, 20); // March 20 base
    const adjustment = Math.floor((year - 2000) * 0.24); // Approximate adjustment
    base.setDate(base.getDate() + adjustment);
    return base;
  },

  // Calculate autumnal equinox (approximate)
  calculateAutumnalEquinox(year: number): Date {
    // Simplified calculation
    const base = new Date(year, 8, 23); // September 23 base
    const adjustment = Math.floor((year - 2000) * 0.24); // Approximate adjustment
    base.setDate(base.getDate() + adjustment);
    return base;
  },

  // Calculate summer solstice (approximate)
  calculateSummerSolstice(year: number): Date {
    const base = new Date(year, 5, 21); // June 21 base
    const adjustment = Math.floor((year - 2000) * 0.24);
    base.setDate(base.getDate() + adjustment);
    return base;
  },

  // Calculate winter solstice (approximate)
  calculateWinterSolstice(year: number): Date {
    const base = new Date(year, 11, 21); // December 21 base
    const adjustment = Math.floor((year - 2000) * 0.24);
    base.setDate(base.getDate() + adjustment);
    return base;
  },

  // Find first/last specific weekday in month
  findWeekdayInMonth(
    year: number,
    month: number,
    weekday: number,
    position: 'first' | 'last'
  ): Date {
    if (position === 'first') {
      const firstDay = new Date(year, month, 1);
      const firstDayWeekday = firstDay.getDay();

      let daysUntilWeekday = weekday - firstDayWeekday;
      if (daysUntilWeekday < 0) {
        daysUntilWeekday += 7;
      }

      return new Date(year, month, 1 + daysUntilWeekday);
    } else {
      const lastDay = new Date(year, month + 1, 0);
      const lastDayWeekday = lastDay.getDay();

      let daysBack = lastDayWeekday - weekday;
      if (daysBack < 0) {
        daysBack += 7;
      }

      return new Date(year, month, lastDay.getDate() - daysBack);
    }
  },

  // Calculate moon phases (very simplified)
  calculateNewMoon(year: number, month: number): Date {
    // Simplified lunar calculation - in practice use proper astronomical calculations
    const daysInMonth = new Date(year, month, 0).getDate();
    const approximateNewMoon = Math.floor(daysInMonth * 0.5);
    return new Date(year, month - 1, approximateNewMoon);
  },

  calculateFullMoon(year: number, month: number): Date {
    const newMoon = this.calculateNewMoon(year, month);
    const fullMoon = new Date(newMoon);
    fullMoon.setDate(fullMoon.getDate() + 14); // Approximate 14 days after new moon
    return fullMoon;
  },

  // Business day calculations
  getNextBusinessDay(date: Date): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  },

  getPreviousBusinessDay(date: Date): Date {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);

    while (prev.getDay() === 0 || prev.getDay() === 6) {
      prev.setDate(prev.getDate() - 1);
    }

    return prev;
  },

  // Time zone considerations
  getDateInTimezone(date: Date, timezone: string): Date {
    // Use Intl.DateTimeFormat to properly extract date components in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10) - 1;
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);
    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);

    // Create a new local date with these components
    return new Date(year, month, day, hour, minute, second, date.getMilliseconds());
  },

  // Daylight saving time transitions
  getDSTTransition(year: number, type: 'spring' | 'fall'): Date {
    if (type === 'spring') {
      // Second Sunday in March (US)
      return this.findWeekdayInMonth(year, 2, 0, 'first');
    } else {
      // First Sunday in November (US)
      return this.findWeekdayInMonth(year, 10, 0, 'first');
    }
  },

  // Japanese Golden Week calculation
  calculateGoldenWeekSubstitutes(year: number): Date[] {
    const holidays = [
      new Date(year, 3, 29), // Showa Day (April 29)
      new Date(year, 4, 3), // Constitution Day (May 3)
      new Date(year, 4, 4), // Greenery Day (May 4)
      new Date(year, 4, 5), // Children's Day (May 5)
    ];

    const substitutes: Date[] = [];

    for (const holiday of holidays) {
      const weekday = holiday.getDay();

      // If holiday falls on Sunday, next Monday is substitute
      if (weekday === 0) {
        const substitute = new Date(holiday);
        substitute.setDate(substitute.getDate() + 1);
        substitutes.push(substitute);
      }
    }

    return substitutes;
  },

  // Chinese Qingming Festival calculation
  calculateQingming(year: number): Date {
    // Qingming is around April 4-6, based on solar terms
    // Simplified calculation
    const base = new Date(year, 3, 5); // April 5 base
    const adjustment = Math.floor((year - 2000) * 0.24);
    base.setDate(base.getDate() + adjustment);
    return base;
  },
};

export default {
  name: 'holiday-custom-calculator',
  version: '1.0.0',
  size: 1536,
  dependencies: ['holiday-engine'],
  install(kairos, _utils) {
    const engine = kairos.holidayEngine;
    if (engine) {
      engine.registerCalculator('custom', new CustomCalculator());
    }

    // Add utility functions to kairos static
    kairos.addStatic?.({
      customCalculatorUtils: CustomCalculatorUtils,
    });
  },
} as KairosPlugin;
