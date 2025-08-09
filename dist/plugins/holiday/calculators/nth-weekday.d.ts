import type { HolidayRule, HolidayCalculator } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';
export declare class NthWeekdayCalculator implements HolidayCalculator {
    calculate(rule: HolidayRule, year: number): Date[];
    private getNthWeekdayOfMonth;
    private getLastNthWeekdayOfMonth;
    private getOrdinalSuffix;
    private getWeekdayName;
    private getMonthName;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=nth-weekday.d.ts.map