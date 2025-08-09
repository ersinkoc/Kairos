import type { KairosPlugin } from '../../core/types/plugin.js';
export interface FiscalYearConfig {
    start: number | string;
    skipHolidays?: boolean;
    country?: string;
}
export declare class FiscalYearCalculator {
    private config;
    constructor(config: FiscalYearConfig);
    private getStartMonth;
    getFiscalYear(date: Date): number;
    getFiscalYearStart(fiscalYear: number): Date;
    getFiscalYearEnd(fiscalYear: number): Date;
    getFiscalQuarter(date: Date): number;
    getFiscalQuarterStart(fiscalYear: number, quarter: number): Date;
    getFiscalQuarterEnd(fiscalYear: number, quarter: number): Date;
    getDaysInFiscalYear(fiscalYear: number): number;
    getDaysInFiscalQuarter(fiscalYear: number, quarter: number): number;
    getFiscalWeek(date: Date): number;
    static getCommonConfigs(): Record<string, FiscalYearConfig>;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=fiscal.d.ts.map