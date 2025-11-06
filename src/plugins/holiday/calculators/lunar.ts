import type {
  HolidayRule,
  HolidayCalculator,
  LunarRule,
  CalendarConverter,
} from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';

export class LunarCalculator implements HolidayCalculator {
  private converters: Record<string, CalendarConverter> = {
    islamic: new IslamicConverter(),
    chinese: new ChineseConverter(),
    hebrew: new HebrewConverter(),
    persian: new PersianConverter(),
  };

  calculate(rule: HolidayRule, year: number): Date[] {
    const { calendar, month, day } = rule.rule as LunarRule;

    const converter = this.converters[calendar];
    if (!converter) {
      throw new Error(`Unknown lunar calendar: ${calendar}`);
    }

    // For lunar calendars, we need to find the corresponding lunar year
    // This is a simplified approach - in practice, you'd need more sophisticated conversion
    const lunarYear = this.getLunarYear(year, calendar);
    const gregorianDate = converter.toGregorian(lunarYear, month, day);

    return [gregorianDate];
  }

  private getLunarYear(gregorianYear: number, calendar: string): number {
    // Simplified lunar year calculation
    // In practice, this would be more complex
    switch (calendar) {
      case 'islamic':
        return Math.round((gregorianYear - 622) * 1.030684);
      case 'chinese':
        return gregorianYear - 2637; // Approximate
      case 'hebrew':
        return gregorianYear + 3761; // Approximate
      case 'persian':
        return gregorianYear - 622; // Approximate
      default:
        return gregorianYear;
    }
  }
}

// Islamic (Hijri) Calendar Converter
class IslamicConverter implements CalendarConverter {
  toGregorian(hijriYear: number, hijriMonth: number, hijriDay: number): Date {
    // Simplified Islamic calendar conversion
    // In production, use a proper Islamic calendar library
    const epochOffset = 1948084; // Julian day of Islamic epoch
    const yearLength = 354.36667; // Average Islamic year length

    const totalDays =
      (hijriYear - 1) * yearLength + this.getIslamicMonthDays(hijriMonth, hijriYear) + hijriDay - 1;

    const julianDay = epochOffset + totalDays;
    return this.julianDayToGregorian(julianDay);
  }

  fromGregorian(date: Date): { year: number; month: number; day: number } {
    // Simplified conversion from Gregorian to Islamic
    const julianDay = this.gregorianToJulianDay(date);
    const epochOffset = 1948084;
    const totalDays = julianDay - epochOffset;
    const yearLength = 354.36667;

    const year = Math.floor(totalDays / yearLength) + 1;
    const remainingDays = totalDays - (year - 1) * yearLength;

    // Find month and day (simplified)
    let month = 1;
    let dayOfYear = remainingDays;

    while (dayOfYear > this.getIslamicMonthLength(month, year)) {
      dayOfYear -= this.getIslamicMonthLength(month, year);
      month++;
    }

    return {
      year,
      month,
      day: Math.floor(dayOfYear),
    };
  }

  private getIslamicMonthDays(month: number, year: number): number {
    let days = 0;
    for (let i = 1; i < month; i++) {
      days += this.getIslamicMonthLength(i, year);
    }
    return days;
  }

  private getIslamicMonthLength(month: number, year: number): number {
    // Simplified month lengths
    const lengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

    // Add leap day to last month in leap years
    if (month === 12 && this.isIslamicLeapYear(year)) {
      return 30;
    }

    return lengths[month - 1] || 29;
  }

  private isIslamicLeapYear(year: number): boolean {
    return (year * 11 + 14) % 30 < 11;
  }

  private julianDayToGregorian(jd: number): Date {
    // Simplified Julian Day to Gregorian conversion
    const a = jd + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);

    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);

    return new Date(year, month - 1, day);
  }

  private gregorianToJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

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
}

// Chinese Calendar Converter
class ChineseConverter implements CalendarConverter {
  toGregorian(chineseYear: number, chineseMonth: number, chineseDay: number): Date {
    // Simplified Chinese calendar conversion
    // In production, use a proper Chinese calendar library
    const epochYear = 2637; // Approximate epoch
    const gregorianYear = chineseYear + epochYear;

    // Chinese New Year typically falls between Jan 21 and Feb 20
    // Use a deterministic calculation based on the year cycle (19-year Metonic cycle approximation)
    const newYearOffset = 21 + ((gregorianYear * 11) % 30);
    const baseDate = new Date(gregorianYear, 0, newYearOffset);

    // Add lunar months (29.5 days average)
    const lunarMonthLength = 29.5;
    const totalDays = (chineseMonth - 1) * lunarMonthLength + chineseDay - 1;

    const result = new Date(baseDate);
    result.setDate(result.getDate() + totalDays);

    return result;
  }

  fromGregorian(date: Date): { year: number; month: number; day: number } {
    // Simplified conversion
    const epochYear = 2637;
    const year = date.getFullYear() - epochYear;

    return {
      year,
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
}

// Hebrew Calendar Converter
class HebrewConverter implements CalendarConverter {
  toGregorian(hebrewYear: number, hebrewMonth: number, hebrewDay: number): Date {
    // Simplified Hebrew calendar conversion
    const epochOffset = 3761; // Approximate offset
    const gregorianYear = hebrewYear - epochOffset;

    // Hebrew calendar starts in fall (Tishrei)
    const baseDate = new Date(gregorianYear, 8, 15); // Approximate Rosh Hashanah

    // Add Hebrew months (average 29.5 days)
    const totalDays = (hebrewMonth - 1) * 29.5 + hebrewDay - 1;

    const result = new Date(baseDate);
    result.setDate(result.getDate() + totalDays);

    return result;
  }

  fromGregorian(date: Date): { year: number; month: number; day: number } {
    // Simplified conversion
    const epochOffset = 3761;
    const year = date.getFullYear() + epochOffset;

    return {
      year,
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
}

// Persian Calendar Converter
class PersianConverter implements CalendarConverter {
  toGregorian(persianYear: number, persianMonth: number, persianDay: number): Date {
    // Simplified Persian calendar conversion
    const epochYear = 622; // Hijri epoch
    const gregorianYear = persianYear + epochYear;

    // Persian New Year is around March 21
    const baseDate = new Date(gregorianYear, 2, 21); // Nowruz

    // Add Persian months
    const totalDays = (persianMonth - 1) * 30 + persianDay - 1; // Simplified

    const result = new Date(baseDate);
    result.setDate(result.getDate() + totalDays);

    return result;
  }

  fromGregorian(date: Date): { year: number; month: number; day: number } {
    // Simplified conversion
    const epochYear = 622;
    const year = date.getFullYear() - epochYear;

    return {
      year,
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
}

export default {
  name: 'holiday-lunar-calculator',
  version: '1.0.0',
  size: 2048,
  dependencies: ['holiday-engine'],
  install(kairos, _utils) {
    const engine = kairos.holidayEngine;
    if (engine) {
      engine.registerCalculator('lunar', new LunarCalculator());
    }
  },
} as KairosPlugin;
