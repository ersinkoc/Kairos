/**
 * Parsing and Validation
 * Various parsing strategies and date validation
 */

const kairos = require('../dist/index.js');

// Load parsing plugins
const isoParser = require('../dist/plugins/parse/iso').default;
const rfcParser = require('../dist/plugins/parse/rfc2822').default;
const unixParser = require('../dist/plugins/parse/unix').default;
const flexibleParser = require('../dist/plugins/parse/flexible').default;

kairos.use(isoParser);
kairos.use(rfcParser);
kairos.use(unixParser);
kairos.use(flexibleParser);

console.log('=== PARSING & VALIDATION ===\n');

// ISO 8601 parsing
console.log('[ ISO 8601 Parsing ]');
const isoFormats = [
  '2024-06-15',
  '2024-06-15T14:30:00',
  '2024-06-15T14:30:00.123',
  '2024-06-15T14:30:00Z',
  '2024-06-15T14:30:00+05:00',
  '2024-06-15T14:30:00-08:00',
  '20240615T143000Z'
];

isoFormats.forEach(format => {
  const parsed = kairos(format);
  console.log(`"${format}" ->`, parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : 'Invalid');
});

// RFC 2822 parsing
console.log('\n[ RFC 2822 Parsing ]');
const rfcFormats = [
  'Mon, 15 Jun 2024 14:30:00 GMT',
  'Mon, 15 Jun 2024 14:30:00 +0000',
  '15 Jun 2024 14:30:00 GMT',
  'Mon, 15 Jun 24 14:30:00 GMT'
];

rfcFormats.forEach(format => {
  const parsed = kairos(format);
  console.log(`"${format}" ->`, parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : 'Invalid');
});

// Unix timestamp parsing
console.log('\n[ Unix Timestamp Parsing ]');
const timestamps = [
  1718460600000,      // Milliseconds
  1718460600,         // Seconds
  '1718460600000',    // String milliseconds
  '1718460600'        // String seconds
];

timestamps.forEach(ts => {
  const parsed = kairos(ts);
  console.log(`${ts} ->`, parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : 'Invalid');
});

// Flexible parsing
console.log('\n[ Flexible Parsing ]');
const flexibleFormats = [
  '2024-06-15',
  '06/15/2024',
  '15/06/2024',
  '15.06.2024',
  'June 15, 2024',
  '15 June 2024',
  '2024-06-15 14:30',
  '2024-06-15 2:30 PM',
  'Saturday, June 15, 2024'
];

flexibleFormats.forEach(format => {
  const parsed = kairos(format);
  console.log(`"${format}" ->`, parsed.isValid() ? parsed.format('YYYY-MM-DD') : 'Invalid');
});

// Validation checks
console.log('\n[ Validation Checks ]');
const validationTests = [
  { input: '2024-06-15', description: 'Valid ISO date' },
  { input: '2024-13-01', description: 'Invalid month (13)' },
  { input: '2024-02-30', description: 'Invalid day (Feb 30)' },
  { input: '2024-00-15', description: 'Invalid month (0)' },
  { input: '2024-06-32', description: 'Invalid day (32)' },
  { input: 'not a date', description: 'Invalid string' },
  { input: null, description: 'Null input' },
  { input: undefined, description: 'Undefined input' },
  { input: '', description: 'Empty string' },
  { input: '2024-02-29', description: 'Leap year date' },
  { input: '2023-02-29', description: 'Invalid leap year' }
];

validationTests.forEach(test => {
  const parsed = kairos(test.input);
  console.log(`${test.description}: "${test.input}" ->`, parsed.isValid() ? 'Valid' : 'Invalid');
});

// Strict parsing
console.log('\n[ Strict vs Lenient Parsing ]');
const strictTests = [
  '2024-6-15',       // Missing leading zeros
  '2024/06/15',      // Different separator
  '24-06-15',        // Two-digit year
  '2024-Jun-15',     // Month name
];

strictTests.forEach(format => {
  const parsed = kairos(format);
  console.log(`"${format}" ->`, parsed.isValid() ? `Parsed as ${parsed.format('YYYY-MM-DD')}` : 'Invalid');
});

// Array and object parsing
console.log('\n[ Array and Object Parsing ]');

// Array format: [year, month (0-indexed), day, hour, minute, second, millisecond]
const fromArray = kairos([2024, 5, 15, 14, 30, 45, 123]);
console.log('From array [2024, 5, 15, 14, 30, 45, 123]:', fromArray.format('YYYY-MM-DD HH:mm:ss.SSS'));

// Object format
const fromObject = kairos({
  year: 2024,
  month: 6,    // 1-indexed in object format
  day: 15,
  hour: 14,
  minute: 30,
  second: 45,
  millisecond: 123
});
console.log('From object:', fromObject.format('YYYY-MM-DD HH:mm:ss.SSS'));

// Partial object
const partial = kairos({ year: 2024, month: 6 });
console.log('Partial object (year & month):', partial.format('YYYY-MM-DD HH:mm:ss'));

// Custom parsing with format hints
console.log('\n[ Format Detection ]');
const ambiguous = [
  '01/02/2024',  // Could be Jan 2 or Feb 1
  '12/31/2024',  // Clearly Dec 31 (month can't be 31)
  '13/01/2024',  // Clearly Jan 13 (month can't be 13)
];

ambiguous.forEach(date => {
  const parsed = kairos(date);
  console.log(`"${date}" parsed as:`, parsed.isValid() ? parsed.format('MMMM D, YYYY') : 'Invalid');
});

// Error handling
console.log('\n[ Error Handling ]');
const handleParsing = (input) => {
  try {
    const date = kairos(input);
    if (date.isValid()) {
      return date.format('YYYY-MM-DD');
    } else {
      return 'Invalid date';
    }
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

console.log('Valid input:', handleParsing('2024-06-15'));
console.log('Invalid input:', handleParsing('invalid'));
console.log('Null input:', handleParsing(null));

// Common pitfalls
console.log('\n[ Common Pitfalls ]');
const pitfalls = [
  { input: '2024-1-1', note: 'Missing padding' },
  { input: '2024.06.15', note: 'Dot separator' },
  { input: '15-06-2024', note: 'DD-MM-YYYY format' },
  { input: '2024-06-15T14:30', note: 'Missing seconds' },
  { input: '2024-06-15 14:30:00.000Z', note: 'Space before timezone' }
];

pitfalls.forEach(test => {
  const parsed = kairos(test.input);
  console.log(`"${test.input}" (${test.note}):`, parsed.isValid() ? 'Valid' : 'Invalid');
});

// Validation methods
console.log('\n[ Validation Methods ]');
const testDate = kairos('2024-06-15');
const invalidDate = kairos('invalid');

console.log('Valid date checks:');
console.log('  isValid():', testDate.isValid());
console.log('  valueOf():', testDate.valueOf());
console.log('  toDate():', testDate.toDate());

console.log('\nInvalid date checks:');
console.log('  isValid():', invalidDate.isValid());
console.log('  valueOf():', invalidDate.valueOf());
console.log('  toString():', invalidDate.toString());