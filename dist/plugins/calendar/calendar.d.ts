import type { KairosPlugin } from '../../core/types/plugin.js';
interface CalendarInfo {
    year: number;
    quarter: number;
    month: number;
    week: number;
    weekYear: number;
    isoWeek: number;
    isoWeekYear: number;
    dayOfYear: number;
    dayOfWeek: number;
    daysInMonth: number;
    daysInYear: number;
    isLeapYear: boolean;
    weekOfMonth: number;
}
declare class CalendarCalculator {
    static getISOWeek(date: Date): number;
    static getISOWeekYear(date: Date): number;
    static getWeek(date: Date, startDay?: number): number;
    static getQuarter(date: Date): number;
    static getDayOfYear(date: Date): number;
    static getDaysInMonth(date: Date): number;
    static getDaysInYear(year: number): number;
    static isLeapYear(year: number): boolean;
    static getWeekOfMonth(date: Date, startDay?: number): number;
    static getCalendarInfo(date: Date): CalendarInfo;
}
declare const calendarPlugin: KairosPlugin;
export default calendarPlugin;
export { CalendarCalculator };
export type { CalendarInfo };
//# sourceMappingURL=calendar.d.ts.map