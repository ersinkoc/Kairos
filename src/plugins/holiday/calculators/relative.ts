import type { HolidayRule, HolidayCalculator, RelativeRule } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';

export class RelativeCalculator implements HolidayCalculator {
  private holidayCache = new Map<string, Date[]>();
  private allHolidays: HolidayRule[] = [];
  private visitedHolidays: Set<string> = new Set();

  calculate(rule: HolidayRule, year: number, context?: { holidays: HolidayRule[] }): Date[] {
    const { relativeTo, offset } = rule.rule as RelativeRule;

    // Update context if provided
    if (context?.holidays) {
      this.allHolidays = context.holidays;
    }

    // Reset visited set for each top-level calculation
    this.visitedHolidays = new Set();
    this.visitedHolidays.add(rule.name);

    // Find the base holiday
    const baseHoliday = this.findBaseHoliday(relativeTo);
    if (!baseHoliday) {
      throw new Error(`Base holiday '${relativeTo}' not found for relative rule '${rule.name}'`);
    }

    // Calculate base holiday dates
    const baseDates = this.calculateBaseHolidayDates(baseHoliday, year);

    // Apply offset to each base date
    const result: Date[] = [];
    for (const baseDate of baseDates) {
      const relativeDate = new Date(baseDate);
      relativeDate.setDate(relativeDate.getDate() + offset);
      result.push(relativeDate);
    }

    return result;
  }

  private findBaseHoliday(relativeTo: string): HolidayRule | null {
    // First try to find by exact name match
    let baseHoliday = this.allHolidays.find((h) => h.name === relativeTo);

    if (!baseHoliday) {
      // Try to find by ID
      baseHoliday = this.allHolidays.find((h) => h.id === relativeTo);
    }

    if (!baseHoliday) {
      // Try case-insensitive match
      baseHoliday = this.allHolidays.find((h) => h.name.toLowerCase() === relativeTo.toLowerCase());
    }

    return baseHoliday || null;
  }

  private calculateBaseHolidayDates(baseHoliday: HolidayRule, year: number): Date[] {
    // Check for circular dependency
    if (this.visitedHolidays.has(baseHoliday.name)) {
      const chain = Array.from(this.visitedHolidays).join(' -> ');
      throw new Error(
        `Circular dependency detected in holiday chain: ${chain} -> ${baseHoliday.name}`
      );
    }

    // Mark as visited
    this.visitedHolidays.add(baseHoliday.name);

    // Check cache first
    const cacheKey = `${baseHoliday.name}-${year}`;
    if (this.holidayCache.has(cacheKey)) {
      return this.holidayCache.get(cacheKey)!;
    }

    // Calculate base holiday using appropriate calculator
    const dates = this.calculateDirectHoliday(baseHoliday, year);

    // Cache the result
    this.holidayCache.set(cacheKey, dates);

    return dates;
  }

  private calculateDirectHoliday(holiday: HolidayRule, year: number): Date[] {
    // This is a simplified implementation
    // In practice, this would use the same engine system
    switch (holiday.type) {
      case 'fixed':
        return this.calculateFixed(holiday, year);
      case 'nth-weekday':
        return this.calculateNthWeekday(holiday, year);
      case 'easter-based':
        return this.calculateEasterBased(holiday, year);
      default:
        throw new Error(`Cannot calculate base holiday of type: ${holiday.type}`);
    }
  }

  private calculateFixed(holiday: HolidayRule, year: number): Date[] {
    const { month, day } = holiday.rule as any;
    const date = new Date(year, month - 1, day);

    // Validate date
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return [];
    }

    return [date];
  }

  private calculateNthWeekday(holiday: HolidayRule, year: number): Date[] {
    const { month, weekday, nth } = holiday.rule as any;

    if (nth > 0) {
      return [this.getNthWeekdayOfMonth(year, month - 1, weekday, nth)];
    } else {
      return [this.getLastNthWeekdayOfMonth(year, month - 1, weekday, Math.abs(nth))];
    }
  }

  private calculateEasterBased(holiday: HolidayRule, year: number): Date[] {
    const { offset } = holiday.rule as any;
    const easter = this.calculateEaster(year);

    const result = new Date(easter);
    result.setDate(result.getDate() + offset);

    return [result];
  }

  private getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
    const firstDay = new Date(year, month, 1);
    const firstDayWeekday = firstDay.getDay();

    let daysUntilWeekday = weekday - firstDayWeekday;
    if (daysUntilWeekday < 0) {
      daysUntilWeekday += 7;
    }

    const date = 1 + daysUntilWeekday + (nth - 1) * 7;

    return new Date(year, month, date);
  }

  private getLastNthWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number,
    nth: number
  ): Date {
    const lastDay = new Date(year, month + 1, 0);
    const lastDayWeekday = lastDay.getDay();

    let daysBack = lastDayWeekday - weekday;
    if (daysBack < 0) {
      daysBack += 7;
    }

    const date = lastDay.getDate() - daysBack - (nth - 1) * 7;

    return new Date(year, month, date);
  }

  private calculateEaster(year: number): Date {
    // Simplified Easter calculation
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month, day);
  }

  clearCache(): void {
    this.holidayCache.clear();
  }
}

export default {
  name: 'holiday-relative-calculator',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  install(kairos, _utils) {
    const engine = kairos.holidayEngine;
    if (engine) {
      engine.registerCalculator('relative', new RelativeCalculator());
    }
  },
} as KairosPlugin;
