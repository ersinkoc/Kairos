import kairos from '../../../src/core/plugin-system';
import durationPlugin from '../../../src/plugins/duration/duration';
import { Duration } from '../../../src/plugins/duration/duration';

describe('Duration Plugin', () => {
  beforeAll(() => {
    kairos.use(durationPlugin);
  });

  describe('Duration Class', () => {
    describe('Construction', () => {
      it('should create duration from milliseconds', () => {
        const duration = new Duration(5000);
        expect(duration.asMilliseconds()).toBe(5000);
        expect(duration.asSeconds()).toBe(5);
      });

      it('should create duration from object', () => {
        const duration = new Duration({
          hours: 2,
          minutes: 30,
          seconds: 45,
        });
        expect(duration.asMilliseconds()).toBe(9045000);
      });

      it('should parse ISO 8601 duration string', () => {
        const duration = new Duration('P1Y2M3DT4H5M6S');
        expect(duration.years).toBe(1);
        expect(duration.months).toBe(2);
        expect(duration.days).toBe(3);
        expect(duration.hours).toBe(4);
        expect(duration.minutes).toBe(5);
        expect(duration.seconds).toBe(6);
      });

      it('should parse simple duration strings', () => {
        expect(new Duration('2 hours').asHours()).toBe(2);
        expect(new Duration('30 minutes').asMinutes()).toBe(30);
        expect(new Duration('1 day').asDays()).toBe(1);
        expect(new Duration('3.5 seconds').asSeconds()).toBe(3.5);
      });
    });

    describe('Getters', () => {
      it('should return correct values', () => {
        const duration = new Duration({
          years: 1,
          months: 2,
          days: 3,
          hours: 4,
          minutes: 5,
          seconds: 6,
          milliseconds: 7,
        });

        expect(duration.years).toBe(1);
        expect(duration.months).toBe(2);
        expect(duration.days).toBe(3);
        expect(duration.hours).toBe(4);
        expect(duration.minutes).toBe(5);
        expect(duration.seconds).toBe(6);
        expect(duration.milliseconds).toBe(7);
      });
    });

    describe('Arithmetic', () => {
      it('should add durations', () => {
        const d1 = new Duration({ hours: 2, minutes: 30 });
        const d2 = new Duration({ hours: 1, minutes: 45 });
        const sum = d1.add(d2);

        expect(sum.asHours()).toBeCloseTo(4.25, 2);
      });

      it('should subtract durations', () => {
        const d1 = new Duration({ hours: 3 });
        const d2 = new Duration({ hours: 1, minutes: 30 });
        const diff = d1.subtract(d2);

        expect(diff.asHours()).toBeCloseTo(1.5, 2);
      });

      it('should handle negative durations', () => {
        const d1 = new Duration({ hours: 1 });
        const d2 = new Duration({ hours: 2 });
        const diff = d1.subtract(d2);

        expect(diff.isNegative()).toBe(true);
        expect(diff.asHours()).toBe(-1);
      });
    });

    describe('Comparison', () => {
      it('should compare durations', () => {
        const d1 = new Duration({ hours: 2 });
        const d2 = new Duration({ hours: 1 });
        const d3 = new Duration({ hours: 2 });

        expect(d1.isGreaterThan(d2)).toBe(true);
        expect(d2.isLessThan(d1)).toBe(true);
        expect(d1.equals(d3)).toBe(true);
      });
    });

    describe('Formatting', () => {
      it('should format as ISO 8601 string', () => {
        const duration = new Duration({
          years: 1,
          months: 2,
          days: 3,
          hours: 4,
          minutes: 5,
          seconds: 6,
        });

        expect(duration.toISOString()).toMatch(/^P\d+Y\d+M\d+DT\d+H\d+M[\d.]+S$/);
      });

      it('should humanize duration', () => {
        const duration = new Duration({
          hours: 2,
          minutes: 30,
          seconds: 45,
        });

        const humanized = duration.humanize();
        expect(humanized).toContain('2 hours');
        expect(humanized).toContain('30 minutes');
        expect(humanized).toContain('45 seconds');
      });

      it('should humanize with largest units', () => {
        const duration = new Duration({
          days: 2,
          hours: 12,
          minutes: 30,
        });

        const humanized = duration.humanize(2);
        expect(humanized).toContain('2 days');
        expect(humanized).toContain('12 hours');
        expect(humanized).not.toContain('30 minutes');
      });
    });
  });

  describe('Kairos Integration', () => {
    it('should add duration methods to kairos instances', () => {
      const date = kairos('2024-01-01');
      const duration = date.duration('2024-01-02');

      expect(duration).toBeInstanceOf(Duration);
      expect(duration.asDays()).toBe(1);
    });

    it('should calculate duration since', () => {
      const past = kairos().subtract(2, 'hours');
      const duration = past.durationSince();

      expect(duration.asHours()).toBeCloseTo(2, 0);
    });

    it('should calculate duration until', () => {
      const future = kairos().add(3, 'days');
      const duration = future.durationUntil();

      expect(duration.asDays()).toBeCloseTo(3, 0);
    });

    it('should add duration to date', () => {
      const date = kairos('2024-01-01');
      const duration = new Duration({ days: 5, hours: 12 });
      const result = date.addDuration(duration);

      expect(result.date()).toBe(6);
      expect(result.hour()).toBe(12);
    });

    it('should subtract duration from date', () => {
      const date = kairos('2024-01-10');
      const duration = new Duration({ days: 3 });
      const result = date.subtractDuration(duration);

      expect(result.date()).toBe(7);
    });
  });
});
