import type { HolidayRule } from '../../../core/types/holiday.js';

export const holidays: HolidayRule[] = [
  // Jours fériés fixes
  {
    name: "Jour de l'An",
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    name: 'Fête du Travail',
    type: 'fixed',
    rule: { month: 5, day: 1 },
  },
  {
    name: 'Victoire 1945',
    type: 'fixed',
    rule: { month: 5, day: 8 },
  },
  {
    name: 'Fête Nationale',
    type: 'fixed',
    rule: { month: 7, day: 14 },
  },
  {
    name: 'Assomption',
    type: 'fixed',
    rule: { month: 8, day: 15 },
  },
  {
    name: 'Toussaint',
    type: 'fixed',
    rule: { month: 11, day: 1 },
  },
  {
    name: 'Armistice 1918',
    type: 'fixed',
    rule: { month: 11, day: 11 },
  },
  {
    name: 'Noël',
    type: 'fixed',
    rule: { month: 12, day: 25 },
  },
  // Jours fériés basés sur Pâques
  {
    name: 'Lundi de Pâques',
    type: 'easter-based',
    rule: { offset: 1 },
  },
  {
    name: 'Ascension',
    type: 'easter-based',
    rule: { offset: 39 },
  },
  {
    name: 'Lundi de Pentecôte',
    type: 'easter-based',
    rule: { offset: 50 },
  },
  {
    name: 'Vendredi Saint',
    type: 'easter-based',
    rule: { offset: -2 },
    regions: ['Alsace', 'Moselle'],
  },
  {
    name: 'Saint-Étienne',
    type: 'fixed',
    rule: { month: 12, day: 26 },
    regions: ['Alsace', 'Moselle'],
  },
];

export const observances: HolidayRule[] = [
  {
    name: 'Saint-Valentin',
    type: 'fixed',
    rule: { month: 2, day: 14 },
  },
  {
    name: 'Fête des Mères',
    type: 'nth-weekday',
    rule: { month: 5, weekday: 0, nth: -1 }, // Dernier dimanche de mai (sauf si Pentecôte)
  },
  {
    name: 'Fête des Pères',
    type: 'nth-weekday',
    rule: { month: 6, weekday: 0, nth: 3 }, // 3ème dimanche de juin
  },
  {
    name: 'Fête de la Musique',
    type: 'fixed',
    rule: { month: 6, day: 21 },
  },
  {
    name: 'Halloween',
    type: 'fixed',
    rule: { month: 10, day: 31 },
  },
];

export const regionalHolidays: Record<string, HolidayRule[]> = {
  alsace: [
    {
      name: 'Vendredi Saint',
      type: 'easter-based',
      rule: { offset: -2 },
    },
    {
      name: 'Saint-Étienne',
      type: 'fixed',
      rule: { month: 12, day: 26 },
    },
  ],
  martinique: [
    {
      name: "Abolition de l'esclavage",
      type: 'fixed',
      rule: { month: 5, day: 22 },
    },
  ],
  guadeloupe: [
    {
      name: "Abolition de l'esclavage",
      type: 'fixed',
      rule: { month: 5, day: 27 },
    },
  ],
  guyane: [
    {
      name: "Abolition de l'esclavage",
      type: 'fixed',
      rule: { month: 6, day: 10 },
    },
  ],
  reunion: [
    {
      name: "Abolition de l'esclavage",
      type: 'fixed',
      rule: { month: 12, day: 20 },
    },
  ],
};

export const allHolidays = [...holidays, ...observances];
