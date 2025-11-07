import type { HolidayRule, HolidayInfo, HolidayEngine as IHolidayEngine, HolidayCalculator } from '../../core/types/holiday.js';
import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class HolidayEngine implements IHolidayEngine {
    private calculators;
    private cache;
    private ruleCache;
    constructor();
    private registerCalculators;
    private generateRuleCacheKey;
    registerCalculator(type: string, calculator: HolidayCalculator): void;
    calculate(rule: HolidayRule, year: number): Date[];
    private applyObservedRules;
    private findSubstituteDate;
    private findNearestWeekday;
    private findBridgeDate;
    private expandDuration;
    isHoliday(date: Date, holidays: HolidayRule[]): HolidayInfo | null;
    getHolidaysForYear(year: number, holidays: HolidayRule[]): HolidayInfo[];
    private calculateWithContext;
    getHolidaysInRange(start: Date, end: Date, holidays: HolidayRule[]): HolidayInfo[];
    getNextHoliday(after: Date, holidays: HolidayRule[]): HolidayInfo | null;
    getPreviousHoliday(before: Date, holidays: HolidayRule[]): HolidayInfo | null;
    private isSameDay;
    clearCache(): void;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=engine.d.ts.map