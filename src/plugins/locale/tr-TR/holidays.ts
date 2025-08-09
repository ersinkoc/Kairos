import type { HolidayRule } from '../../../core/types/holiday.js';

export const holidays: HolidayRule[] = [
  // Fixed secular holidays
  {
    id: 'new-years-day',
    name: 'Yılbaşı',
    type: 'fixed',
    rule: { month: 1, day: 1 },
  },
  {
    id: 'national-sovereignty-day',
    name: 'Ulusal Egemenlik ve Çocuk Bayramı',
    type: 'fixed',
    rule: { month: 4, day: 23 },
  },
  {
    id: 'labor-day',
    name: 'Emek ve Dayanışma Günü',
    type: 'fixed',
    rule: { month: 5, day: 1 },
  },
  {
    id: 'ataturk-commemoration-day',
    name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
    type: 'fixed',
    rule: { month: 5, day: 19 },
  },
  {
    id: 'democracy-day',
    name: 'Demokrasi ve Milli Birlik Günü',
    type: 'fixed',
    rule: { month: 7, day: 15 },
  },
  {
    id: 'victory-day',
    name: 'Zafer Bayramı',
    type: 'fixed',
    rule: { month: 8, day: 30 },
  },
  {
    id: 'republic-day',
    name: 'Cumhuriyet Bayramı',
    type: 'fixed',
    rule: { month: 10, day: 29 },
  },

  // Islamic holidays (lunar calendar) - using approximate dates for 2024
  {
    id: 'ramadan-feast',
    name: 'Ramazan Bayramı',
    type: 'custom',
    rule: {
      calculate: (year: number): Date[] => {
        // Approximate dates for Ramadan Feast (Eid al-Fitr)
        const dates: Record<number, { month: number, day: number }> = {
          2024: { month: 4, day: 10 }, // April 10, 2024
          2025: { month: 3, day: 30 }, // March 30, 2025 (approximate)
          2023: { month: 4, day: 21 }, // April 21, 2023
        };
        
        const dateInfo = dates[year] || { month: 4, day: 15 }; // Default fallback
        const startDate = new Date(year, dateInfo.month - 1, dateInfo.day);
        
        // Return 3 days for the feast
        return [
          startDate,
          new Date(year, dateInfo.month - 1, dateInfo.day + 1),
          new Date(year, dateInfo.month - 1, dateInfo.day + 2)
        ];
      },
    },
    duration: 3,
  },
  {
    id: 'sacrifice-feast',
    name: 'Kurban Bayramı',
    type: 'custom',
    rule: {
      calculate: (year: number): Date[] => {
        // Approximate dates for Sacrifice Feast (Eid al-Adha)
        const dates: Record<number, { month: number, day: number }> = {
          2024: { month: 6, day: 16 }, // June 16, 2024
          2025: { month: 6, day: 6 },  // June 6, 2025 (approximate)
          2023: { month: 6, day: 28 }, // June 28, 2023
        };
        
        const dateInfo = dates[year] || { month: 6, day: 20 }; // Default fallback
        const startDate = new Date(year, dateInfo.month - 1, dateInfo.day);
        
        // Return 4 days for the feast
        return [
          startDate,
          new Date(year, dateInfo.month - 1, dateInfo.day + 1),
          new Date(year, dateInfo.month - 1, dateInfo.day + 2),
          new Date(year, dateInfo.month - 1, dateInfo.day + 3)
        ];
      },
    },
    duration: 4,
  },
  {
    id: 'mawlid',
    name: 'Mevlid Kandili',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 3, // Rabi' al-awwal
      day: 12,
    },
  },
  {
    id: 'regaib-night',
    name: 'Regaib Kandili',
    type: 'custom',
    rule: {
      // First Thursday night of Rajab
      calculate: (year: number): Date => {
        // Approximate calculation for first Thursday of Rajab
        // This is a simplified version - actual calculation would be more complex
        const rajabStart = new Date(year, 1, 15); // Approximate

        // Find first Thursday
        let current = new Date(rajabStart);
        while (current.getDay() !== 4) {
          current.setDate(current.getDate() + 1);
        }

        return current;
      },
    },
  },
  {
    id: 'miraj-night',
    name: 'Mirac Kandili',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 7, // Rajab
      day: 27,
    },
  },
  {
    id: 'laylat-al-baraat',
    name: 'Berat Kandili',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 8, // Sha'ban
      day: 15,
    },
  },
  {
    id: 'laylat-al-qadr',
    name: 'Kadir Gecesi',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 9, // Ramadan
      day: 27,
    },
  },
  {
    id: 'arafat-day',
    name: 'Arefe Günü',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 12, // Dhul Hijjah
      day: 9,
    },
  },
];

// Religious observances (not official holidays)
export const observances: HolidayRule[] = [
  {
    id: 'ashura',
    name: 'Aşure Günü',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 1, // Muharram
      day: 10,
    },
  },
  {
    id: 'isra-and-miraj',
    name: 'İsra ve Mirac',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 7, // Rajab
      day: 27,
    },
  },
  {
    id: 'shab-e-barat',
    name: 'Berat Kandili',
    type: 'lunar',
    rule: {
      calendar: 'islamic',
      month: 8, // Sha'ban
      day: 15,
    },
  },
];

// Historical Turkish holidays (not currently observed)
export const historicalHolidays: HolidayRule[] = [
  {
    id: 'conquest-of-istanbul',
    name: "İstanbul'un Fethi",
    type: 'fixed',
    rule: { month: 5, day: 29 },
    active: false,
  },
  {
    id: 'gallipoli-victory',
    name: 'Çanakkale Zaferi',
    type: 'fixed',
    rule: { month: 3, day: 18 },
    active: false,
  },
];

// All holidays including observances
export const allHolidays = [...holidays, ...observances, ...historicalHolidays];

// Official public holidays only
export const publicHolidays = holidays.filter((h) =>
  [
    'new-years-day',
    'national-sovereignty-day',
    'labor-day',
    'ataturk-commemoration-day',
    'democracy-day',
    'victory-day',
    'republic-day',
    'ramadan-feast',
    'sacrifice-feast',
  ].includes(h.id!)
);
