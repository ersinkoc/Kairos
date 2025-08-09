import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class FlexibleParser {
    private static readonly FORMATS;
    parse(input: string, options?: {
        european?: boolean;
        strict?: boolean;
    }): Date | null;
    guessFormat(input: string): string | null;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=flexible.d.ts.map