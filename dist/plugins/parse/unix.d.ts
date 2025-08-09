import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class UnixTimestampParser {
    static readonly UNIX_SECONDS_REGEX: RegExp;
    static readonly UNIX_MILLISECONDS_REGEX: RegExp;
    static readonly UNIX_MICROSECONDS_REGEX: RegExp;
    static readonly UNIX_NANOSECONDS_REGEX: RegExp;
    parse(input: string | number): Date | null;
    toUnix(date: Date, unit?: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'): number;
    isUnixTimestamp(input: string | number): boolean;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=unix.d.ts.map