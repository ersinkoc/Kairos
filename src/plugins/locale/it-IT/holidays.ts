import type { HolidayRule } from '../../../core/types/holiday.js';

export const holidays: HolidayRule[] = [
  // Feste nazionali fisse
  {
    name: 'Capodanno',
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    name: 'Epifania',
    type: 'fixed',
    rule: { month: 1, day: 6 },
  },
  {
    name: 'Festa della Liberazione',
    type: 'fixed',
    rule: { month: 4, day: 25 },
  },
  {
    name: 'Festa del Lavoro',
    type: 'fixed',
    rule: { month: 5, day: 1 },
  },
  {
    name: 'Festa della Repubblica',
    type: 'fixed',
    rule: { month: 6, day: 2 },
  },
  {
    name: 'Assunzione di Maria',
    type: 'fixed',
    rule: { month: 8, day: 15 },
  },
  {
    name: 'Ognissanti',
    type: 'fixed',
    rule: { month: 11, day: 1 },
  },
  {
    name: 'Immacolata Concezione',
    type: 'fixed',
    rule: { month: 12, day: 8 },
  },
  {
    name: 'Natale',
    type: 'fixed',
    rule: { month: 12, day: 25 },
  },
  {
    name: 'Santo Stefano',
    type: 'fixed',
    rule: { month: 12, day: 26 },
  },
  // Feste mobili basate sulla Pasqua
  {
    name: 'Pasquetta',
    type: 'easter-based',
    rule: { offset: 1 },
  },
];

export const regionalHolidays: Record<string, HolidayRule[]> = {
  sicilia: [
    {
      name: 'Santa Lucia',
      type: 'fixed',
      rule: { month: 12, day: 13 },
    },
  ],
  sardegna: [
    {
      name: "Sagra di Sant'Efisio",
      type: 'fixed',
      rule: { month: 5, day: 1 },
    },
  ],
  veneto: [
    {
      name: 'San Marco',
      type: 'fixed',
      rule: { month: 4, day: 25 },
    },
  ],
  toscana: [
    {
      name: 'San Giovanni Battista',
      type: 'fixed',
      rule: { month: 6, day: 24 },
    },
  ],
  lazio: [
    {
      name: 'Santi Pietro e Paolo',
      type: 'fixed',
      rule: { month: 6, day: 29 },
    },
  ],
  lombardia: [
    {
      name: "Sant'Ambrogio",
      type: 'fixed',
      rule: { month: 12, day: 7 },
    },
  ],
};

export const observances: HolidayRule[] = [
  {
    name: 'San Valentino',
    type: 'fixed',
    rule: { month: 2, day: 14 },
  },
  {
    name: 'Festa della Donna',
    type: 'fixed',
    rule: { month: 3, day: 8 },
  },
  {
    name: 'Festa della Mamma',
    type: 'nth-weekday',
    rule: { month: 5, weekday: 0, nth: 2 }, // Seconda domenica di maggio
  },
  {
    name: 'Festa del Papà',
    type: 'fixed',
    rule: { month: 3, day: 19 },
  },
  {
    name: 'Vigilia di Natale',
    type: 'fixed',
    rule: { month: 12, day: 24 },
  },
  {
    name: 'Capodanno',
    type: 'fixed',
    rule: { month: 12, day: 31 },
  },
];

export const allHolidays = [...holidays, ...observances];
