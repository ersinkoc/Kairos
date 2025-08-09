import kairos from '../../../src/index';
import relativeTimePlugin from '../../../src/plugins/relative/relative-time';

describe('RelativeTime Plugin', () => {
  beforeAll(() => {
    kairos.use(relativeTimePlugin);
  });

  describe('fromNow', () => {
    it('should return relative time from now', () => {
      const future = kairos().add(1, 'hour');
      expect(future.fromNow()).toContain('in');
      expect(future.fromNow()).toContain('hour');

      const past = kairos().subtract(1, 'hour');
      expect(past.fromNow()).toContain('ago');
      expect(past.fromNow()).toContain('hour');
    });

    it('should work without suffix', () => {
      const future = kairos().add(1, 'hour');
      expect(future.fromNow(true)).toBe('an hour');

      const past = kairos().subtract(2, 'hours');
      expect(past.fromNow(true)).toBe('2 hours');
    });

    it('should handle various time ranges', () => {
      const tests = [
        { add: 30, unit: 'seconds', expected: 'few seconds' },
        { add: 1, unit: 'minute', expected: 'minute' },
        { add: 5, unit: 'minutes', expected: '5 minutes' },
        { add: 1, unit: 'hour', expected: 'hour' },
        { add: 3, unit: 'hours', expected: '3 hours' },
        { add: 1, unit: 'day', expected: 'day' },
        { add: 3, unit: 'days', expected: '3 days' },
        { add: 1, unit: 'month', expected: 'month' },
        { add: 3, unit: 'months', expected: '3 months' },
        { add: 1, unit: 'year', expected: 'year' },
        { add: 2, unit: 'years', expected: '2 years' },
      ];

      tests.forEach((test) => {
        const result = kairos().add(test.add, test.unit).fromNow(true);
        expect(result).toContain(test.expected);
      });
    });
  });

  describe('toNow', () => {
    it('should return relative time to now', () => {
      const future = kairos().add(1, 'hour');
      expect(future.toNow()).toContain('ago'); // toNow means "from this time to now", so future is ago
      expect(future.toNow()).toContain('hour');

      const past = kairos().subtract(1, 'hour');
      expect(past.toNow()).toContain('in'); // past to now is "in"
      expect(past.toNow()).toContain('hour');
    });
  });

  describe('from', () => {
    it('should return relative time from another date', () => {
      const date1 = kairos('2024-01-01');
      const date2 = kairos('2024-01-02');

      expect(date2.from(date1)).toContain('in');
      expect(date2.from(date1)).toContain('day');

      expect(date1.from(date2)).toContain('ago');
      expect(date1.from(date2)).toContain('day');
    });

    it('should work without suffix', () => {
      const date1 = kairos('2024-01-01');
      const date2 = kairos('2024-01-08');

      expect(date2.from(date1, true)).toBe('7 days');
      expect(date1.from(date2, true)).toBe('7 days');
    });
  });

  describe('to', () => {
    it('should return relative time to another date', () => {
      const date1 = kairos('2024-01-01');
      const date2 = kairos('2024-01-02');

      expect(date1.to(date2)).toContain('in');
      expect(date1.to(date2)).toContain('day');

      expect(date2.to(date1)).toContain('ago');
      expect(date2.to(date1)).toContain('day');
    });
  });

  describe('humanize', () => {
    it('should humanize durations', () => {
      const duration = kairos(3600000); // 1 hour in milliseconds
      expect(duration.humanize()).toBe('an hour');

      const duration2 = kairos(7200000); // 2 hours
      expect(duration2.humanize()).toBe('2 hours');
    });

    it('should work with suffix', () => {
      const duration = kairos(3600000);
      expect(duration.humanize(true)).toContain('in');
    });
  });

  describe('Native Intl.RelativeTimeFormat', () => {
    // Skip these tests if Intl.RelativeTimeFormat is not available
    const hasIntl = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat;

    if (hasIntl) {
      it('should use native formatting when available', () => {
        const future = kairos().add(1, 'day');
        const result = future.fromNowNative('en');
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });

      it('should support different locales', () => {
        const future = kairos().add(1, 'day');

        const resultEn = future.fromNowNative('en');
        expect(resultEn).toBeTruthy();
        expect(typeof resultEn).toBe('string');

        const resultDe = future.fromNowNative('de');
        expect(resultDe).toBeTruthy();
        expect(typeof resultDe).toBe('string');
        // German may return "in 24 Stunden" or "morgen" depending on the implementation
      });

      it('should support formatting options', () => {
        const future = kairos().add(1, 'day');

        const resultLong = future.fromNowNative('en', { style: 'long' });
        const resultShort = future.fromNowNative('en', { style: 'short' });
        const resultNarrow = future.fromNowNative('en', { style: 'narrow' });

        expect(resultLong).toBeTruthy();
        expect(resultShort).toBeTruthy();
        expect(resultNarrow).toBeTruthy();
      });
    }
  });

  describe('Static methods', () => {
    it('should register custom locales', () => {
      const customLocale = {
        future: 'dans %s',
        past: 'il y a %s',
        s: 'quelques secondes',
        m: 'une minute',
        mm: '%d minutes',
        h: 'une heure',
        hh: '%d heures',
        d: 'un jour',
        dd: '%d jours',
        M: 'un mois',
        MM: '%d mois',
        y: 'un an',
        yy: '%d ans',
      };

      kairos.relativeTime.registerLocale('fr', customLocale);
      const locale = kairos.relativeTime.getLocale('fr');
      expect(locale).toEqual(customLocale);
    });

    it('should create calculator instances', () => {
      const calculator = kairos.relativeTime.calculator('en');
      expect(calculator).toBeDefined();

      const result = calculator.format(3600000); // 1 hour in future
      expect(result).toContain('in');
      expect(result).toContain('hour');
    });
  });

  describe('Edge cases', () => {
    it('should handle very small time differences', () => {
      const now = kairos();
      const almostNow = kairos().add(5, 'seconds');

      expect(almostNow.fromNow(true)).toContain('few seconds');
    });

    it('should handle very large time differences', () => {
      const now = kairos();
      const farFuture = kairos().add(100, 'years');

      expect(farFuture.fromNow(true)).toContain('100 years');
    });

    it('should handle negative durations', () => {
      const past = kairos().subtract(1, 'hour');
      expect(past.fromNow()).toContain('ago');
    });
  });
});
