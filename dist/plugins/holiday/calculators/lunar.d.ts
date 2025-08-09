import type { HolidayRule, HolidayCalculator } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';
export declare class LunarCalculator implements HolidayCalculator {
    private converters;
    calculate(rule: HolidayRule, year: number): Date[];
    private getLunarYear;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=lunar.d.ts.map