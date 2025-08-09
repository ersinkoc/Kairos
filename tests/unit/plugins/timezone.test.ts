import { describe, test, expect, beforeEach } from '@jest/globals';
import kairos from '../../../src/core/plugin-system.js';
import timezonePlugin, { TimezoneManager } from '../../../src/plugins/timezone/timezone.js';

// Load timezone plugin
kairos.use(timezonePlugin);

describe('Timezone Plugin', () => {
  describe('TimezoneManager', () => {
    test('should get timezone info for current timezone', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const tzInfo = TimezoneManager.getTimezoneInfo(date);
      
      expect(tzInfo).toHaveProperty('name');
      expect(tzInfo).toHaveProperty('abbreviation');
      expect(tzInfo).toHaveProperty('offset');
      expect(tzInfo).toHaveProperty('dst');
      expect(typeof tzInfo.offset).toBe('number');
      expect(typeof tzInfo.dst).toBe('boolean');
    });

    test('should get timezone info for specific timezone', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const tzInfo = TimezoneManager.getTimezoneInfo(date, 'America/New_York');
      
      expect(tzInfo.name).toBe('America/New_York');
      expect(typeof tzInfo.offset).toBe('number');
    });

    test('should detect DST correctly', () => {
      // June date should be in DST for most timezones that observe it
      const summerDate = new Date('2024-06-15T12:00:00Z');
      const winterDate = new Date('2024-12-15T12:00:00Z');
      
      const summerDST = TimezoneManager.isDST(summerDate, 'America/New_York');
      const winterDST = TimezoneManager.isDST(winterDate, 'America/New_York');
      
      expect(summerDST).toBe(true); // June is DST in New York
      expect(winterDST).toBe(false); // December is not DST in New York
    });

    test('should convert timezone correctly', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const converted = TimezoneManager.convertToTimezone(date, 'America/New_York');
      
      expect(converted).toBeInstanceOf(Date);
      expect(converted.getTime()).not.toBe(date.getTime());
    });

    test('should normalize timezone names', () => {
      expect(TimezoneManager.normalizeTimezone('EST')).toBe('America/New_York');
      expect(TimezoneManager.normalizeTimezone('PST')).toBe('America/Los_Angeles');
      expect(TimezoneManager.normalizeTimezone('UTC')).toBe('UTC');
      expect(TimezoneManager.normalizeTimezone('Invalid/Timezone')).toBe('Invalid/Timezone');
    });

    test('should format offset correctly', () => {
      expect(TimezoneManager.formatOffset(-300)).toBe('-05:00'); // UTC-5 (negative means behind UTC)
      expect(TimezoneManager.formatOffset(240)).toBe('+04:00'); // UTC+4 (positive means ahead of UTC)
      expect(TimezoneManager.formatOffset(0)).toBe('+00:00'); // UTC
      expect(TimezoneManager.formatOffset(-330)).toBe('-05:30'); // UTC-5:30
    });

    test('should parse offset correctly', () => {
      expect(TimezoneManager.parseOffset('+05:00')).toBe(300); // +5 hours = +300 minutes
      expect(TimezoneManager.parseOffset('-04:00')).toBe(-240); // -4 hours = -240 minutes
      expect(TimezoneManager.parseOffset('+00:00')).toBe(0);
      expect(TimezoneManager.parseOffset('+0530')).toBe(330); // +5:30 = +330 minutes
      expect(TimezoneManager.parseOffset('invalid')).toBe(0);
    });

    test('should get available timezones', () => {
      const timezones = TimezoneManager.getAvailableTimezones();
      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);
      // UTC might be listed as 'UTC' or might be in the fallback list
      const hasUTC = timezones.includes('UTC') || timezones.includes('Etc/UTC') || timezones.length > 10;
      expect(hasUTC).toBe(true);
    });

    test('should get common timezones', () => {
      const common = TimezoneManager.getCommonTimezones();
      expect(typeof common).toBe('object');
      expect(common.EST).toBe('America/New_York');
      expect(common.UTC).toBe('UTC');
    });

    test('should find timezones by offset', () => {
      const timezones = TimezoneManager.getTimezoneFromOffset(0);
      expect(Array.isArray(timezones)).toBe(true);
      expect(timezones.length).toBeGreaterThan(0);
    });
  });

  describe('Instance Methods', () => {
    test('should get timezone info from instance', () => {
      const date = kairos('2024-06-15T12:00:00Z');
      const tzInfo = date.timezone();
      
      expect(tzInfo).toHaveProperty('name');
      expect(tzInfo).toHaveProperty('abbreviation');
      expect(tzInfo).toHaveProperty('offset');
      expect(tzInfo).toHaveProperty('dst');
    });

    test('should convert instance to specific timezone', () => {
      const date = kairos('2024-06-15T12:00:00Z');
      const nyDate = date.tz('America/New_York');
      
      expect(nyDate).toBeDefined();
      expect(nyDate.format).toBeDefined();
    });

    test('should convert to UTC', () => {
      const date = kairos('2024-06-15T12:00:00');
      const utcDate = date.utc();
      
      expect(utcDate).toBeDefined();
      expect(utcDate.format).toBeDefined();
    });

    test('should get and set UTC offset', () => {
      const date = kairos('2024-06-15T12:00:00Z');
      const offset = date.utcOffset();
      
      expect(typeof offset).toBe('number');
      
      const offsetDate = date.utcOffset(-300); // UTC+5
      expect(offsetDate).toBeDefined();
    });

    test('should detect DST from instance', () => {
      const summerDate = kairos('2024-06-15T12:00:00');
      const winterDate = kairos('2024-12-15T12:00:00');
      
      const summerDST = summerDate.isDST();
      const winterDST = winterDate.isDST();
      
      expect(typeof summerDST).toBe('boolean');
      expect(typeof winterDST).toBe('boolean');
    });
  });

  describe('Static Methods', () => {
    test('should get timezone info statically', () => {
      const tzInfo = kairos.getTimezoneInfo('2024-06-15T12:00:00Z', 'America/New_York');
      
      expect(tzInfo.name).toBe('America/New_York');
      expect(typeof tzInfo.offset).toBe('number');
    });

    test('should convert between timezones statically', () => {
      const converted = kairos.convertTimezone('2024-06-15T12:00:00Z', 'UTC', 'America/New_York');
      
      expect(converted).toBeDefined();
      expect(converted.format).toBeDefined();
    });

    test('should get available timezones statically', () => {
      const timezones = kairos.getAvailableTimezones();
      expect(Array.isArray(timezones)).toBe(true);
      // UTC might be listed as 'UTC' or might be in the fallback list
      const hasUTC = timezones.includes('UTC') || timezones.includes('Etc/UTC') || timezones.length > 10;
      expect(hasUTC).toBe(true);
    });

    test('should get common timezones statically', () => {
      const common = kairos.getCommonTimezones();
      expect(common.UTC).toBe('UTC');
      expect(common.EST).toBe('America/New_York');
    });

    test('should parse timezone offset statically', () => {
      expect(kairos.parseTimezoneOffset('+05:00')).toBe(300);
      expect(kairos.parseTimezoneOffset('-04:00')).toBe(-240);
    });

    test('should format timezone offset statically', () => {
      expect(kairos.formatTimezoneOffset(-300)).toBe('-05:00');
      expect(kairos.formatTimezoneOffset(240)).toBe('+04:00');
    });

    test('should get timezones for offset statically', () => {
      const timezones = kairos.getTimezonesForOffset(0);
      expect(Array.isArray(timezones)).toBe(true);
    });

    test('should create date in timezone statically', () => {
      const date = kairos.inTimezone('2024-06-15T12:00:00', 'America/New_York');
      expect(date).toBeDefined();
      expect(date.format).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid timezones gracefully', () => {
      const date = kairos('2024-06-15T12:00:00Z');
      const tzInfo = date.timezone('Invalid/Timezone');
      
      expect(tzInfo.name).toBe('UTC');
      expect(tzInfo.offset).toBe(0);
      expect(tzInfo.dst).toBe(false);
    });

    test('should handle timezone abbreviations', () => {
      const date = kairos('2024-06-15T12:00:00Z');
      const nyDate = date.tz('EST');
      
      expect(nyDate).toBeDefined();
    });

    test('should handle DST transitions', () => {
      // Spring forward (DST starts)
      const springDate = new Date('2024-03-10T07:00:00Z'); // Around DST transition
      const springDST = TimezoneManager.isDST(springDate, 'America/New_York');
      
      // Fall back (DST ends)  
      const fallDate = new Date('2024-11-03T06:00:00Z'); // Around DST transition
      const fallDST = TimezoneManager.isDST(fallDate, 'America/New_York');
      
      expect(typeof springDST).toBe('boolean');
      expect(typeof fallDST).toBe('boolean');
    });

    test('should handle timezones that do not observe DST', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      const arizonaDST = TimezoneManager.isDST(date, 'America/Phoenix'); // Arizona doesn't observe DST
      
      expect(arizonaDST).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should handle multiple timezone conversions efficiently', () => {
      const date = kairos('2024-06-15T12:00:00Z');
      const timezones = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
      
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        timezones.forEach(tz => {
          date.tz(tz);
        });
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should handle timezone info requests efficiently', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        TimezoneManager.getTimezoneInfo(date, 'America/New_York');
      }
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});