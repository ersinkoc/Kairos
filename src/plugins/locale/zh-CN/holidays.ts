import type { HolidayRule } from '../../../core/types/holiday.js';

export const holidays: HolidayRule[] = [
  // 法定节假日 (固定日期)
  {
    name: '元旦',
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    name: '劳动节',
    type: 'fixed',
    rule: { month: 5, day: 1 },
  },
  {
    name: '国庆节',
    type: 'fixed',
    rule: { month: 10, day: 1 },
  },
  {
    name: '国庆黄金周',
    type: 'fixed',
    rule: { month: 10, day: 2 },
  },
  {
    name: '国庆黄金周',
    type: 'fixed',
    rule: { month: 10, day: 3 },
  },
  // 农历节日 (需要农历计算，这里使用近似日期)
  {
    name: '春节',
    type: 'lunar',
    rule: { calendar: 'chinese', month: 1, day: 1 }, // 农历正月初一
  },
  {
    name: '春节假期',
    type: 'lunar',
    rule: { calendar: 'chinese', month: 1, day: 2 }, // 农历正月初二
  },
  {
    name: '春节假期',
    type: 'lunar',
    rule: { calendar: 'chinese', month: 1, day: 3 }, // 农历正月初三
  },
  {
    name: '清明节',
    type: 'fixed',
    rule: { month: 4, day: 5 }, // 通常在公历4月4-6日之间
  },
  {
    name: '端午节',
    type: 'lunar',
    rule: { calendar: 'chinese', month: 5, day: 5 }, // 农历五月初五
  },
  {
    name: '中秋节',
    type: 'lunar',
    rule: { calendar: 'chinese', month: 8, day: 15 }, // 农历八月十五
  },
];

export const regionalHolidays: Record<string, HolidayRule[]> = {
  xinjiang: [
    {
      name: '古尔邦节',
      type: 'custom',
      rule: { calculate: (year: number) => [new Date(year, 8, 10)] }, // Placeholder date
    },
  ],
  tibet: [
    {
      name: '藏历新年',
      type: 'custom',
      rule: { calculate: (year: number) => [new Date(year, 1, 10)] }, // Placeholder date
    },
  ],
  guangxi: [
    {
      name: '三月三',
      type: 'lunar',
      rule: { month: 3, day: 3 },
    },
  ],
  hongkong: [
    {
      name: '佛诞节',
      type: 'lunar',
      rule: { month: 4, day: 8 },
    },
  ],
  macau: [
    {
      name: '澳门特别行政区成立纪念日',
      type: 'fixed',
      rule: { month: 12, day: 20 },
    },
  ],
};

export const observances: HolidayRule[] = [
  {
    name: '情人节',
    type: 'fixed',
    rule: { month: 2, day: 14 },
  },
  {
    name: '妇女节',
    type: 'fixed',
    rule: { month: 3, day: 8 },
  },
  {
    name: '植树节',
    type: 'fixed',
    rule: { month: 3, day: 12 },
  },
  {
    name: '愚人节',
    type: 'fixed',
    rule: { month: 4, day: 1 },
  },
  {
    name: '青年节',
    type: 'fixed',
    rule: { month: 5, day: 4 },
  },
  {
    name: '母亲节',
    type: 'nth-weekday',
    rule: { month: 5, weekday: 0, nth: 2 }, // 五月第二个星期日
  },
  {
    name: '儿童节',
    type: 'fixed',
    rule: { month: 6, day: 1 },
  },
  {
    name: '父亲节',
    type: 'nth-weekday',
    rule: { month: 6, weekday: 0, nth: 3 }, // 六月第三个星期日
  },
  {
    name: '建党节',
    type: 'fixed',
    rule: { month: 7, day: 1 },
  },
  {
    name: '建军节',
    type: 'fixed',
    rule: { month: 8, day: 1 },
  },
  {
    name: '教师节',
    type: 'fixed',
    rule: { month: 9, day: 10 },
  },
  {
    name: '重阳节',
    type: 'lunar',
    rule: { calendar: 'chinese', month: 9, day: 9 },
  },
  {
    name: '万圣节',
    type: 'fixed',
    rule: { month: 10, day: 31 },
  },
  {
    name: '光棍节',
    type: 'fixed',
    rule: { month: 11, day: 11 },
  },
  {
    name: '圣诞节',
    type: 'fixed',
    rule: { month: 12, day: 25 },
  },
];

export const allHolidays = [...holidays, ...observances];
