export class FiscalYearCalculator {
    constructor(config) {
        this.config = config;
    }
    getStartMonth() {
        if (typeof this.config.start === 'number') {
            return this.config.start;
        }
        if (typeof this.config.start !== 'string') {
            return 1;
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
    getFiscalYear(date) {
        const startMonth = this.getStartMonth();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        if (month >= startMonth) {
            return year;
        }
        else {
            return year - 1;
        }
    }
    getFiscalYearStart(fiscalYear) {
        const startMonth = this.getStartMonth();
        return new Date(fiscalYear, startMonth - 1, 1);
    }
    getFiscalYearEnd(fiscalYear) {
        const startMonth = this.getStartMonth();
        const endMonth = startMonth === 1 ? 12 : startMonth - 1;
        const endYear = startMonth === 1 ? fiscalYear : fiscalYear + 1;
        const lastDay = new Date(endYear, endMonth, 0).getDate();
        return new Date(endYear, endMonth - 1, lastDay);
    }
    getFiscalQuarter(date) {
        const startMonth = this.getStartMonth();
        const month = date.getMonth() + 1;
        let monthsFromStart = month - startMonth;
        if (monthsFromStart < 0) {
            monthsFromStart += 12;
        }
        return Math.floor(monthsFromStart / 3) + 1;
    }
    getFiscalQuarterStart(fiscalYear, quarter) {
        const startMonth = this.getStartMonth();
        const quarterMonthOffset = (quarter - 1) * 3;
        const quarterStartMonth = (startMonth - 1 + quarterMonthOffset) % 12;
        const quarterStartYear = fiscalYear + Math.floor((startMonth - 1 + quarterMonthOffset) / 12);
        return new Date(quarterStartYear, quarterStartMonth, 1);
    }
    getFiscalQuarterEnd(fiscalYear, quarter) {
        const startMonth = this.getStartMonth();
        const quarterEndMonthOffset = quarter * 3 - 1;
        const quarterEndMonth = (startMonth - 1 + quarterEndMonthOffset) % 12;
        const quarterEndYear = fiscalYear + Math.floor((startMonth - 1 + quarterEndMonthOffset) / 12);
        const lastDay = new Date(quarterEndYear, quarterEndMonth + 1, 0).getDate();
        return new Date(quarterEndYear, quarterEndMonth, lastDay);
    }
    getDaysInFiscalYear(fiscalYear) {
        const start = this.getFiscalYearStart(fiscalYear);
        const end = this.getFiscalYearEnd(fiscalYear);
        return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    }
    getDaysInFiscalQuarter(fiscalYear, quarter) {
        const start = this.getFiscalQuarterStart(fiscalYear, quarter);
        const end = this.getFiscalQuarterEnd(fiscalYear, quarter);
        return Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    }
    getFiscalWeek(date) {
        const fiscalYear = this.getFiscalYear(date);
        const fiscalYearStart = this.getFiscalYearStart(fiscalYear);
        const diffTime = date.getTime() - fiscalYearStart.getTime();
        const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
        return Math.floor(diffDays / 7) + 1;
    }
    static getCommonConfigs() {
        return {
            US: { start: 10 },
            UK: { start: 4 },
            Canada: { start: 4 },
            Australia: { start: 7 },
            India: { start: 4 },
            Japan: { start: 4 },
            Germany: { start: 1 },
            France: { start: 1 },
            China: { start: 1 },
            Brazil: { start: 1 },
            Russia: { start: 1 },
            'South Korea': { start: 1 },
            Singapore: { start: 4 },
            'Hong Kong': { start: 4 },
            'New Zealand': { start: 4 },
            Mexico: { start: 1 },
            'South Africa': { start: 3 },
            Turkey: { start: 1 },
            Israel: { start: 1 },
            'Saudi Arabia': { start: 1 },
            UAE: { start: 1 },
            Egypt: { start: 7 },
            Nigeria: { start: 1 },
            Kenya: { start: 7 },
            'Corporate-Q1': { start: 1 },
            'Corporate-Q2': { start: 4 },
            'Corporate-Q3': { start: 7 },
            'Corporate-Q4': { start: 10 },
            'Academic-US': { start: 8 },
            'Academic-UK': { start: 9 },
            'Retail-US': { start: 2 },
            'Retail-4-5-4': { start: 2 },
        };
    }
}
export default {
    name: 'business-fiscal',
    version: '1.0.0',
    size: 1536,
    dependencies: ['business-workday'],
    install(kairos, _utils) {
        kairos.extend({
            fiscalYear(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                return calculator.getFiscalYear(this.toDate());
            },
            fiscalYearStart(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const start = calculator.getFiscalYearStart(fiscalYear);
                return kairos(start);
            },
            fiscalYearEnd(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const end = calculator.getFiscalYearEnd(fiscalYear);
                return kairos(end);
            },
            fiscalQuarter(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                return calculator.getFiscalQuarter(this.toDate());
            },
            fiscalQuarterStart(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const quarter = calculator.getFiscalQuarter(this.toDate());
                const start = calculator.getFiscalQuarterStart(fiscalYear, quarter);
                return kairos(start);
            },
            fiscalQuarterEnd(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const quarter = calculator.getFiscalQuarter(this.toDate());
                const end = calculator.getFiscalQuarterEnd(fiscalYear, quarter);
                return kairos(end);
            },
            fiscalWeek(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                return calculator.getFiscalWeek(this.toDate());
            },
            isFiscalYearStart(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const start = calculator.getFiscalYearStart(fiscalYear);
                return this.isSame(kairos(start));
            },
            isFiscalYearEnd(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const end = calculator.getFiscalYearEnd(fiscalYear);
                return this.isSame(kairos(end));
            },
            isFiscalQuarterStart(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const quarter = calculator.getFiscalQuarter(this.toDate());
                const start = calculator.getFiscalQuarterStart(fiscalYear, quarter);
                return this.isSame(kairos(start));
            },
            isFiscalQuarterEnd(config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const fiscalYear = calculator.getFiscalYear(this.toDate());
                const quarter = calculator.getFiscalQuarter(this.toDate());
                const end = calculator.getFiscalQuarterEnd(fiscalYear, quarter);
                return this.isSame(kairos(end));
            },
        });
        kairos.addStatic?.({
            fiscalYearCalculator: FiscalYearCalculator,
            getFiscalYearConfig(country) {
                const configs = FiscalYearCalculator.getCommonConfigs();
                return configs[country] || null;
            },
            getAvailableFiscalConfigs() {
                return Object.keys(FiscalYearCalculator.getCommonConfigs());
            },
            createFiscalCalculator(config) {
                return new FiscalYearCalculator(config);
            },
            getFiscalYearInfo(fiscalYear, config) {
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
            getBusinessDaysInFiscalYear(fiscalYear, config) {
                const fiscalConfig = config || { start: 1 };
                const calculator = new FiscalYearCalculator(fiscalConfig);
                const start = calculator.getFiscalYearStart(fiscalYear);
                const end = calculator.getFiscalYearEnd(fiscalYear);
                const businessCalc = kairos.businessDayCalculator;
                return (businessCalc.businessDaysBetween(start, end) + (businessCalc.isBusinessDay(start) ? 1 : 0));
            },
        });
    },
};
//# sourceMappingURL=fiscal.js.map