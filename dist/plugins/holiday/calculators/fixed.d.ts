import type { HolidayRule, HolidayCalculator } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';
export declare class FixedCalculator implements HolidayCalculator {
    calculate(rule: HolidayRule, year: number): Date[];
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=fixed.d.ts.map