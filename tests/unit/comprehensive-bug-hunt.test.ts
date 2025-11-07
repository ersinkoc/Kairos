/**
 * Comprehensive Bug Hunt - New Bugs Found
 * Tests for bugs discovered during systematic code review
 */

import kairos from '../../src/index.js';
import { DateRange } from '../../src/plugins/range/range.js';
import { TimezoneManager } from '../../src/plugins/timezone/timezone.js';
import calendarPlugin from '../../src/plugins/calendar/calendar.js';

// Load calendar plugin for dayOfYear tests
kairos.use(calendarPlugin);

describe('Comprehensive Bug Hunt - New Bugs', () => {
  describe('Bug 22: DateRange chunk() with invalid size parameter', () => {
    it('should throw error for size of 0', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-10');
      const range = new DateRange(start, end, 'day', 1);

      // Should throw an error for invalid size
      expect(() => {
        range.chunk(0);
      }).toThrow('Chunk size must be a positive integer');
    });

    it('should throw error for negative size', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-10');
      const range = new DateRange(start, end, 'day', 1);

      // Should throw an error for invalid size
      expect(() => {
        range.chunk(-5);
      }).toThrow('Chunk size must be a positive integer');
    });

    it('should handle positive size correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-10');
      const range = new DateRange(start, end, 'day', 1);

      const chunks = range.chunk(3);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks.length).toBeLessThanOrEqual(4); // 10 days / 3 = 3.33, so 4 chunks
    });
  });

  describe('Bug 23: Calendar dayOfYear() setter creates invalid dates', () => {
    it('should handle dayOfYear values that exceed current month days', () => {
      const date = kairos('2024-01-15');

      // Setting day of year to 40 should result in February 9
      // Jan has 31 days, so day 40 = Feb 9
      const newDate = date.dayOfYear(40);

      expect(newDate.month()).toBe(2); // February
      expect(newDate.date()).toBe(9);  // 9th day
    });

    it('should handle dayOfYear for leap years correctly', () => {
      const date = kairos('2024-01-01');

      // Day 366 in a leap year should be Dec 31
      const lastDay = date.dayOfYear(366);

      expect(lastDay.month()).toBe(12); // December
      expect(lastDay.date()).toBe(31);  // 31st
      expect(lastDay.year()).toBe(2024);
    });

    it('should handle dayOfYear values at year boundaries', () => {
      const date = kairos('2024-06-15');

      // Day 1 should be January 1
      const firstDay = date.dayOfYear(1);

      expect(firstDay.month()).toBe(1); // January
      expect(firstDay.date()).toBe(1);  // 1st
      expect(firstDay.year()).toBe(2024);
    });
  });

  describe('Bug 24: TimezoneManager normalizeTimezone() with null/undefined', () => {
    it('should handle undefined timezone gracefully and return UTC', () => {
      const result = TimezoneManager.normalizeTimezone(undefined as any);
      expect(result).toBe('UTC');
    });

    it('should handle null timezone gracefully and return UTC', () => {
      const result = TimezoneManager.normalizeTimezone(null as any);
      expect(result).toBe('UTC');
    });

    it('should handle empty string timezone and return UTC', () => {
      const result = TimezoneManager.normalizeTimezone('');
      expect(result).toBe('UTC');
    });

    it('should normalize known timezones correctly', () => {
      expect(TimezoneManager.normalizeTimezone('EST')).toBe('America/New_York');
      expect(TimezoneManager.normalizeTimezone('PST')).toBe('America/Los_Angeles');
      expect(TimezoneManager.normalizeTimezone('UTC')).toBe('UTC');
    });
  });
});
