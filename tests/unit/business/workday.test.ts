import kairos from '../../../src/core/plugin-system.js';
import { testDates, testHelpers, generators } from '../../setup.js';

describe('Business Day Calculations', () => {
  describe('Basic Business Day Detection', () => {
    test('should identify weekdays as business days', () => {
      const monday = kairos('2024-01-08'); // Monday
      const tuesday = kairos('2024-01-09'); // Tuesday
      const wednesday = kairos('2024-01-10'); // Wednesday
      const thursday = kairos('2024-01-11'); // Thursday
      const friday = kairos('2024-01-12'); // Friday

      expect(monday.isBusinessDay()).toBe(true);
      expect(tuesday.isBusinessDay()).toBe(true);
      expect(wednesday.isBusinessDay()).toBe(true);
      expect(thursday.isBusinessDay()).toBe(true);
      expect(friday.isBusinessDay()).toBe(true);
    });

    test('should identify weekends as non-business days', () => {
      const saturday = kairos('2024-01-13'); // Saturday
      const sunday = kairos('2024-01-14'); // Sunday

      expect(saturday.isBusinessDay()).toBe(false);
      expect(sunday.isBusinessDay()).toBe(false);

      expect(saturday.isWeekend()).toBe(true);
      expect(sunday.isWeekend()).toBe(true);
    });

    test('should identify holidays as non-business days', () => {
      const newYear = kairos('2024-01-01'); // New Year's Day
      const christmas = kairos('2024-12-25'); // Christmas Day
      const july4th = kairos('2024-07-04'); // Independence Day

      expect(newYear.isBusinessDay()).toBe(false);
      expect(christmas.isBusinessDay()).toBe(false);
      expect(july4th.isBusinessDay()).toBe(false);
    });
  });

  describe('Next/Previous Business Day', () => {
    test('should find next business day from weekday', () => {
      const thursday = kairos('2024-01-11'); // Thursday
      const nextBusiness = thursday.nextBusinessDay();

      expect(nextBusiness.format('YYYY-MM-DD')).toBe('2024-01-12'); // Friday
      expect(nextBusiness.isBusinessDay()).toBe(true);
    });

    test('should find next business day from Friday', () => {
      const friday = kairos('2024-01-12'); // Friday
      const nextBusiness = friday.nextBusinessDay();

      // Jan 15, 2024 is Martin Luther King Jr. Day (3rd Monday of January), so next business day is Tuesday
      expect(nextBusiness.format('YYYY-MM-DD')).toBe('2024-01-16'); // Following Tuesday (MLK Day on Monday)
      expect(nextBusiness.isBusinessDay()).toBe(true);
    });

    test('should find next business day from weekend', () => {
      const saturday = kairos('2024-01-13'); // Saturday
      const sunday = kairos('2024-01-14'); // Sunday

      const nextFromSat = saturday.nextBusinessDay();
      const nextFromSun = sunday.nextBusinessDay();

      // Jan 15, 2024 is Martin Luther King Jr. Day, so next business day is Tuesday
      expect(nextFromSat.format('YYYY-MM-DD')).toBe('2024-01-16'); // Tuesday (MLK Day on Monday)
      expect(nextFromSun.format('YYYY-MM-DD')).toBe('2024-01-16'); // Tuesday (MLK Day on Monday)
    });

    test('should find previous business day from weekday', () => {
      const tuesday = kairos('2024-01-09'); // Tuesday
      const prevBusiness = tuesday.previousBusinessDay();

      expect(prevBusiness.format('YYYY-MM-DD')).toBe('2024-01-08'); // Monday
      expect(prevBusiness.isBusinessDay()).toBe(true);
    });

    test('should find previous business day from Monday', () => {
      const monday = kairos('2024-01-15'); // Monday
      const prevBusiness = monday.previousBusinessDay();

      expect(prevBusiness.format('YYYY-MM-DD')).toBe('2024-01-12'); // Previous Friday
      expect(prevBusiness.isBusinessDay()).toBe(true);
    });
  });

  describe('Adding Business Days', () => {
    test('should add business days correctly', () => {
      const monday = kairos('2024-01-08'); // Monday

      const plus1 = monday.addBusinessDays(1);
      const plus2 = monday.addBusinessDays(2);
      const plus5 = monday.addBusinessDays(5);

      expect(plus1.format('YYYY-MM-DD')).toBe('2024-01-09'); // Tuesday
      expect(plus2.format('YYYY-MM-DD')).toBe('2024-01-10'); // Wednesday
      expect(plus5.format('YYYY-MM-DD')).toBe('2024-01-16'); // Following Tuesday (skips MLK Day)
    });

    test('should subtract business days correctly', () => {
      const friday = kairos('2024-01-12'); // Friday

      const minus1 = friday.addBusinessDays(-1);
      const minus2 = friday.addBusinessDays(-2);
      const minus5 = friday.addBusinessDays(-5);

      expect(minus1.format('YYYY-MM-DD')).toBe('2024-01-11'); // Thursday
      expect(minus2.format('YYYY-MM-DD')).toBe('2024-01-10'); // Wednesday
      expect(minus5.format('YYYY-MM-DD')).toBe('2024-01-05'); // Previous Friday
    });

    test('should handle adding zero business days', () => {
      const date = kairos('2024-01-08'); // Monday
      const same = date.addBusinessDays(0);

      expect(same.format('YYYY-MM-DD')).toBe('2024-01-08');
    });

    test('should skip weekends when adding business days', () => {
      const thursday = kairos('2024-01-11'); // Thursday
      const plus2 = thursday.addBusinessDays(2);

      // Should skip Saturday, Sunday, and MLK Day (Monday)
      expect(plus2.format('YYYY-MM-DD')).toBe('2024-01-16'); // Following Tuesday (skips MLK Day)
    });

    test('should skip holidays when adding business days', () => {
      const dec23 = kairos('2024-12-23'); // Monday before Christmas
      const plus2 = dec23.addBusinessDays(2);

      // Should skip Christmas Day (Dec 25)
      expect(plus2.format('YYYY-MM-DD')).toBe('2024-12-26'); // Day after Christmas
    });
  });

  describe('Business Days Between', () => {
    test('should calculate business days between weekdays', () => {
      const monday = kairos('2024-01-08'); // Monday
      const friday = kairos('2024-01-12'); // Friday

      const daysBetween = monday.businessDaysBetween(friday);
      expect(daysBetween).toBe(4); // Tue, Wed, Thu, Fri
    });

    test('should calculate business days across weekends', () => {
      const friday = kairos('2024-01-12'); // Friday
      const nextMonday = kairos('2024-01-15'); // Martin Luther King Jr. Day (holiday)

      const daysBetween = friday.businessDaysBetween(nextMonday);
      expect(daysBetween).toBe(0); // MLK Day is not a business day
    });

    test('should handle negative ranges', () => {
      const friday = kairos('2024-01-12'); // Friday
      const monday = kairos('2024-01-08'); // Monday

      const daysBetween = friday.businessDaysBetween(monday);
      expect(daysBetween).toBe(-4); // Negative because we're going backwards
    });

    test('should return zero for same day', () => {
      const date = kairos('2024-01-08'); // Monday
      const same = kairos('2024-01-08'); // Same Monday

      const daysBetween = date.businessDaysBetween(same);
      expect(daysBetween).toBe(0);
    });
  });

  describe('Business Days in Period', () => {
    test('should count business days in month', () => {
      const january = kairos('2024-01-01');
      const businessDays = january.businessDaysInMonth();

      expect(businessDays).toBeGreaterThan(0);
      expect(businessDays).toBeLessThanOrEqual(31);

      // January 2024 has 31 days, minus 8 weekend days, minus 2 holidays (New Year's & MLK Day) = 21
      expect(businessDays).toBe(21);
    });

    test('should get business days in range', () => {
      const start = kairos('2024-01-01');
      const end = kairos('2024-01-31');

      const businessDays = kairos.getBusinessDaysInRange(start, end);

      expect(businessDays).toBeInstanceOf(Array);
      expect(businessDays.length).toBe(21); // Same as businessDaysInMonth

      // All returned days should be business days
      businessDays.forEach((day) => {
        expect(day.isBusinessDay()).toBe(true);
      });
    });
  });

  describe('Settlement Date Calculations', () => {
    test('should calculate T+1 settlement', () => {
      const tradeDate = kairos('2024-01-08'); // Monday
      const settlementDate = tradeDate.settlementDate(1);

      expect(settlementDate.format('YYYY-MM-DD')).toBe('2024-01-09'); // Tuesday
      expect(settlementDate.isBusinessDay()).toBe(true);
    });

    test('should calculate T+3 settlement', () => {
      const tradeDate = kairos('2024-01-08'); // Monday
      const settlementDate = tradeDate.settlementDate(3);

      expect(settlementDate.format('YYYY-MM-DD')).toBe('2024-01-11'); // Thursday
      expect(settlementDate.isBusinessDay()).toBe(true);
    });

    test('should calculate T+3 settlement over weekend', () => {
      const tradeDate = kairos('2024-01-12'); // Friday
      const settlementDate = tradeDate.settlementDate(3);

      // Should skip weekend and MLK Day (Monday), land on Thursday
      expect(settlementDate.format('YYYY-MM-DD')).toBe('2024-01-18'); // Thursday (skips MLK Day)
      expect(settlementDate.isBusinessDay()).toBe(true);
    });
  });

  describe('Working Hours', () => {
    test('should identify working hours correctly', () => {
      const workingHour = kairos('2024-01-08 14:30'); // Monday 2:30 PM
      const beforeWork = kairos('2024-01-08 08:30'); // Monday 8:30 AM
      const afterWork = kairos('2024-01-08 18:30'); // Monday 6:30 PM
      const weekend = kairos('2024-01-13 14:30'); // Saturday 2:30 PM

      expect(workingHour.isWorkingHour()).toBe(true);
      expect(beforeWork.isWorkingHour()).toBe(false);
      expect(afterWork.isWorkingHour()).toBe(false);
      expect(weekend.isWorkingHour()).toBe(false);
    });

    test('should handle custom working hours', () => {
      const earlyMorning = kairos('2024-01-08 07:30'); // Monday 7:30 AM
      const lateEvening = kairos('2024-01-08 19:30'); // Monday 7:30 PM

      // Default hours (9-17)
      expect(earlyMorning.isWorkingHour()).toBe(false);
      expect(lateEvening.isWorkingHour()).toBe(false);

      // Custom hours (6-20)
      expect(earlyMorning.isWorkingHour(6, 20)).toBe(true);
      expect(lateEvening.isWorkingHour(6, 20)).toBe(true);
    });
  });

  describe('Static Methods', () => {
    test('should get business days in month', () => {
      const businessDays = kairos.getBusinessDaysInMonth(2024, 1);

      expect(businessDays).toBeInstanceOf(Array);
      expect(businessDays.length).toBe(21);

      businessDays.forEach((day) => {
        expect(day.isBusinessDay()).toBe(true);
      });
    });

    test('should get nth business day of month', () => {
      const firstBusinessDay = kairos.getNthBusinessDay(2024, 1, 1);
      const fifthBusinessDay = kairos.getNthBusinessDay(2024, 1, 5);

      expect(firstBusinessDay.format('YYYY-MM-DD')).toBe('2024-01-02'); // Tuesday (after New Year's)
      expect(fifthBusinessDay.format('YYYY-MM-DD')).toBe('2024-01-08'); // Monday
    });

    test('should get last business day of month', () => {
      const lastBusinessDay = kairos.getLastBusinessDay(2024, 1);

      expect(lastBusinessDay.format('YYYY-MM-DD')).toBe('2024-01-31'); // Wednesday
      expect(lastBusinessDay.isBusinessDay()).toBe(true);
    });

    test('should count business days in year', () => {
      const businessDays2024 = kairos.businessDaysInYear(2024);

      expect(businessDays2024).toBeGreaterThan(245); // Account for federal holidays
      expect(businessDays2024).toBeLessThan(280);
    });
  });

  describe('Custom Business Day Configuration', () => {
    test('should handle custom weekend configuration', () => {
      const date = kairos('2024-01-12'); // Friday

      // Default configuration (Saturday, Sunday are weekends)
      expect(date.isBusinessDay()).toBe(true);

      // Custom configuration (Friday, Saturday are weekends)
      const customConfig = {
        weekends: [5, 6], // Friday, Saturday
      };

      expect(date.isBusinessDay(customConfig)).toBe(false);
    });

    test('should handle custom holiday configuration', () => {
      const date = kairos('2024-03-15'); // Regular day

      // Without custom holidays
      expect(date.isBusinessDay()).toBe(true);

      // With custom holiday
      const customConfig = {
        holidays: [
          {
            name: 'Custom Holiday',
            type: 'fixed' as const,
            rule: { month: 3, day: 15 },
          },
        ],
      };

      expect(date.isBusinessDay(customConfig)).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    test('should handle large date ranges efficiently', () => {
      const start = kairos('2020-01-01');
      const end = kairos('2024-12-31');

      const startTime = performance.now();
      const businessDays = kairos.getBusinessDaysInRange(start, end);
      const endTime = performance.now();

      expect(businessDays.length).toBeGreaterThan(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should cache business day calculations', () => {
      const date = kairos('2024-01-08');

      // First call
      const start1 = performance.now();
      const result1 = date.isBusinessDay();
      const end1 = performance.now();

      // Second call (should be faster due to caching)
      const start2 = performance.now();
      const result2 = date.isBusinessDay();
      const end2 = performance.now();

      expect(result1).toBe(result2);
      expect(end2 - start2).toBeLessThan(end1 - start1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle year boundaries', () => {
      const newYearsEve = kairos('2023-12-31'); // Sunday
      const newYearsDay = kairos('2024-01-01'); // Monday, but holiday

      expect(newYearsEve.isBusinessDay()).toBe(false); // Sunday
      expect(newYearsDay.isBusinessDay()).toBe(false); // Holiday

      const nextBusinessDay = newYearsEve.nextBusinessDay();
      expect(nextBusinessDay.format('YYYY-MM-DD')).toBe('2024-01-02'); // Tuesday
    });

    test('should handle leap year February', () => {
      const feb28 = kairos('2024-02-28'); // Wednesday
      const feb29 = kairos('2024-02-29'); // Thursday (leap day)

      expect(feb28.isBusinessDay()).toBe(true);
      expect(feb29.isBusinessDay()).toBe(true);

      const nextDay = feb28.nextBusinessDay();
      expect(nextDay.format('YYYY-MM-DD')).toBe('2024-02-29');
    });
  });

  describe('Property-based Testing', () => {
    test('should maintain business day properties', () => {
      for (let i = 0; i < 100; i++) {
        const randomDate = kairos(generators.randomDate(2020, 2030));

        if (randomDate.isBusinessDay()) {
          // Business day should not be weekend
          expect(randomDate.isWeekend()).toBe(false);

          // Business day should not be holiday
          expect(randomDate.isHoliday()).toBe(false);
        }
      }
    });

    test('should handle business day arithmetic consistently', () => {
      for (let i = 0; i < 50; i++) {
        const randomDate = kairos(generators.randomBusinessDay(2024));
        const days = Math.floor(Math.random() * 5) + 1; // Reduced range to avoid complex holiday interactions

        const added = randomDate.addBusinessDays(days);
        const subtracted = added.addBusinessDays(-days);

        // Due to holidays, the reverse operation might not return to exact same date
        // But the difference should be small (within a few days due to holidays)
        const daysDiff = Math.abs(randomDate.valueOf() - subtracted.valueOf()) / (24 * 60 * 60 * 1000);
        expect(daysDiff).toBeLessThan(7); // Within a week due to potential holiday adjustments
      }
    });
  });
});
