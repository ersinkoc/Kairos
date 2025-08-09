import type { HolidayRule } from '../../../core/types/holiday.js';
export declare const holidays: HolidayRule[];
export declare const stateHolidays: {
    texas: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    california: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    hawaii: ({
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
            weekday?: never;
            nth?: never;
        };
        regions: string[];
    } | {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            weekday: number;
            nth: number;
            day?: never;
        };
        regions: string[];
    })[];
    massachusetts: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            weekday: number;
            nth: number;
        };
        regions: string[];
    }[];
    maine: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            weekday: number;
            nth: number;
        };
        regions: string[];
    }[];
};
export declare const federalHolidays: HolidayRule[];
export declare const allHolidays: (HolidayRule | {
    id: string;
    name: string;
    type: string;
    rule: {
        month: number;
        day: number;
    };
    regions: string[];
} | {
    id: string;
    name: string;
    type: string;
    rule: {
        month: number;
        weekday: number;
        nth: number;
    };
    regions: string[];
})[];
//# sourceMappingURL=holidays.d.ts.map