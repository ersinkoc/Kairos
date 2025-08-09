import type { KairosPlugin } from '../../core/types/plugin.js';
interface RelativeTimeOptions {
    locale?: string;
    numeric?: 'auto' | 'always';
    style?: 'long' | 'short' | 'narrow';
}
interface RelativeTimeLocale {
    future: string;
    past: string;
    s: string;
    m: string;
    mm: string;
    h: string;
    hh: string;
    d: string;
    dd: string;
    M: string;
    MM: string;
    y: string;
    yy: string;
}
declare class RelativeTimeCalculator {
    private locale;
    constructor(locale?: string);
    format(diff: number, withoutSuffix?: boolean): string;
    formatNative(diff: number, locale?: string, options?: RelativeTimeOptions): string;
}
declare const relativeTimePlugin: KairosPlugin;
export default relativeTimePlugin;
export { RelativeTimeCalculator };
export type { RelativeTimeLocale, RelativeTimeOptions };
//# sourceMappingURL=relative-time.d.ts.map