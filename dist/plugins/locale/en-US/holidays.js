export const holidays = [
    {
        id: 'new-years-day',
        name: "New Year's Day",
        type: 'fixed',
        rule: { month: 1, day: 1 },
        observedRule: {
            type: 'substitute',
            weekends: [0, 6],
            direction: 'forward',
        },
    },
    {
        id: 'independence-day',
        name: 'Independence Day',
        type: 'fixed',
        rule: { month: 7, day: 4 },
        observedRule: {
            type: 'substitute',
            weekends: [0, 6],
            direction: 'forward',
        },
    },
    {
        id: 'veterans-day',
        name: 'Veterans Day',
        type: 'fixed',
        rule: { month: 11, day: 11 },
        observedRule: {
            type: 'substitute',
            weekends: [0, 6],
            direction: 'forward',
        },
    },
    {
        id: 'juneteenth',
        name: 'Juneteenth',
        type: 'fixed',
        rule: { month: 6, day: 19 },
        observedRule: {
            type: 'substitute',
            weekends: [0, 6],
            direction: 'forward',
        },
    },
    {
        id: 'christmas-day',
        name: 'Christmas Day',
        type: 'fixed',
        rule: { month: 12, day: 25 },
        observedRule: {
            type: 'substitute',
            weekends: [0, 6],
            direction: 'forward',
        },
    },
    {
        id: 'martin-luther-king-day',
        name: 'Martin Luther King Jr. Day',
        type: 'nth-weekday',
        rule: { month: 1, weekday: 1, nth: 3 },
    },
    {
        id: 'presidents-day',
        name: "Presidents' Day",
        type: 'nth-weekday',
        rule: { month: 2, weekday: 1, nth: 3 },
    },
    {
        id: 'mothers-day',
        name: "Mother's Day",
        type: 'nth-weekday',
        rule: { month: 5, weekday: 0, nth: 2 },
    },
    {
        id: 'memorial-day',
        name: 'Memorial Day',
        type: 'nth-weekday',
        rule: { month: 5, weekday: 1, nth: -1 },
    },
    {
        id: 'fathers-day',
        name: "Father's Day",
        type: 'nth-weekday',
        rule: { month: 6, weekday: 0, nth: 3 },
    },
    {
        id: 'labor-day',
        name: 'Labor Day',
        type: 'nth-weekday',
        rule: { month: 9, weekday: 1, nth: 1 },
    },
    {
        id: 'columbus-day',
        name: 'Columbus Day',
        type: 'nth-weekday',
        rule: { month: 10, weekday: 1, nth: 2 },
    },
    {
        id: 'thanksgiving',
        name: 'Thanksgiving',
        type: 'nth-weekday',
        rule: { month: 11, weekday: 4, nth: 4 },
    },
    {
        id: 'black-friday',
        name: 'Black Friday',
        type: 'relative',
        rule: { relativeTo: 'thanksgiving', offset: 1 },
    },
    {
        id: 'good-friday',
        name: 'Good Friday',
        type: 'easter-based',
        rule: { offset: -2 },
    },
    {
        id: 'easter-sunday',
        name: 'Easter Sunday',
        type: 'easter-based',
        rule: { offset: 0 },
    },
    {
        id: 'easter-monday',
        name: 'Easter Monday',
        type: 'easter-based',
        rule: { offset: 1 },
    },
];
export const stateHolidays = {
    texas: [
        {
            id: 'texas-independence-day',
            name: 'Texas Independence Day',
            type: 'fixed',
            rule: { month: 3, day: 2 },
            regions: ['TX'],
        },
        {
            id: 'juneteenth',
            name: 'Juneteenth',
            type: 'fixed',
            rule: { month: 6, day: 19 },
            regions: ['TX'],
        },
        {
            id: 'lyndon-b-johnson-day',
            name: 'Lyndon B. Johnson Day',
            type: 'fixed',
            rule: { month: 8, day: 27 },
            regions: ['TX'],
        },
    ],
    california: [
        {
            id: 'cesar-chavez-day',
            name: 'Cesar Chavez Day',
            type: 'fixed',
            rule: { month: 3, day: 31 },
            regions: ['CA'],
        },
    ],
    hawaii: [
        {
            id: 'prince-kuhio-day',
            name: 'Prince Kuhio Day',
            type: 'fixed',
            rule: { month: 3, day: 26 },
            regions: ['HI'],
        },
        {
            id: 'kamehameha-day',
            name: 'Kamehameha Day',
            type: 'fixed',
            rule: { month: 6, day: 11 },
            regions: ['HI'],
        },
        {
            id: 'statehood-day',
            name: 'Statehood Day',
            type: 'nth-weekday',
            rule: { month: 8, weekday: 5, nth: 3 },
            regions: ['HI'],
        },
    ],
    massachusetts: [
        {
            id: 'patriots-day',
            name: "Patriots' Day",
            type: 'nth-weekday',
            rule: { month: 4, weekday: 1, nth: 3 },
            regions: ['MA'],
        },
    ],
    maine: [
        {
            id: 'patriots-day',
            name: "Patriots' Day",
            type: 'nth-weekday',
            rule: { month: 4, weekday: 1, nth: 3 },
            regions: ['ME'],
        },
    ],
};
export const federalHolidays = holidays.filter((h) => [
    'new-years-day',
    'martin-luther-king-day',
    'presidents-day',
    'memorial-day',
    'juneteenth',
    'independence-day',
    'labor-day',
    'columbus-day',
    'veterans-day',
    'thanksgiving',
    'christmas-day',
].includes(h.id));
export const allHolidays = [...holidays, ...Object.values(stateHolidays).flat()];
//# sourceMappingURL=holidays.js.map