export const holidays = [
    {
        id: 'new-years-day',
        name: 'Neujahr',
        type: 'fixed',
        rule: { month: 1, day: 1 },
    },
    {
        id: 'labor-day',
        name: 'Tag der Arbeit',
        type: 'fixed',
        rule: { month: 5, day: 1 },
    },
    {
        id: 'german-unity-day',
        name: 'Tag der Deutschen Einheit',
        type: 'fixed',
        rule: { month: 10, day: 3 },
    },
    {
        id: 'christmas-day',
        name: '1. Weihnachtstag',
        type: 'fixed',
        rule: { month: 12, day: 25 },
    },
    {
        id: 'boxing-day',
        name: '2. Weihnachtstag',
        type: 'fixed',
        rule: { month: 12, day: 26 },
    },
    {
        id: 'good-friday',
        name: 'Karfreitag',
        type: 'easter-based',
        rule: { offset: -2 },
    },
    {
        id: 'easter-sunday',
        name: 'Ostersonntag',
        type: 'easter-based',
        rule: { offset: 0 },
    },
    {
        id: 'easter-monday',
        name: 'Ostermontag',
        type: 'easter-based',
        rule: { offset: 1 },
    },
    {
        id: 'ascension-day',
        name: 'Christi Himmelfahrt',
        type: 'easter-based',
        rule: { offset: 39 },
    },
    {
        id: 'whit-sunday',
        name: 'Pfingstsonntag',
        type: 'easter-based',
        rule: { offset: 49 },
    },
    {
        id: 'whit-monday',
        name: 'Pfingstmontag',
        type: 'easter-based',
        rule: { offset: 50 },
    },
];
export const stateHolidays = {
    'baden-württemberg': [
        {
            id: 'epiphany',
            name: 'Heilige Drei Könige',
            type: 'fixed',
            rule: { month: 1, day: 6 },
            regions: ['BW'],
        },
        {
            id: 'corpus-christi',
            name: 'Fronleichnam',
            type: 'easter-based',
            rule: { offset: 60 },
            regions: ['BW'],
        },
        {
            id: 'all-saints-day',
            name: 'Allerheiligen',
            type: 'fixed',
            rule: { month: 11, day: 1 },
            regions: ['BW'],
        },
    ],
    bavaria: [
        {
            id: 'epiphany',
            name: 'Heilige Drei Könige',
            type: 'fixed',
            rule: { month: 1, day: 6 },
            regions: ['BY'],
        },
        {
            id: 'corpus-christi',
            name: 'Fronleichnam',
            type: 'easter-based',
            rule: { offset: 60 },
            regions: ['BY'],
        },
        {
            id: 'assumption-day',
            name: 'Mariä Himmelfahrt',
            type: 'fixed',
            rule: { month: 8, day: 15 },
            regions: ['BY'],
        },
        {
            id: 'all-saints-day',
            name: 'Allerheiligen',
            type: 'fixed',
            rule: { month: 11, day: 1 },
            regions: ['BY'],
        },
    ],
    berlin: [
        {
            id: 'womens-day',
            name: 'Internationaler Frauentag',
            type: 'fixed',
            rule: { month: 3, day: 8 },
            regions: ['BE'],
        },
    ],
    brandenburg: [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['BB'],
        },
    ],
    bremen: [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['HB'],
        },
    ],
    hamburg: [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['HH'],
        },
    ],
    hesse: [
        {
            id: 'corpus-christi',
            name: 'Fronleichnam',
            type: 'easter-based',
            rule: { offset: 60 },
            regions: ['HE'],
        },
    ],
    'lower-saxony': [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['NI'],
        },
    ],
    'mecklenburg-vorpommern': [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['MV'],
        },
    ],
    'north-rhine-westphalia': [
        {
            id: 'corpus-christi',
            name: 'Fronleichnam',
            type: 'easter-based',
            rule: { offset: 60 },
            regions: ['NW'],
        },
        {
            id: 'all-saints-day',
            name: 'Allerheiligen',
            type: 'fixed',
            rule: { month: 11, day: 1 },
            regions: ['NW'],
        },
    ],
    'rhineland-palatinate': [
        {
            id: 'corpus-christi',
            name: 'Fronleichnam',
            type: 'easter-based',
            rule: { offset: 60 },
            regions: ['RP'],
        },
        {
            id: 'all-saints-day',
            name: 'Allerheiligen',
            type: 'fixed',
            rule: { month: 11, day: 1 },
            regions: ['RP'],
        },
    ],
    saarland: [
        {
            id: 'corpus-christi',
            name: 'Fronleichnam',
            type: 'easter-based',
            rule: { offset: 60 },
            regions: ['SL'],
        },
        {
            id: 'assumption-day',
            name: 'Mariä Himmelfahrt',
            type: 'fixed',
            rule: { month: 8, day: 15 },
            regions: ['SL'],
        },
        {
            id: 'all-saints-day',
            name: 'Allerheiligen',
            type: 'fixed',
            rule: { month: 11, day: 1 },
            regions: ['SL'],
        },
    ],
    saxony: [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['SN'],
        },
        {
            id: 'repentance-day',
            name: 'Buß- und Bettag',
            type: 'custom',
            rule: {
                calculate: (year) => {
                    const nov23 = new Date(year, 10, 23);
                    const daysBack = (nov23.getDay() + 4) % 7;
                    const repentanceDay = new Date(year, 10, 23 - daysBack);
                    return repentanceDay;
                },
            },
            regions: ['SN'],
        },
    ],
    'saxony-anhalt': [
        {
            id: 'epiphany',
            name: 'Heilige Drei Könige',
            type: 'fixed',
            rule: { month: 1, day: 6 },
            regions: ['ST'],
        },
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['ST'],
        },
    ],
    'schleswig-holstein': [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['SH'],
        },
    ],
    thuringia: [
        {
            id: 'reformation-day',
            name: 'Reformationstag',
            type: 'fixed',
            rule: { month: 10, day: 31 },
            regions: ['TH'],
        },
    ],
};
export const federalHolidays = holidays;
export const allHolidays = [...holidays, ...Object.values(stateHolidays).flat()];
export const historicalHolidays = [
    {
        id: 'day-of-german-unity-old',
        name: 'Tag der deutschen Einheit (alt)',
        type: 'fixed',
        rule: { month: 6, day: 17 },
        active: false,
    },
    {
        id: 'reformation-day-2017',
        name: 'Reformationstag 2017',
        type: 'fixed',
        rule: { month: 10, day: 31 },
        active: false,
    },
];
//# sourceMappingURL=holidays.js.map