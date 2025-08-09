export interface KairosInstance {
    valueOf(): number;
    toString(): string;
    toISOString(): string;
    toDate(): Date;
    clone(): KairosInstance;
    year(): number;
    month(): number;
    date(): number;
    day(): number;
    hour(): number;
    minute(): number;
    second(): number;
    millisecond(): number;
    year(value: number): KairosInstance;
    month(value: number): KairosInstance;
    date(value: number): KairosInstance;
    hour(value: number): KairosInstance;
    minute(value: number): KairosInstance;
    second(value: number): KairosInstance;
    millisecond(value: number): KairosInstance;
    add(amount: number, unit: TimeUnit): KairosInstance;
    subtract(amount: number, unit: TimeUnit): KairosInstance;
    isBefore(other: KairosInstance): boolean;
    isAfter(other: KairosInstance): boolean;
    isSame(other: KairosInstance): boolean;
    format(template?: string): string;
    [key: string]: any;
}
export type TimeUnit = 'year' | 'years' | 'y' | 'month' | 'months' | 'M' | 'week' | 'weeks' | 'w' | 'day' | 'days' | 'd' | 'hour' | 'hours' | 'h' | 'minute' | 'minutes' | 'm' | 'second' | 'seconds' | 's' | 'millisecond' | 'milliseconds' | 'ms';
export type KairosInput = string | number | Date | KairosInstance | undefined;
export interface KairosStatic {
    (input?: KairosInput): KairosInstance;
    use(plugin: any | any[]): KairosStatic;
    extend(methods: Record<string, Function>): void;
    locale(name?: string): string | void;
    utc(input?: KairosInput): KairosInstance;
    unix(timestamp: number): KairosInstance;
    plugins: Map<string, any>;
    [key: string]: any;
}
export interface KairosConfig {
    locale: string;
    timezone?: string;
    strict?: boolean;
    suppressDeprecationWarnings?: boolean;
}
//# sourceMappingURL=base.d.ts.map