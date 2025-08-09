import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class ISOParser {
    static readonly ISO_REGEX: RegExp;
    static readonly DATE_ONLY_REGEX: RegExp;
    parse(input: string): Date | null;
    private parseISOMatch;
    private parseDateOnly;
    format(date: Date, includeTime?: boolean): string;
    isValid(input: string): boolean;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=iso.d.ts.map