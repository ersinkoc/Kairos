import type { HolidayRule, HolidayCalculator, EasterRule } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';

export class EasterCalculator implements HolidayCalculator {
  calculate(rule: HolidayRule, year: number): Date[] {
    const { offset } = rule.rule as EasterRule;
    const easterDate = this.calculateEaster(year);

    const resultDate = new Date(easterDate);
    resultDate.setDate(resultDate.getDate() + offset);

    return [resultDate];
  }

  // Computus algorithm for calculating Easter (Gregorian calendar)
  calculateEaster(year: number): Date {
    if (year < 1583) {
      // Use Julian calendar algorithm for years before Gregorian calendar
      return this.calculateJulianEaster(year);
    }

    // Anonymous Gregorian algorithm
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
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month, day);
  }

  // Julian calendar Easter calculation (for historical accuracy)
  private calculateJulianEaster(year: number): Date {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31) - 1; // 0-indexed
    const day = ((d + e + 114) % 31) + 1;

    // Convert Julian to Gregorian
    const julianDate = new Date(year, month, day);
    const julianDayNumber = this.dateToJulianDay(julianDate);
    const gregorianDate = this.julianDayToDate(julianDayNumber);

    return gregorianDate;
  }

  // Convert date to Julian Day Number
  private dateToJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;

    return (
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    );
  }

  // Convert Julian Day Number to date
  private julianDayToDate(jdn: number): Date {
    let a = jdn + 32044;
    let b = (4 * a + 3) / 146097;
    let c = a - Math.floor((146097 * b) / 4);
    let d = (4 * c + 3) / 1461;
    let e = c - Math.floor((1461 * d) / 4);
    let m = (5 * e + 2) / 153;

    let day = e - Math.floor((153 * m + 2) / 5) + 1;
    let month = m + 3 - 12 * Math.floor(m / 10);
    let year = 100 * b + d - 4800 + Math.floor(m / 10);

    return new Date(year, month - 1, day);
  }

  // Get Orthodox Easter (uses Julian calendar)
  calculateOrthodoxEaster(year: number): Date {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;

    // Convert Julian to Gregorian
    const julianDate = new Date(year, month - 1, day);
    const diff = this.getJulianGregorianDifference(year);

    const orthodoxEaster = new Date(julianDate);
    orthodoxEaster.setDate(orthodoxEaster.getDate() + diff);

    return orthodoxEaster;
  }

  // Get the difference between Julian and Gregorian calendars
  private getJulianGregorianDifference(year: number): number {
    if (year < 1583) return 0;

    const centuries = Math.floor(year / 100);
    const leapCenturies = Math.floor(centuries / 4);

    return centuries - leapCenturies - 2;
  }
}

export default {
  name: 'holiday-easter-calculator',
  version: '1.0.0',
  size: 1024,
  dependencies: ['holiday-engine'],
  install(kairos, _utils) {
    const engine = kairos.holidayEngine;
    if (engine) {
      engine.registerCalculator('easter-based', new EasterCalculator());
    }

    // Add static methods for Easter calculations
    kairos.addStatic?.({
      getEaster(year: number): any {
        const calculator = new EasterCalculator();
        const easterDate = calculator.calculateEaster(year);
        return kairos(easterDate);
      },

      getOrthodoxEaster(year: number): any {
        const calculator = new EasterCalculator();
        const orthodoxEasterDate = calculator.calculateOrthodoxEaster(year);
        return kairos(orthodoxEasterDate);
      },
    });
  },
} as KairosPlugin;
