import kairos from '../../../src/index';
import calendarPlugin from '../../../src/plugins/calendar/calendar';

describe('Calendar Plugin', () => {
  beforeAll(() => {
    kairos.use(calendarPlugin);
  });

  describe('Quarter operations', () => {
    it('should get the current quarter', () => {
      const date1 = kairos('2024-01-15'); // Q1
      expect(date1.quarter()).toBe(1);
      
      const date2 = kairos('2024-05-15'); // Q2
      expect(date2.quarter()).toBe(2);
      
      const date3 = kairos('2024-08-15'); // Q3
      expect(date3.quarter()).toBe(3);
      
      const date4 = kairos('2024-11-15'); // Q4
      expect(date4.quarter()).toBe(4);
    });

    it('should set the quarter', () => {
      const date = kairos('2024-01-15');
      const q2 = date.quarter(2) as any;
      expect(q2.month()).toBe(4); // April
      
      const q4 = date.quarter(4) as any;
      expect(q4.month()).toBe(10); // October
    });

    it('should get start and end of quarter', () => {
      const date = kairos('2024-05-15'); // Q2
      
      const startQ2 = date.startOfQuarter();
      expect(startQ2.format('YYYY-MM-DD')).toBe('2024-04-01');
      
      const endQ2 = date.endOfQuarter();
      expect(endQ2.format('YYYY-MM-DD')).toBe('2024-06-30');
    });

    it('should check if dates are in same quarter', () => {
      const date1 = kairos('2024-04-01');
      const date2 = kairos('2024-06-30');
      const date3 = kairos('2024-07-01');
      
      expect(date1.isSameQuarter(date2)).toBe(true);
      expect(date1.isSameQuarter(date3)).toBe(false);
    });
  });

  describe('Week operations', () => {
    it('should get week number', () => {
      const date = kairos('2024-01-01'); // Monday
      expect(date.week()).toBe(1);
      
      const midYear = kairos('2024-07-01');
      expect(midYear.week()).toBeGreaterThan(20);
      expect(midYear.week()).toBeLessThan(30);
    });

    it('should get ISO week number', () => {
      // ISO week 1 is the week with January 4th
      const date1 = kairos('2024-01-01'); // Monday, ISO week 1
      expect(date1.isoWeek()).toBe(1);
      
      const date2 = kairos('2023-01-01'); // Sunday, ISO week 52 of 2022
      expect(date2.isoWeek()).toBe(52);
      expect(date2.isoWeekYear()).toBe(2022);
    });

    it('should get start and end of week', () => {
      const date = kairos('2024-01-10'); // Wednesday
      
      // Default: week starts on Sunday
      const startWeek = date.startOfWeek();
      expect(startWeek.day()).toBe(0); // Sunday
      expect(startWeek.format('YYYY-MM-DD')).toBe('2024-01-07');
      
      const endWeek = date.endOfWeek();
      expect(endWeek.day()).toBe(6); // Saturday
      expect(endWeek.format('YYYY-MM-DD')).toBe('2024-01-13');
    });

    it('should get start and end of ISO week', () => {
      const date = kairos('2024-01-10'); // Wednesday
      
      // ISO week starts on Monday
      const startISOWeek = date.startOfISOWeek();
      expect(startISOWeek.day()).toBe(1); // Monday
      expect(startISOWeek.format('YYYY-MM-DD')).toBe('2024-01-08');
      
      const endISOWeek = date.endOfISOWeek();
      expect(endISOWeek.day()).toBe(0); // Sunday
      expect(endISOWeek.format('YYYY-MM-DD')).toBe('2024-01-14');
    });

    it('should check if dates are in same week', () => {
      const date1 = kairos('2024-01-07'); // Sunday (start of week)
      const date2 = kairos('2024-01-13'); // Saturday (end of week)
      const date3 = kairos('2024-01-14'); // Sunday (next week)
      
      expect(date1.isSameWeek(date2)).toBe(true);
      expect(date1.isSameWeek(date3)).toBe(false);
      
      // ISO week check - Monday to Sunday
      const monday = kairos('2024-01-08'); // Monday
      const sunday = kairos('2024-01-14'); // Sunday same ISO week
      const nextMonday = kairos('2024-01-15'); // Monday next ISO week
      expect(monday.isSameISOWeek(sunday)).toBe(true);
      expect(monday.isSameISOWeek(nextMonday)).toBe(false);
    });

    it('should get week of month', () => {
      const date1 = kairos('2024-01-01'); // Week 1
      expect(date1.weekOfMonth()).toBe(1);
      
      const date2 = kairos('2024-01-15'); // Week 3
      expect(date2.weekOfMonth()).toBe(3);
      
      const date3 = kairos('2024-01-31'); // Week 5
      expect(date3.weekOfMonth()).toBe(5);
    });

    it('should get weeks in year', () => {
      const date2024 = kairos('2024-06-15');
      expect(date2024.weeksInYear()).toBeGreaterThanOrEqual(52);
      expect(date2024.weeksInYear()).toBeLessThanOrEqual(53);
      
      expect(date2024.isoWeeksInYear()).toBeGreaterThanOrEqual(52);
      expect(date2024.isoWeeksInYear()).toBeLessThanOrEqual(53);
    });
  });

  describe('Day operations', () => {
    it('should get day of year', () => {
      const jan1 = kairos('2024-01-01');
      expect(jan1.dayOfYear()).toBe(1);
      
      const dec31 = kairos('2024-12-31');
      expect(dec31.dayOfYear()).toBe(366); // 2024 is a leap year
      
      const dec31NonLeap = kairos('2023-12-31');
      expect(dec31NonLeap.dayOfYear()).toBe(365);
    });

    it('should set day of year', () => {
      const date = kairos('2024-01-01');
      const day100 = date.dayOfYear(100) as any;
      expect(day100.format('YYYY-MM-DD')).toBe('2024-04-09');
    });

    it('should check weekend and weekday', () => {
      const monday = kairos('2024-01-01');
      const saturday = kairos('2024-01-06');
      const sunday = kairos('2024-01-07');
      
      expect(monday.isWeekend()).toBe(false);
      expect(monday.isWeekday()).toBe(true);
      
      expect(saturday.isWeekend()).toBe(true);
      expect(saturday.isWeekday()).toBe(false);
      
      expect(sunday.isWeekend()).toBe(true);
      expect(sunday.isWeekday()).toBe(false);
    });
  });

  describe('Calendar information', () => {
    it('should get days in month', () => {
      const jan = kairos('2024-01-15');
      expect(jan.daysInMonth()).toBe(31);
      
      const feb = kairos('2024-02-15');
      expect(feb.daysInMonth()).toBe(29); // Leap year
      
      const febNonLeap = kairos('2023-02-15');
      expect(febNonLeap.daysInMonth()).toBe(28);
      
      const apr = kairos('2024-04-15');
      expect(apr.daysInMonth()).toBe(30);
    });

    it('should get days in year', () => {
      const leap = kairos('2024-06-15');
      expect(leap.daysInYear()).toBe(366);
      expect(leap.isLeapYear()).toBe(true);
      
      const nonLeap = kairos('2023-06-15');
      expect(nonLeap.daysInYear()).toBe(365);
      expect(nonLeap.isLeapYear()).toBe(false);
    });

    it('should get complete calendar info', () => {
      const date = kairos('2024-06-15');
      const info = date.calendarInfo();
      
      expect(info.year).toBe(2024);
      expect(info.quarter).toBe(2);
      expect(info.month).toBe(6);
      expect(info.dayOfYear).toBeGreaterThan(150);
      expect(info.dayOfYear).toBeLessThan(200);
      expect(info.daysInMonth).toBe(30);
      expect(info.daysInYear).toBe(366);
      expect(info.isLeapYear).toBe(true);
      expect(info.weekOfMonth).toBeGreaterThan(0);
      expect(info.weekOfMonth).toBeLessThan(6);
    });
  });

  describe('Edge cases', () => {
    it('should handle year boundaries for weeks', () => {
      // Last days of 2023
      const dec31_2023 = kairos('2023-12-31'); // Sunday
      expect(dec31_2023.isoWeek()).toBe(52);
      expect(dec31_2023.isoWeekYear()).toBe(2023);
      
      // First days of 2024
      const jan1_2024 = kairos('2024-01-01'); // Monday
      expect(jan1_2024.isoWeek()).toBe(1);
      expect(jan1_2024.isoWeekYear()).toBe(2024);
    });

    it('should handle leap years correctly', () => {
      expect(kairos.calendar.isLeapYear(2024)).toBe(true);
      expect(kairos.calendar.isLeapYear(2000)).toBe(true);
      expect(kairos.calendar.isLeapYear(1900)).toBe(false);
      expect(kairos.calendar.isLeapYear(2023)).toBe(false);
    });

    it('should throw error for invalid quarter', () => {
      const date = kairos();
      expect(() => date.quarter(0)).toThrow();
      expect(() => date.quarter(5)).toThrow();
    });
  });
});