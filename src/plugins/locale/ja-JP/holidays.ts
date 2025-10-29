import type { HolidayRule } from '../../../core/types/holiday.js';
import { CustomCalculatorUtils } from '../../holiday/calculators/custom.js';

export const holidays: HolidayRule[] = [
  {
    id: 'new-years-day',
    name: '元日',
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    id: 'coming-of-age-day',
    name: '成人の日',
    type: 'nth-weekday',
    rule: { month: 1, weekday: 1, nth: 2 }, // 2nd Monday of January
  },
  {
    id: 'national-foundation-day',
    name: '建国記念の日',
    type: 'fixed',
    rule: { month: 2, day: 11 },
  },
  {
    id: 'emperors-birthday',
    name: '天皇誕生日',
    type: 'fixed',
    rule: { month: 2, day: 23 }, // Changed from December 23 to February 23 in 2020
  },
  {
    id: 'vernal-equinox-day',
    name: '春分の日',
    type: 'custom',
    rule: {
      calculate: (year: number): Date => {
        return CustomCalculatorUtils.calculateVernalEquinox(year);
      },
    },
  },
  {
    id: 'showa-day',
    name: '昭和の日',
    type: 'fixed',
    rule: { month: 4, day: 29 },
  },
  {
    id: 'constitution-day',
    name: '憲法記念日',
    type: 'fixed',
    rule: { month: 5, day: 3 },
  },
  {
    id: 'greenery-day',
    name: 'みどりの日',
    type: 'fixed',
    rule: { month: 5, day: 4 },
  },
  {
    id: 'childrens-day',
    name: 'こどもの日',
    type: 'fixed',
    rule: { month: 5, day: 5 },
  },
  {
    id: 'marine-day',
    name: '海の日',
    type: 'nth-weekday',
    rule: { month: 7, weekday: 1, nth: 3 }, // 3rd Monday of July
  },
  {
    id: 'mountain-day',
    name: '山の日',
    type: 'fixed',
    rule: { month: 8, day: 11 },
  },
  {
    id: 'respect-for-aged-day',
    name: '敬老の日',
    type: 'nth-weekday',
    rule: { month: 9, weekday: 1, nth: 3 }, // 3rd Monday of September
  },
  {
    id: 'autumnal-equinox-day',
    name: '秋分の日',
    type: 'custom',
    rule: {
      calculate: (year: number): Date => {
        return CustomCalculatorUtils.calculateAutumnalEquinox(year);
      },
    },
  },
  {
    id: 'sports-day',
    name: 'スポーツの日',
    type: 'nth-weekday',
    rule: { month: 10, weekday: 1, nth: 2 }, // 2nd Monday of October
  },
  {
    id: 'culture-day',
    name: '文化の日',
    type: 'fixed',
    rule: { month: 11, day: 3 },
  },
  {
    id: 'labor-thanksgiving-day',
    name: '勤労感謝の日',
    type: 'fixed',
    rule: { month: 11, day: 23 },
  },

  // Special Golden Week substitute holidays
  {
    id: 'golden-week-substitute',
    name: 'ゴールデンウィーク振替休日',
    type: 'custom',
    rule: {
      calculate: (year: number): Date[] => {
        return CustomCalculatorUtils.calculateGoldenWeekSubstitutes(year);
      },
    },
  },
];

// Historical holidays (no longer observed)
export const historicalHolidays: HolidayRule[] = [
  {
    id: 'emperors-birthday-showa',
    name: '天皇誕生日（昭和）',
    type: 'fixed',
    rule: { month: 4, day: 29 },
    active: false, // Was celebrated until 1989
  },
  {
    id: 'emperors-birthday-heisei',
    name: '天皇誕生日（平成）',
    type: 'fixed',
    rule: { month: 12, day: 23 },
    active: false, // Was celebrated from 1989 to 2019
  },
  {
    id: 'health-sports-day',
    name: '体育の日',
    type: 'nth-weekday',
    rule: { month: 10, weekday: 1, nth: 2 },
    active: false, // Renamed to スポーツの日 in 2020
  },
  {
    id: 'national-holiday',
    name: '国民の休日',
    type: 'fixed',
    rule: { month: 5, day: 4 },
    active: false, // Was a temporary holiday before becoming みどりの日
  },
];

// Special observances (not official holidays)
export const observances: HolidayRule[] = [
  {
    id: 'setsubun',
    name: '節分',
    type: 'fixed',
    rule: { month: 2, day: 3 },
  },
  {
    id: 'hinamatsuri',
    name: 'ひなまつり',
    type: 'fixed',
    rule: { month: 3, day: 3 },
  },
  {
    id: 'cherry-blossom-day',
    name: '桜の日',
    type: 'fixed',
    rule: { month: 3, day: 27 },
  },
  {
    id: 'mothers-day',
    name: '母の日',
    type: 'nth-weekday',
    rule: { month: 5, weekday: 0, nth: 2 }, // 2nd Sunday of May
  },
  {
    id: 'fathers-day',
    name: '父の日',
    type: 'nth-weekday',
    rule: { month: 6, weekday: 0, nth: 3 }, // 3rd Sunday of June
  },
  {
    id: 'tanabata',
    name: '七夕',
    type: 'fixed',
    rule: { month: 7, day: 7 },
  },
  {
    id: 'obon',
    name: 'お盆',
    type: 'fixed',
    rule: { month: 8, day: 15 },
    duration: 3,
  },
  {
    id: 'respect-for-elderly-day',
    name: '敬老の日',
    type: 'nth-weekday',
    rule: { month: 9, weekday: 1, nth: 3 },
  },
  {
    id: 'shichi-go-san',
    name: '七五三',
    type: 'fixed',
    rule: { month: 11, day: 15 },
  },
  {
    id: 'christmas',
    name: 'クリスマス',
    type: 'fixed',
    rule: { month: 12, day: 25 },
  },
  {
    id: 'new-years-eve',
    name: '大晦日',
    type: 'fixed',
    rule: { month: 12, day: 31 },
  },
];

// Golden Week holidays specifically
export const goldenWeekHolidays = holidays.filter((h) =>
  [
    'showa-day',
    'constitution-day',
    'greenery-day',
    'childrens-day',
    'golden-week-substitute',
  ].includes(h.id || '')
);

// Public holidays only
export const publicHolidays = holidays.filter((h) => h.id !== 'golden-week-substitute');

// All holidays including observances
export const allHolidays = [...holidays, ...observances, ...historicalHolidays];

// Reiwa era holidays (2019-)
export const reiwaHolidays = holidays.filter(
  (h) => h.id !== 'emperors-birthday-showa' && h.id !== 'emperors-birthday-heisei'
);

// Heisei era holidays (1989-2019)
export const heiseiHolidays = [
  ...holidays.filter((h) => h.id !== 'emperors-birthday'),
  ...historicalHolidays.filter((h) => h.id === 'emperors-birthday-heisei'),
];

// Special 2020 Olympics holidays (one-time)
export const olympics2020Holidays: HolidayRule[] = [
  {
    id: 'marine-day-2020',
    name: '海の日（2020年特別）',
    type: 'fixed',
    rule: { month: 7, day: 23 }, // Moved for Olympics
    active: false,
  },
  {
    id: 'sports-day-2020',
    name: 'スポーツの日（2020年特別）',
    type: 'fixed',
    rule: { month: 7, day: 24 }, // Moved for Olympics
    active: false,
  },
  {
    id: 'mountain-day-2020',
    name: '山の日（2020年特別）',
    type: 'fixed',
    rule: { month: 8, day: 10 }, // Moved for Olympics
    active: false,
  },
];
