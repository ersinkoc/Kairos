import type { KairosInstance, KairosStatic } from './base.js';

export type { KairosInstance, KairosStatic, KairosInput, KairosConfig } from './base.js';

export interface KairosPlugin {
  name: string;
  version?: string;
  dependencies?: string[];
  install: (kairos: KairosStatic, config?: any) => void;
  size?: number;
}

export interface PluginContext {
  kairos: KairosStatic;
  config: any;
  utils: PluginUtils;
}

export interface PluginUtils {
  cache: Map<string, any>;
  memoize: <T extends (...args: any[]) => any>(fn: T) => T;
  validateInput: (input: any, type: string) => boolean;
  throwError: (message: string, code?: string) => never;
}

export interface ParsePlugin extends KairosPlugin {
  parse: (input: string, format?: string) => Date | null;
  patterns?: RegExp[];
}

export interface FormatPlugin extends KairosPlugin {
  format: (date: Date, template: string) => string;
  tokens?: Record<string, (date: Date) => string>;
}

export interface LocalePlugin extends KairosPlugin {
  locale: {
    name: string;
    code: string;
    months: string[];
    monthsShort: string[];
    weekdays: string[];
    weekdaysShort: string[];
    weekdaysMin: string[];
    formats: {
      LT: string;
      LTS: string;
      L: string;
      LL: string;
      LLL: string;
      LLLL: string;
    };
    ordinal: (n: number) => string;
    meridiem?: (hour: number, minute: number, isLower: boolean) => string;
  };
}

export interface ExtensionMethods {
  [key: string]: (this: KairosInstance, ...args: any[]) => any;
}

export interface StaticMethods {
  [key: string]: (...args: any[]) => any;
}
