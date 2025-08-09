import type { HolidayRule, HolidayCalculator, FixedRule } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';

export class FixedCalculator implements HolidayCalculator {
  calculate(rule: HolidayRule, year: number): Date[] {
    const { month, day } = rule.rule as FixedRule;

    // Validate the date exists in the given year
    const date = new Date(year, month - 1, day);

    // Check if the date is valid (handles leap years, etc.)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      // Invalid date (e.g., Feb 29 in non-leap year)
      return [];
    }

    return [date];
  }
}

export default {
  name: 'holiday-fixed-calculator',
  version: '1.0.0',
  size: 256,
  dependencies: ['holiday-engine'],
  install(kairos, _utils) {
    const engine = kairos.holidayEngine;
    if (engine) {
      engine.registerCalculator('fixed', new FixedCalculator());
    }
  },
} as KairosPlugin;
