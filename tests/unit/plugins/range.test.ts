import kairos from '../../../src/core/plugin-system';
import rangePlugin from '../../../src/plugins/range/range';
import { DateRange } from '../../../src/plugins/range/range';

describe('Range Plugin', () => {
  beforeAll(() => {
    kairos.use(rangePlugin);
  });

  describe('DateRange Class', () => {
    describe('Construction and Iteration', () => {
      it('should create a date range', () => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 0, 5);
        const range = new DateRange(start, end);

        const dates = range.toArray();
        expect(dates).toHaveLength(5);
        expect(dates[0].getDate()).toBe(1);
        expect(dates[4].getDate()).toBe(5);
      });

      it('should iterate with custom step', () => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 0, 10);
        const range = new DateRange(start, end, 'day', 2);

        const dates = range.toArray();
        expect(dates).toHaveLength(5);
        expect(dates[0].getDate()).toBe(1);
        expect(dates[1].getDate()).toBe(3);
        expect(dates[2].getDate()).toBe(5);
      });

      it('should iterate by different units', () => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 3, 1);
        const range = new DateRange(start, end, 'month');

        const dates = range.toArray();
        expect(dates).toHaveLength(4);
        expect(dates[0].getMonth()).toBe(0);
        expect(dates[3].getMonth()).toBe(3);
      });
    });

    describe('Array Methods', () => {
      let range: DateRange;

      beforeEach(() => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 0, 7);
        range = new DateRange(start, end);
      });

      it('should map over dates', () => {
        const dayNumbers = range.map((date) => date.getDate());
        expect(dayNumbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
      });

      it('should filter dates', () => {
        const weekends = range.filter((date) => {
          const day = date.getDay();
          return day === 0 || day === 6;
        });
        expect(weekends).toHaveLength(2);
      });

      it('should find a date', () => {
        const found = range.find((date) => date.getDate() === 4);
        expect(found).toBeDefined();
        expect(found?.getDate()).toBe(4);
      });

      it('should check if every date matches condition', () => {
        const allInJanuary = range.every((date) => date.getMonth() === 0);
        expect(allInJanuary).toBe(true);
      });

      it('should check if some dates match condition', () => {
        const hasWeekend = range.some((date) => {
          const day = date.getDay();
          return day === 0 || day === 6;
        });
        expect(hasWeekend).toBe(true);
      });

      it('should reduce dates', () => {
        const sum = range.reduce((acc, date) => acc + date.getDate(), 0);
        expect(sum).toBe(28); // 1+2+3+4+5+6+7
      });

      it('should count dates', () => {
        expect(range.count()).toBe(7);
      });
    });

    describe('Specialized Methods', () => {
      it('should get business days', () => {
        const start = new Date(2024, 0, 1); // Monday
        const end = new Date(2024, 0, 14); // Sunday
        const range = new DateRange(start, end);

        const businessDays = range.businessDays();
        expect(businessDays).toHaveLength(10); // 2 weeks = 10 business days
      });

      it('should get weekends', () => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 0, 14);
        const range = new DateRange(start, end);

        const weekends = range.weekends();
        expect(weekends).toHaveLength(4); // 2 Saturdays, 2 Sundays
      });

      it('should get specific weekdays', () => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 0, 31);
        const range = new DateRange(start, end);

        const mondays = range.weekday(1);
        expect(mondays.length).toBeGreaterThan(0);
        mondays.forEach((date) => {
          expect(date.getDay()).toBe(1);
        });
      });

      it('should chunk date ranges', () => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 0, 10);
        const range = new DateRange(start, end);

        const chunks = range.chunk(3);
        expect(chunks).toHaveLength(4);
        expect(chunks[0].count()).toBe(3);
      });
    });

    describe('Range Operations', () => {
      it('should check if ranges overlap', () => {
        const start1 = new Date(2024, 0, 1);
        const end1 = new Date(2024, 0, 10);
        const range1 = new DateRange(start1, end1);

        const start2 = new Date(2024, 0, 5);
        const end2 = new Date(2024, 0, 15);
        const range2 = new DateRange(start2, end2);

        expect(range1.overlaps(range2)).toBe(true);
      });

      it('should check if date is within range', () => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2024, 0, 10);
        const range = new DateRange(start, end);

        const testDate = new Date(2024, 0, 5);
        expect(range.contains(testDate)).toBe(true);

        const outsideDate = new Date(2024, 0, 15);
        expect(range.contains(outsideDate)).toBe(false);
      });

      it('should get intersection of ranges', () => {
        const start1 = new Date(2024, 0, 1);
        const end1 = new Date(2024, 0, 10);
        const range1 = new DateRange(start1, end1);

        const start2 = new Date(2024, 0, 5);
        const end2 = new Date(2024, 0, 15);
        const range2 = new DateRange(start2, end2);

        const intersection = range1.intersection(range2);
        expect(intersection).toBeDefined();
        expect(intersection!.getStart().getDate()).toBe(5);
        expect(intersection!.getEnd().getDate()).toBe(10);
      });

      it('should get union of ranges', () => {
        const start1 = new Date(2024, 0, 1);
        const end1 = new Date(2024, 0, 10);
        const range1 = new DateRange(start1, end1);

        const start2 = new Date(2024, 0, 5);
        const end2 = new Date(2024, 0, 15);
        const range2 = new DateRange(start2, end2);

        const union = range1.union(range2);
        expect(union).toBeDefined();
        expect(union!.getStart().getDate()).toBe(1);
        expect(union!.getEnd().getDate()).toBe(15);
      });
    });
  });

  describe('Kairos Integration', () => {
    it('should create range from kairos instances', () => {
      const start = kairos('2024-01-01');
      const end = kairos('2024-01-05');
      const range = start.range(end);

      expect(range).toBeInstanceOf(DateRange);
      expect(range.count()).toBe(5);
    });

    it('should create range with duration', () => {
      const start = kairos('2024-01-01');
      const range = start.rangeFor(5, 'days');

      expect(range.count()).toBe(6); // Including start date
    });

    it('should iterate business days between dates', () => {
      const start = kairos('2024-01-01'); // Monday
      const end = kairos('2024-01-07'); // Sunday

      const businessDays = start.businessDaysUntil(end);
      expect(businessDays).toHaveLength(5); // Mon-Fri
    });

    it('should get dates in current month', () => {
      const date = kairos('2024-02-15');
      const monthDates = date.datesInMonth();

      expect(monthDates).toHaveLength(29); // 2024 is leap year
      expect(monthDates[0].getDate()).toBe(1);
      expect(monthDates[28].getDate()).toBe(29);
    });

    it('should get dates in current week', () => {
      const date = kairos('2024-01-10'); // Wednesday
      const weekDates = date.datesInWeek();

      expect(weekDates).toHaveLength(7);
      expect(weekDates[0].getDay()).toBe(0); // Sunday
      expect(weekDates[6].getDay()).toBe(6); // Saturday
    });
  });
});
