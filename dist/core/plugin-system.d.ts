import type { KairosPlugin, KairosStatic, KairosInstance, KairosInput, ExtensionMethods, StaticMethods } from './types/plugin.js';
import { type MemoryThresholds } from './utils/memory-monitor.js';
export declare class KairosCore {
    private _date;
    private static config;
    private static _memoryMonitorEnabled;
    private static _objectPoolEnabled;
    static enableMemoryMonitoring(thresholds?: MemoryThresholds): void;
    static disableMemoryMonitoring(): void;
    static isMemoryMonitoringEnabled(): boolean;
    static enableObjectPooling(): void;
    static disableObjectPooling(): void;
    static isObjectPoolingEnabled(): boolean;
    static getMemoryStats(): {
        snapshotCount: number;
        monitoring: boolean;
        checkInterval: number;
        timeRange: {
            start: number;
            end: number;
            duration: number;
        };
        heap: {
            current: number;
            min: number;
            max: number;
            avg: number;
            growth: number;
        };
        rss: {
            current: number;
            min: number;
            max: number;
            avg: number;
            growth: number;
        };
    } | null;
    static getObjectPoolStats(): Record<string, any>;
    constructor(input?: KairosInput);
    private parseInput;
    valueOf(): number;
    toString(): string;
    toISOString(): string;
    offset(): number;
    toDate(): Date;
    clone(): KairosInstance;
    year(value?: number): number | KairosInstance;
    month(value?: number): number | KairosInstance;
    date(value?: number): number | KairosInstance;
    day(): number;
    hour(value?: number): number | KairosInstance;
    minute(value?: number): number | KairosInstance;
    second(value?: number): number | KairosInstance;
    millisecond(value?: number): number | KairosInstance;
    add(amount: number, unit: string): KairosInstance;
    subtract(amount: number, unit: string): KairosInstance;
    startOf(unit: string): KairosInstance;
    endOf(unit: string): KairosInstance;
    isValid(): boolean;
    isBefore(other: KairosInstance): boolean;
    isAfter(other: KairosInstance): boolean;
    isSame(other: KairosInstance): boolean;
    format(template?: string): string;
    private normalizeUnit;
}
export declare class PluginSystem {
    static plugins: Map<string, KairosPlugin>;
    private static installedPlugins;
    private static extensionMethods;
    private static staticMethods;
    static use(plugin: KairosPlugin | KairosPlugin[]): KairosStatic;
    private static installPlugin;
    static extend(methods: ExtensionMethods): void;
    static addStatic(methods: StaticMethods): void;
    static getPlugin(name: string): KairosPlugin | undefined;
    static isInstalled(name: string): boolean;
    static getInstalledPlugins(): string[];
}
declare const _default: KairosStatic;
export default _default;
//# sourceMappingURL=plugin-system.d.ts.map