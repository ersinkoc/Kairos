import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class RFC2822Parser {
    static readonly RFC2822_REGEX: RegExp;
    private static readonly MONTHS;
    private static readonly WEEKDAYS;
    private static readonly TIMEZONE_OFFSETS;
    parse(input: string): Date | null;
    format(date: Date): string;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=rfc2822.d.ts.map