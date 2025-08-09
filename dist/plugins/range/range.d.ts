import type { TimeUnit } from '../../core/types/base.js';
import type { KairosPlugin } from '../../core/types/plugin.js';
export declare class DateRange {
    private start;
    private end;
    private unit;
    private step;
    constructor(start: Date, end: Date, unit?: TimeUnit, step?: number);
    [Symbol.iterator](): Generator<Date>;
    toArray(): Date[];
    map<T>(callback: (date: Date, index: number) => T): T[];
    filter(callback: (date: Date, index: number) => boolean): Date[];
    find(callback: (date: Date, index: number) => boolean): Date | undefined;
    every(callback: (date: Date, index: number) => boolean): boolean;
    some(callback: (date: Date, index: number) => boolean): boolean;
    reduce<T>(callback: (accumulator: T, date: Date, index: number) => T, initialValue: T): T;
    count(): number;
    businessDays(): Date[];
    weekends(): Date[];
    weekday(weekday: number): Date[];
    month(month: number): Date[];
    year(year: number): Date[];
    chunk(size: number): DateRange[];
    includes(date: Date): boolean;
    contains(date: Date): boolean;
    getStart(): Date;
    getEnd(): Date;
    overlaps(other: DateRange): boolean;
    intersection(other: DateRange): DateRange | null;
    union(other: DateRange): DateRange | null;
    private isAdjacent;
    duration(): number;
    durationIn(unit: TimeUnit): number;
    private addUnit;
}
declare const _default: KairosPlugin;
export default _default;
//# sourceMappingURL=range.d.ts.map