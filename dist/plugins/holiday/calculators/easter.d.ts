import type { HolidayRule, HolidayCalculator } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';
export declare class EasterCalculator implements HolidayCalculator {
    calculate(rule: HolidayRule, year: number): Date[];
    calculateEaster(year: number): Date;
    private calculateJulianEaster;
    private dateToJulianDay;
    private julianDayToDate;
    calculateOrthodoxEaster(year: number): Date;
    private getJulianGregorianDifference;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=easter.d.ts.map