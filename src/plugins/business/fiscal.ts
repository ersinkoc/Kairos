import type { KairosInstance } from '../../core/types/base.js';
import type { KairosPlugin } from '../../core/types/plugin.js';

export interface FiscalYearConfig {
  start: number | string; // Month number (1-12) or month name
  skipHolidays?: boolean;
  country?: string;
}

export class FiscalYearCalculator {
  private config: FiscalYearConfig;

  constructor(config: FiscalYearConfig) {
    this.config = config;
  }

  private getStartMonth(): number {
    if (typeof this.config.start === 'number') {
      return this.config.start;
    }

    if (typeof this.config.start !== 'string') {
      return 1; // Default to January if invalid type
    }

    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];

    const index = monthNames.indexOf(this.config.start.toLowerCase());
    return index === -1 ? 1 : index + 1;
  }

  getFiscalYear(date: Date): number {
    const startMonth = this.getStartMonth();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (month >= startMonth) {
      return year;
    } else {
      return year - 1;
    }
  }

  getFiscalYearStart(fiscalYear: number): Date {
    const startMonth = this.getStartMonth();
    return new Date(fiscalYear, startMonth - 1, 1);
  }

  getFiscalYearEnd(fiscalYear: number): Date {
    const startMonth = this.getStartMonth();
    const endMonth = startMonth === 1 ? 12 : startMonth - 1;
    const endYear = startMonth === 1 ? fiscalYear : fiscalYear + 1;

    // Get last day of end month
    const lastDay = new Date(endYear, endMonth, 0).getDate();
    return new Date(endYear, endMonth - 1, lastDay);
  }

  getFiscalQuarter(date: Date): number {
    const startMonth = this.getStartMonth();
    const month = date.getMonth() + 1;

    // Calculate months from fiscal year start
    let monthsFromStart = month - startMonth;
    if (monthsFromStart < 0) {
      monthsFromStart += 12;
    }

    return Math.floor(monthsFromStart / 3) + 1;
  }

  getFiscalQuarterStart(fiscalYear: number, quarter: number): Date {
    const startMonth = this.getStartMonth();
    const quarterMonthOffset = (quarter - 1) * 3;
    const quarterStartMonth = (startMonth - 1 + quarterMonthOffset) % 12;

    // Calculate how many months from fiscal year start to quarter start
    // If we've gone past 12 months from startMonth, we're in next calendar year
    const quarterStartYear = fiscalYear + Math.floor((startMonth - 1 + quarterMonthOffset) / 12);

    return new Date(quarterStartYear, quarterStartMonth, 1);
  }

  getFiscalQuarterEnd(fiscalYear: number, quarter: number): Date {
    const startMonth = this.getStartMonth();
    const quarterEndMonthOffset = quarter * 3 - 1;
    const quarterEndMonth = (startMonth - 1 + quarterEndMonthOffset) % 12;

    // Calculate which calendar year the quarter ends in
    const quarterEndYear = fiscalYear + Math.floor((startMonth - 1 + quarterEndMonthOffset) / 12);

    const lastDay = new Date(quarterEndYear, quarterEndMonth + 1, 0).getDate();
    return new Date(quarterEndYear, quarterEndMonth, lastDay);
  }

  getDaysInFiscalYear(fiscalYear: number): number {
    const start = this.getFiscalYearStart(fiscalYear);
    const end = this.getFiscalYearEnd(fiscalYear);

    return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }

  getDaysInFiscalQuarter(fiscalYear: number, quarter: number): number {
    const start = this.getFiscalQuarterStart(fiscalYear, quarter);
    const end = this.getFiscalQuarterEnd(fiscalYear, quarter);

    return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }

  // Get fiscal week number (1-52/53)
  getFiscalWeek(date: Date): number {
    const fiscalYear = this.getFiscalYear(date);
    const fiscalYearStart = this.getFiscalYearStart(fiscalYear);

    const diffTime = date.getTime() - fiscalYearStart.getTime();
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));

    return Math.floor(diffDays / 7) + 1;
  }

  // Common fiscal year configurations
  static getCommonConfigs(): Record<string, FiscalYearConfig> {
    return {
      US: { start: 10 }, // October 1 - September 30
      UK: { start: 4 }, // April 1 - March 31
      Canada: { start: 4 }, // April 1 - March 31
      Australia: { start: 7 }, // July 1 - June 30
      India: { start: 4 }, // April 1 - March 31
      Japan: { start: 4 }, // April 1 - March 31
      Germany: { start: 1 }, // January 1 - December 31 (calendar year)
      France: { start: 1 }, // January 1 - December 31 (calendar year)
      China: { start: 1 }, // January 1 - December 31 (calendar year)
      Brazil: { start: 1 }, // January 1 - December 31 (calendar year)
      Russia: { start: 1 }, // January 1 - December 31 (calendar year)
      'South Korea': { start: 1 }, // January 1 - December 31 (calendar year)
      Singapore: { start: 4 }, // April 1 - March 31
      'Hong Kong': { start: 4 }, // April 1 - March 31
      'New Zealand': { start: 4 }, // April 1 - March 31
      Mexico: { start: 1 }, // January 1 - December 31 (calendar year)
      'South Africa': { start: 3 }, // March 1 - February 28/29
      Turkey: { start: 1 }, // January 1 - December 31 (calendar year)
      Israel: { start: 1 }, // January 1 - December 31 (calendar year)
      'Saudi Arabia': { start: 1 }, // January 1 - December 31 (calendar year)
      UAE: { start: 1 }, // January 1 - December 31 (calendar year)
      Egypt: { start: 7 }, // July 1 - June 30
      Nigeria: { start: 1 }, // January 1 - December 31 (calendar year)
      Kenya: { start: 7 }, // July 1 - June 30
      'Corporate-Q1': { start: 1 }, // January start (most common)
      'Corporate-Q2': { start: 4 }, // April start
      'Corporate-Q3': { start: 7 }, // July start
      'Corporate-Q4': { start: 10 }, // October start
      'Academic-US': { start: 8 }, // August start (US academic year)
      'Academic-UK': { start: 9 }, // September start (UK academic year)
      'Retail-US': { start: 2 }, // February start (retail calendar)
      'Retail-4-5-4': { start: 2 }, // 4-5-4 retail calendar
    };
  }
}

