import type {
  HolidayRule,
  HolidayCalculator,
  NthWeekdayRule,
} from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';

export class NthWeekdayCalculator implements HolidayCalculator {
  calculate(rule: HolidayRule, year: number): Date[] {
    const { month, weekday, nth } = rule.rule as NthWeekdayRule;

    if (nth > 0) {
      // Nth occurrence from start of month
      return [this.getNthWeekdayOfMonth(year, month - 1, weekday, nth)];
    } else {
      // Nth occurrence from end of month (nth = -1 means last)
      return [this.getLastNthWeekdayOfMonth(year, month - 1, weekday, Math.abs(nth))];
    }
  }

  private getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
    const firstDay = new Date(year, month, 1);
    const firstDayWeekday = firstDay.getDay();

    // Calculate days until first occurrence of weekday
    let daysUntilWeekday = weekday - firstDayWeekday;
    if (daysUntilWeekday < 0) {
      daysUntilWeekday += 7;
    }

    // Calculate date of nth occurrence
    const date = 1 + daysUntilWeekday + (nth - 1) * 7;

    // Validate the date exists in the month
    const result = new Date(year, month, date);
    if (result.getMonth() !== month) {
      throw new Error(
        `${nth}${this.getOrdinalSuffix(nth)} ${this.getWeekdayName(weekday)} of ${this.getMonthName(month)} ${year} does not exist`
      );
    }

    return result;
  }

  private getLastNthWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number,
    nth: number
  ): Date {
    // Start from last day of month
    const lastDay = new Date(year, month + 1, 0);
    const lastDayWeekday = lastDay.getDay();

    // Calculate days back to last occurrence of weekday
    let daysBack = lastDayWeekday - weekday;
    if (daysBack < 0) {
      daysBack += 7;
    }

    // Calculate date of nth from last occurrence
    const date = lastDay.getDate() - daysBack - (nth - 1) * 7;

    // Validate the date is positive
    if (date < 1) {
      throw new Error(
        `${nth}${this.getOrdinalSuffix(nth)} to last ${this.getWeekdayName(weekday)} of ${this.getMonthName(month)} ${year} does not exist`
      );
    }

    return new Date(year, month, date);
  }

  private getOrdinalSuffix(n: number): string {
    if (n >= 11 && n <= 13) return 'th';
    switch (n % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  private getWeekdayName(weekday: number): string {
    // BUG FIX (BUG-HIGH-003): Validate weekday index to prevent confusing error messages
    if (weekday < 0 || weekday > 6) {
      throw new Error(`Invalid weekday: ${weekday}. Must be 0-6 (Sunday-Saturday).`);
    }
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return names[weekday];
  }

  private getMonthName(month: number): string {
    // BUG FIX (BUG-HIGH-003): Validate month index to prevent confusing error messages
    if (month < 0 || month > 11) {
      throw new Error(`Invalid month: ${month}. Must be 0-11 (January-December).`);
    }
    const names = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return names[month];
  }
}

export default {
  name: 'holiday-nth-weekday-calculator',
  version: '1.0.0',
  size: 512,
  dependencies: ['holiday-engine'],
  install(kairos, _utils) {
    const engine = kairos.holidayEngine;
    if (engine) {
      engine.registerCalculator('nth-weekday', new NthWeekdayCalculator());
    }
  },
} as KairosPlugin;
