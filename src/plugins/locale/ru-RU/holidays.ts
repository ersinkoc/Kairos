import type { HolidayRule } from '../../../core/types/holiday.js';

export const holidays: HolidayRule[] = [
  // Государственные праздники (фиксированные даты)
  {
    name: 'Новый год',
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    name: 'Рождество Христово',
    type: 'fixed',
    rule: { month: 1, day: 7 },
  },
  {
    name: 'День защитника Отечества',
    type: 'fixed',
    rule: { month: 2, day: 23 },
  },
  {
    name: 'Международный женский день',
    type: 'fixed',
    rule: { month: 3, day: 8 },
  },
  {
    name: 'Праздник Весны и Труда',
    type: 'fixed',
    rule: { month: 5, day: 1 },
  },
  {
    name: 'День Победы',
    type: 'fixed',
    rule: { month: 5, day: 9 },
  },
  {
    name: 'День России',
    type: 'fixed',
    rule: { month: 6, day: 12 },
  },
  {
    name: 'День народного единства',
    type: 'fixed',
    rule: { month: 11, day: 4 },
  },
  // Новогодние каникулы (дополнительные дни)
  {
    name: 'Новогодние каникулы',
    type: 'fixed',
    rule: { month: 1, day: 2 },
  },
  {
    name: 'Новогодние каникулы',
    type: 'fixed',
    rule: { month: 1, day: 3 },
  },
  {
    name: 'Новогодние каникулы',
    type: 'fixed',
    rule: { month: 1, day: 4 },
  },
  {
    name: 'Новогодние каникулы',
    type: 'fixed',
    rule: { month: 1, day: 5 },
  },
  {
    name: 'Новогодние каникулы',
    type: 'fixed',
    rule: { month: 1, day: 6 },
  },
  {
    name: 'Новогодние каникулы',
    type: 'fixed',
    rule: { month: 1, day: 8 },
  },
  // Православная Пасха (подвижный праздник)
  {
    name: 'Православная Пасха',
    type: 'easter-based',
    rule: { offset: 0 }, // Orthodox Easter calculation needed
  },
];

export const regionalHolidays: Record<string, HolidayRule[]> = {
  tatarstan: [
    {
      name: 'День Республики Татарстан',
      type: 'fixed',
      rule: { month: 8, day: 30 },
    },
  ],
  bashkortostan: [
    {
      name: 'День Республики Башкортостан',
      type: 'fixed',
      rule: { month: 10, day: 11 },
    },
  ],
  sakha: [
    {
      name: 'День Республики Саха (Якутия)',
      type: 'fixed',
      rule: { month: 4, day: 27 },
    },
  ],
  chechnya: [
    {
      name: 'День мира в Чеченской Республике',
      type: 'fixed',
      rule: { month: 4, day: 16 },
    },
  ],
  dagestan: [
    {
      name: 'День единения народов Дагестана',
      type: 'fixed',
      rule: { month: 9, day: 15 },
    },
  ],
};

export const observances: HolidayRule[] = [
  {
    name: 'День святого Валентина',
    type: 'fixed',
    rule: { month: 2, day: 14 },
  },
  {
    name: 'Масленица',
    type: 'easter-based',
    rule: { offset: -49 }, // За 49 дней до Пасхи
  },
  {
    name: 'День космонавтики',
    type: 'fixed',
    rule: { month: 4, day: 12 },
  },
  {
    name: 'Радоница',
    type: 'easter-based',
    rule: { offset: 9 }, // Через 9 дней после Пасхи
  },
  {
    name: 'День Победы (вечером)',
    type: 'fixed',
    rule: { month: 5, day: 9 },
  },
  {
    name: 'День знаний',
    type: 'fixed',
    rule: { month: 9, day: 1 },
  },
  {
    name: 'День учителя',
    type: 'fixed',
    rule: { month: 10, day: 5 },
  },
  {
    name: 'День матери',
    type: 'nth-weekday',
    rule: { month: 11, weekday: 0, nth: -1 }, // Последнее воскресенье ноября
  },
  {
    name: 'День Конституции Российской Федерации',
    type: 'fixed',
    rule: { month: 12, day: 12 },
  },
];

export const allHolidays = [...holidays, ...observances];