export default {
  name: 'business-fiscal',
  version: '1.0.0',
  size: 1536,
  dependencies: ['business-workday'],
  install(kairos, _utils) {
    // Add fiscal year methods to Kairos instances
    kairos.extend({
      fiscalYear(config?: FiscalYearConfig): number {
        const fiscalConfig = config || { start: 1 }; // Default to calendar year
        const calculator = new FiscalYearCalculator(fiscalConfig);
        return calculator.getFiscalYear(this.toDate());
      },

      fiscalYearStart(config?: FiscalYearConfig): KairosInstance {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const start = calculator.getFiscalYearStart(fiscalYear);
        return kairos(start);
      },

      fiscalYearEnd(config?: FiscalYearConfig): KairosInstance {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const end = calculator.getFiscalYearEnd(fiscalYear);
        return kairos(end);
      },

      fiscalQuarter(config?: FiscalYearConfig): number {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        return calculator.getFiscalQuarter(this.toDate());
      },

      fiscalQuarterStart(config?: FiscalYearConfig): KairosInstance {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const quarter = calculator.getFiscalQuarter(this.toDate());
        const start = calculator.getFiscalQuarterStart(fiscalYear, quarter);
        return kairos(start);
      },

      fiscalQuarterEnd(config?: FiscalYearConfig): KairosInstance {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const quarter = calculator.getFiscalQuarter(this.toDate());
        const end = calculator.getFiscalQuarterEnd(fiscalYear, quarter);
        return kairos(end);
      },

      fiscalWeek(config?: FiscalYearConfig): number {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        return calculator.getFiscalWeek(this.toDate());
      },

      // Check if date is in specific fiscal period
      isFiscalYearStart(config?: FiscalYearConfig): boolean {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const start = calculator.getFiscalYearStart(fiscalYear);
        return this.isSame(kairos(start));
      },

      isFiscalYearEnd(config?: FiscalYearConfig): boolean {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const end = calculator.getFiscalYearEnd(fiscalYear);
        return this.isSame(kairos(end));
      },

      isFiscalQuarterStart(config?: FiscalYearConfig): boolean {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const quarter = calculator.getFiscalQuarter(this.toDate());
        const start = calculator.getFiscalQuarterStart(fiscalYear, quarter);
        return this.isSame(kairos(start));
      },

      isFiscalQuarterEnd(config?: FiscalYearConfig): boolean {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const fiscalYear = calculator.getFiscalYear(this.toDate());
        const quarter = calculator.getFiscalQuarter(this.toDate());
        const end = calculator.getFiscalQuarterEnd(fiscalYear, quarter);
        return this.isSame(kairos(end));
      },
    });

    // Add static methods
    kairos.addStatic?.({
      fiscalYearCalculator: FiscalYearCalculator,

      getFiscalYearConfig(country: string): FiscalYearConfig | null {
        const configs = FiscalYearCalculator.getCommonConfigs();
        return configs[country] || null;
      },

      getAvailableFiscalConfigs(): string[] {
        return Object.keys(FiscalYearCalculator.getCommonConfigs());
      },

      createFiscalCalculator(config: FiscalYearConfig): FiscalYearCalculator {
        return new FiscalYearCalculator(config);
      },

      // Get fiscal year information for a specific year
      getFiscalYearInfo(fiscalYear: number, config?: FiscalYearConfig): any {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);

        return {
          fiscalYear,
          start: kairos(calculator.getFiscalYearStart(fiscalYear)),
          end: kairos(calculator.getFiscalYearEnd(fiscalYear)),
          days: calculator.getDaysInFiscalYear(fiscalYear),
          quarters: [1, 2, 3, 4].map((q) => ({
            quarter: q,
            start: kairos(calculator.getFiscalQuarterStart(fiscalYear, q)),
            end: kairos(calculator.getFiscalQuarterEnd(fiscalYear, q)),
            days: calculator.getDaysInFiscalQuarter(fiscalYear, q),
          })),
        };
      },

      // Get business days in fiscal year
      getBusinessDaysInFiscalYear(fiscalYear: number, config?: FiscalYearConfig): number {
        const fiscalConfig = config || { start: 1 };
        const calculator = new FiscalYearCalculator(fiscalConfig);
        const start = calculator.getFiscalYearStart(fiscalYear);
        const end = calculator.getFiscalYearEnd(fiscalYear);

        const businessCalc = kairos.businessDayCalculator;
        return (
          businessCalc.businessDaysBetween(start, end) + (businessCalc.isBusinessDay(start) ? 1 : 0)
        );
      },
    });
  },
} as KairosPlugin;
