/**
 * Formatting and Display
 * Various ways to format and display dates
 */

const kairos = require('../dist/index.js');

console.log('=== FORMATTING & DISPLAY ===\n');

const sampleDate = kairos('2024-09-25 14:30:45.123');

// Standard formats
console.log('[ Standard Formats ]');
console.log('ISO 8601:', sampleDate.toISOString());
console.log('Default:', sampleDate.format());
console.log('Unix ms:', sampleDate.valueOf());

// Date formats
console.log('\n[ Date Formats ]');
console.log('American:', sampleDate.format('MM/DD/YYYY'));
console.log('European:', sampleDate.format('DD.MM.YYYY'));
console.log('ISO Date:', sampleDate.format('YYYY-MM-DD'));
console.log('Compact:', sampleDate.format('YYYYMMDD'));
console.log('Short year:', sampleDate.format('MM/DD/YY'));

// Time formats
console.log('\n[ Time Formats ]');
console.log('24-hour:', sampleDate.format('HH:mm:ss'));
console.log('12-hour:', sampleDate.format('hh:mm:ss A'));
console.log('No seconds:', sampleDate.format('HH:mm'));
console.log('With milliseconds:', sampleDate.format('HH:mm:ss.SSS'));
console.log('Compact time:', sampleDate.format('HHmmss'));

// Combined formats
console.log('\n[ Combined Date-Time ]');
console.log('Full ISO:', sampleDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
console.log('Readable:', sampleDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('US Style:', sampleDate.format('MM/DD/YYYY hh:mm A'));
console.log('Database:', sampleDate.format('YYYY-MM-DD HH:mm:ss.SSS'));

// Text formats
console.log('\n[ Text Formats ]');
console.log('Month name:', sampleDate.format('MMMM'));
console.log('Short month:', sampleDate.format('MMM'));
console.log('Day name:', sampleDate.format('dddd'));
console.log('Short day:', sampleDate.format('ddd'));
console.log('Full text:', sampleDate.format('dddd, MMMM D, YYYY'));

// Special tokens
console.log('\n[ Special Tokens ]');
console.log('Quarter:', sampleDate.format('[Q]Q YYYY'));
console.log('Week of year:', sampleDate.format('[Week] w [of] YYYY'));
console.log('Day of year:', sampleDate.format('[Day] DDD [of] YYYY'));
console.log('Ordinal date:', sampleDate.format('Do [of] MMMM'));

// Custom formats
console.log('\n[ Custom Formats ]');
console.log('Log format:', sampleDate.format('[LOG] YYYY-MM-DD HH:mm:ss.SSS'));
console.log('File name:', sampleDate.format('backup_YYYYMMDD_HHmmss'));
console.log('Human readable:', sampleDate.format('dddd [the] Do [of] MMMM, YYYY [at] h:mm A'));
console.log('Timestamp:', sampleDate.format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]'));

// Locale-specific (if locale plugins loaded)
console.log('\n[ Locale Variations ]');
const months = [];
for (let i = 1; i <= 12; i++) {
  months.push(kairos().month(i).format('MMM'));
}
console.log('Months:', months.join(', '));

const weekdays = [];
for (let i = 0; i < 7; i++) {
  const date = kairos().startOf('week').add(i, 'days');
  weekdays.push(date.format('ddd'));
}
console.log('Weekdays:', weekdays.join(', '));

// Format escaping
console.log('\n[ Escaping Text ]');
console.log('With brackets:', sampleDate.format('[Today is] YYYY-MM-DD'));
console.log('Mixed:', sampleDate.format('YYYY [year,] MM [month,] DD [day]'));
console.log('File prefix:', sampleDate.format('[report_]YYYYMMDD[.pdf]'));

// Padding and zeros
console.log('\n[ Padding Examples ]');
const earlyDate = kairos('2024-01-05 09:05:05');
console.log('With padding:', earlyDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('Month (MM):', earlyDate.format('MM'), 'vs (M):', earlyDate.format('M'));
console.log('Day (DD):', earlyDate.format('DD'), 'vs (D):', earlyDate.format('D'));
console.log('Hour (HH):', earlyDate.format('HH'), 'vs (H):', earlyDate.format('H'));

// Unix timestamps
console.log('\n[ Unix Timestamps ]');
const now = kairos();
console.log('Milliseconds:', now.format('x'));
console.log('Seconds:', now.format('X'));
console.log('Via valueOf():', now.valueOf());
console.log('Via unix():', Math.floor(now.valueOf() / 1000));

// Fractional seconds
console.log('\n[ Fractional Seconds ]');
const precise = kairos('2024-06-15 12:34:56.789');
console.log('Milliseconds (3 digits):', precise.format('SSS'));
console.log('Centiseconds (2 digits):', precise.format('SS'));
console.log('Deciseconds (1 digit):', precise.format('S'));
console.log('Full precision:', precise.format('HH:mm:ss.SSS'));