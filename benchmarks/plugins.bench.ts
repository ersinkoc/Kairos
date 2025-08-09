import kairos from '../src/index';
import holidayEngine from '../src/plugins/holiday/engine';
import fixedCalculator from '../src/plugins/holiday/calculators/fixed';
import nthWeekdayCalculator from '../src/plugins/holiday/calculators/nth-weekday';
import businessWorkday from '../src/plugins/business/workday';
import durationPlugin from '../src/plugins/duration/duration';
import rangePlugin from '../src/plugins/range/range';
import { Benchmark } from './core.bench';

// Load plugins
kairos.use([
  holidayEngine,
  fixedCalculator,
  nthWeekdayCalculator,
  businessWorkday,
  durationPlugin,
  rangePlugin
]);

async function runPluginBenchmarks() {
  const bench = new Benchmark();

  // Holiday Engine Benchmarks
  const holidays = [
    { name: 'New Year', type: 'fixed', rule: { month: 1, day: 1 } },
    { name: 'Independence Day', type: 'fixed', rule: { month: 7, day: 4 } },
    { name: 'Christmas', type: 'fixed', rule: { month: 12, day: 25 } },
    { name: 'Thanksgiving', type: 'nth-weekday', rule: { month: 11, weekday: 4, nth: 4 } },
    { name: 'Labor Day', type: 'nth-weekday', rule: { month: 9, weekday: 1, nth: 1 } },
    { name: 'Memorial Day', type: 'nth-weekday', rule: { month: 5, weekday: 1, nth: -1 } }
  ];

  const date = kairos('2024-07-04');
  
  await bench.run('Check if holiday', () => {
    date.isHoliday(holidays);
  }, 10000);

  await bench.run('Get holiday info', () => {
    date.getHolidayInfo(holidays);
  }, 10000);

  await bench.run('Get holidays in year', () => {
    kairos.getHolidaysInYear(2024, holidays);
  }, 1000);

  await bench.run('Get next holiday', () => {
    date.nextHoliday(holidays);
  }, 10000);

  // Business Day Benchmarks
  const businessDate = kairos('2024-01-15');
  
  await bench.run('Is business day', () => {
    businessDate.isBusinessDay();
  }, 50000);

  await bench.run('Next business day', () => {
    businessDate.nextBusinessDay();
  }, 10000);

  await bench.run('Add business days', () => {
    businessDate.addBusinessDays(10);
  }, 10000);

  await bench.run('Business days between', () => {
    businessDate.businessDaysBetween(kairos('2024-02-15'));
  }, 10000);

  await bench.run('Settlement date T+2', () => {
    businessDate.settlementDate(2);
  }, 10000);

  // Duration Benchmarks
  await bench.run('Create duration', () => {
    kairos.duration({ hours: 2, minutes: 30 });
  }, 50000);

  const duration1 = kairos.duration({ days: 1 });
  const duration2 = kairos.duration({ hours: 12 });
  
  await bench.run('Add durations', () => {
    duration1.add(duration2);
  }, 50000);

  await bench.run('Duration humanize', () => {
    duration1.humanize();
  }, 50000);

  await bench.run('Duration to ISO', () => {
    duration1.toISOString();
  }, 50000);

  // Range Benchmarks
  const start = kairos('2024-01-01');
  const end = kairos('2024-01-31');
  
  await bench.run('Create date range', () => {
    start.range(end);
  }, 10000);

  const range = start.range(end);
  
  await bench.run('Range to array', () => {
    range.toArray();
  }, 1000);

  await bench.run('Range business days', () => {
    range.businessDays();
  }, 1000);

  await bench.run('Range filter weekends', () => {
    range.weekends();
  }, 1000);

  await bench.run('Range count', () => {
    range.count();
  }, 10000);

  bench.printResults();
  bench.exportJSON('benchmark-plugins-results.json');
}

// Run if executed directly
if (require.main === module) {
  console.log('Running Kairos Plugin Benchmarks...\n');
  runPluginBenchmarks().catch(console.error);
}

export { runPluginBenchmarks };