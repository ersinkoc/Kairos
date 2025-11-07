import type { BusinessDayConfig } from '../../core/types/holiday.js';
import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class BusinessDayCalculator {
    private config;
    private cache;
    constructor(config?: BusinessDayConfig);
    updateConfig(config: Partial<BusinessDayConfig>): void;
    isBusinessDay(date: Date): boolean;
    private calculateIsBusinessDay;
    nextBusinessDay(date: Date, maxIterations?: number): Date;
    previousBusinessDay(date: Date, maxIterations?: number): Date;
    addBusinessDays(date: Date, days: number, maxIterations?: number): Date;
    businessDaysBetween(start: Date, end: Date): number;
    businessDaysInMonth(year: number, month: number): number;
    businessDaysInYear(year: number): number;
    settlementDate(date: Date, days: number): Date;
    getBusinessDaysInMonth(year: number, month: number): Date[];
    getBusinessDaysInRange(start: Date, end: Date): Date[];
    getNthBusinessDay(year: number, month: number, nth: number): Date | null;
    getLastBusinessDay(year: number, month: number): Date | null;
    clearCache(): void;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=workday.d.ts.map