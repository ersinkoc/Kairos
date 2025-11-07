import type { HolidayRule, HolidayCalculator } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';
export declare class RelativeCalculator implements HolidayCalculator {
    private holidayCache;
    private allHolidays;
    private visitedHolidays;
    calculate(rule: HolidayRule, year: number, context?: {
        holidays: HolidayRule[];
    }): Date[];
    private findBaseHoliday;
    private calculateBaseHolidayDates;
    private calculateDirectHoliday;
    private calculateFixed;
    private calculateNthWeekday;
    private calculateEasterBased;
    private getNthWeekdayOfMonth;
    private getLastNthWeekdayOfMonth;
    private calculateEaster;
    clearCache(): void;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=relative.d.ts.map