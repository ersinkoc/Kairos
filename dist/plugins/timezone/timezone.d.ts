import type { KairosPlugin } from '../../core/types/plugin.js';
export interface TimezoneInfo {
    name: string;
    abbreviation: string;
    offset: number;
    dst: boolean;
}
export declare class TimezoneManager {
    private static readonly TIMEZONE_MAP;
    static getTimezoneInfo(date: Date, timezone?: string): TimezoneInfo;
    static isDST(date: Date, timezone?: string): boolean;
    static getOffset(date: Date, timezone: string): number;
    static convertToTimezone(date: Date, timezone: string): Date;
    static convertTimezone(date: Date, fromTz: string, toTz: string): Date;
    static normalizeTimezone(timezone: string): string;
    static getAvailableTimezones(): string[];
    static getCommonTimezones(): Record<string, string>;
    static formatOffset(offset: number): string;
    static parseOffset(offsetStr: string): number;
    static getTimezoneFromOffset(offset: number): string[];
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=timezone.d.ts.map