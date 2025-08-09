import type { HolidayRule, HolidayCalculator } from '../../../core/types/holiday.js';
import type { KairosPlugin } from '../../../core/types/plugin.js';
export declare class CustomCalculator implements HolidayCalculator {
    calculate(rule: HolidayRule, year: number, context?: any): Date[];
}
export declare const CustomCalculatorUtils: {
    calculateVernalEquinox(year: number): Date;
    calculateAutumnalEquinox(year: number): Date;
    calculateSummerSolstice(year: number): Date;
    calculateWinterSolstice(year: number): Date;
    findWeekdayInMonth(year: number, month: number, weekday: number, position: "first" | "last"): Date;
    calculateNewMoon(year: number, month: number): Date;
    calculateFullMoon(year: number, month: number): Date;
    getNextBusinessDay(date: Date): Date;
    getPreviousBusinessDay(date: Date): Date;
    getDateInTimezone(date: Date, timezone: string): Date;
    getDSTTransition(year: number, type: "spring" | "fall"): Date;
    calculateGoldenWeekSubstitutes(year: number): Date[];
    calculateQingming(year: number): Date;
};
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=custom.d.ts.map