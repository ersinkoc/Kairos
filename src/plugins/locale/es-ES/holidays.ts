import type { HolidayRule } from '../../../core/types/holiday.js';

export const holidays: HolidayRule[] = [
  // Fiestas nacionales
  {
    name: 'Año Nuevo',
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    name: 'Epifanía del Señor',
    type: 'fixed',
    rule: { month: 1, day: 6 },
  },
  {
    name: 'Viernes Santo',
    type: 'easter-based',
    rule: { offset: -2 },
  },
  {
    name: 'Fiesta del Trabajo',
    type: 'fixed',
    rule: { month: 5, day: 1 },
  },
  {
    name: 'Asunción de la Virgen',
    type: 'fixed',
    rule: { month: 8, day: 15 },
  },
  {
    name: 'Fiesta Nacional de España',
    type: 'fixed',
    rule: { month: 10, day: 12 },
  },
  {
    name: 'Todos los Santos',
    type: 'fixed',
    rule: { month: 11, day: 1 },
  },
  {
    name: 'Día de la Constitución',
    type: 'fixed',
    rule: { month: 12, day: 6 },
  },
  {
    name: 'Inmaculada Concepción',
    type: 'fixed',
    rule: { month: 12, day: 8 },
  },
  {
    name: 'Navidad',
    type: 'fixed',
    rule: { month: 12, day: 25 },
  },
  // Fiestas basadas en Pascua
  {
    name: 'Jueves Santo',
    type: 'easter-based',
    rule: { offset: -3 },
    regions: [
      'Andalucía',
      'Aragón',
      'Asturias',
      'Baleares',
      'Canarias',
      'Cantabria',
      'Castilla-La Mancha',
      'Castilla y León',
      'Extremadura',
      'Galicia',
      'Madrid',
      'Murcia',
      'Navarra',
      'País Vasco',
      'La Rioja',
    ],
  },
  {
    name: 'Lunes de Pascua',
    type: 'easter-based',
    rule: { offset: 1 },
    regions: ['Baleares', 'Cataluña', 'Comunidad Valenciana', 'Navarra', 'País Vasco'],
  },
];

export const regionalHolidays: Record<string, HolidayRule[]> = {
  andalucia: [
    {
      name: 'Día de Andalucía',
      type: 'fixed',
      rule: { month: 2, day: 28 },
    },
  ],
  aragon: [
    {
      name: 'San Jorge',
      type: 'fixed',
      rule: { month: 4, day: 23 },
    },
  ],
  asturias: [
    {
      name: 'Día de Asturias',
      type: 'fixed',
      rule: { month: 9, day: 8 },
    },
  ],
  baleares: [
    {
      name: 'Día de las Islas Baleares',
      type: 'fixed',
      rule: { month: 3, day: 1 },
    },
  ],
  canarias: [
    {
      name: 'Día de Canarias',
      type: 'fixed',
      rule: { month: 5, day: 30 },
    },
  ],
  cantabria: [
    {
      name: 'Día de las Instituciones de Cantabria',
      type: 'fixed',
      rule: { month: 7, day: 28 },
    },
  ],
  castillaLaMancha: [
    {
      name: 'Día de Castilla-La Mancha',
      type: 'fixed',
      rule: { month: 5, day: 31 },
    },
  ],
  castillaYLeon: [
    {
      name: 'Día de Castilla y León',
      type: 'fixed',
      rule: { month: 4, day: 23 },
    },
  ],
  cataluna: [
    {
      name: 'Sant Jordi',
      type: 'fixed',
      rule: { month: 4, day: 23 },
    },
    {
      name: 'Sant Joan',
      type: 'fixed',
      rule: { month: 6, day: 24 },
    },
    {
      name: 'Diada Nacional de Catalunya',
      type: 'fixed',
      rule: { month: 9, day: 11 },
    },
    {
      name: 'Sant Esteve',
      type: 'fixed',
      rule: { month: 12, day: 26 },
    },
  ],
  extremadura: [
    {
      name: 'Día de Extremadura',
      type: 'fixed',
      rule: { month: 9, day: 8 },
    },
  ],
  galicia: [
    {
      name: 'Día Nacional de Galicia',
      type: 'fixed',
      rule: { month: 7, day: 25 },
    },
  ],
  madrid: [
    {
      name: 'Día de la Comunidad de Madrid',
      type: 'fixed',
      rule: { month: 5, day: 2 },
    },
  ],
  murcia: [
    {
      name: 'Día de la Región de Murcia',
      type: 'fixed',
      rule: { month: 6, day: 9 },
    },
  ],
  navarra: [
    {
      name: 'San Fermín',
      type: 'fixed',
      rule: { month: 7, day: 7 },
    },
  ],
  paisVasco: [
    {
      name: 'Lunes de Pascua',
      type: 'easter-based',
      rule: { offset: 1 },
    },
  ],
  laRioja: [
    {
      name: 'Día de La Rioja',
      type: 'fixed',
      rule: { month: 6, day: 9 },
    },
  ],
  valencia: [
    {
      name: 'San Vicente Mártir',
      type: 'fixed',
      rule: { month: 1, day: 22 },
    },
    {
      name: 'Fallas',
      type: 'fixed',
      rule: { month: 3, day: 19 },
    },
    {
      name: 'San Juan',
      type: 'fixed',
      rule: { month: 6, day: 24 },
    },
    {
      name: 'Día de la Comunidad Valenciana',
      type: 'fixed',
      rule: { month: 10, day: 9 },
    },
  ],
};

export const observances: HolidayRule[] = [
  {
    name: 'San Valentín',
    type: 'fixed',
    rule: { month: 2, day: 14 },
  },
  {
    name: 'Día del Padre',
    type: 'fixed',
    rule: { month: 3, day: 19 },
  },
  {
    name: 'Día de la Madre',
    type: 'nth-weekday',
    rule: { month: 5, weekday: 0, nth: 1 }, // Primer domingo de mayo
  },
  {
    name: 'Nochevieja',
    type: 'fixed',
    rule: { month: 12, day: 31 },
  },
];

export const allHolidays = [...holidays, ...observances];
