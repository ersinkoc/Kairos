import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class TokenFormatter {
    static readonly TOKENS: Record<string, (date: Date, locale?: any) => string>;
    format(date: Date, template: string, locale?: any): string;
    private static getMonthName;
    private static getMonthShortName;
    private static getWeekdayName;
    private static getWeekdayShortName;
    private static getWeekdayMinName;
    private static getOrdinal;
    private static getWeekOfYear;
    private static getDayOfYear;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=tokens.d.ts.map