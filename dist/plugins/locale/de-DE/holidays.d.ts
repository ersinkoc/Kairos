import type { HolidayRule } from '../../../core/types/holiday.js';
export declare const holidays: HolidayRule[];
export declare const stateHolidays: {
    'baden-w\u00FCrttemberg': ({
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
            offset?: never;
        };
        regions: string[];
    } | {
        id: string;
        name: string;
        type: string;
        rule: {
            offset: number;
            month?: never;
            day?: never;
        };
        regions: string[];
    })[];
    bavaria: ({
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
            offset?: never;
        };
        regions: string[];
    } | {
        id: string;
        name: string;
        type: string;
        rule: {
            offset: number;
            month?: never;
            day?: never;
        };
        regions: string[];
    })[];
    berlin: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    brandenburg: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    bremen: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    hamburg: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    hesse: {
        id: string;
        name: string;
        type: string;
        rule: {
            offset: number;
        };
        regions: string[];
    }[];
    'lower-saxony': {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    'mecklenburg-vorpommern': {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    'north-rhine-westphalia': ({
        id: string;
        name: string;
        type: string;
        rule: {
            offset: number;
            month?: never;
            day?: never;
        };
        regions: string[];
    } | {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
            offset?: never;
        };
        regions: string[];
    })[];
    'rhineland-palatinate': ({
        id: string;
        name: string;
        type: string;
        rule: {
            offset: number;
            month?: never;
            day?: never;
        };
        regions: string[];
    } | {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
            offset?: never;
        };
        regions: string[];
    })[];
    saarland: ({
        id: string;
        name: string;
        type: string;
        rule: {
            offset: number;
            month?: never;
            day?: never;
        };
        regions: string[];
    } | {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
            offset?: never;
        };
        regions: string[];
    })[];
    saxony: ({
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
            calculate?: never;
        };
        regions: string[];
    } | {
        id: string;
        name: string;
        type: string;
        rule: {
            calculate: (year: number) => Date;
            month?: never;
            day?: never;
        };
        regions: string[];
    })[];
    'saxony-anhalt': {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    'schleswig-holstein': {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
        };
        regions: string[];
    }[];
    thuringia: {
        id: string;
        name: string;
        type: string;
        rule: {
            month: number;
            day: number;
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
        offset: number;
    };
    regions: string[];
} | {
    id: string;
    name: string;
    type: string;
    rule: {
        calculate: (year: number) => Date;
        month?: never;
        day?: never;
    };
    regions: string[];
})[];
export declare const historicalHolidays: HolidayRule[];
//# sourceMappingURL=holidays.d.ts.map