/**
 * Timezone and UTC Operations
 * Working with timezones and UTC conversions
 */

const kairos = require('../dist/index.js');
const timezonePlugin = require('../dist/plugins/timezone/timezone').default;

// Load timezone plugin
kairos.use(timezonePlugin);

console.log('=== TIMEZONE & UTC ===\n');

// Local vs UTC
console.log('[ Local vs UTC ]');
const localTime = kairos();
const utcTime = localTime.utc();

console.log('Local time:', localTime.format('YYYY-MM-DD HH:mm:ss'));
console.log('UTC time:', utcTime.format('YYYY-MM-DD HH:mm:ss'));
console.log('Timezone offset (minutes):', localTime.utcOffset());
console.log('Timezone offset (hours):', localTime.utcOffset() / 60);

// Creating UTC dates
console.log('\n[ Creating UTC Dates ]');
const utcNoon = kairos.utc('2024-06-15 12:00:00');
const localNoon = kairos('2024-06-15 12:00:00');

console.log('UTC noon:', utcNoon.format('YYYY-MM-DD HH:mm:ss [UTC]'));
console.log('Local noon:', localNoon.format('YYYY-MM-DD HH:mm:ss [Local]'));
console.log('Are they same moment?:', utcNoon.isSame(localNoon));

// Converting between local and UTC
console.log('\n[ Converting Local <-> UTC ]');
const localEvent = kairos('2024-06-15 14:30:00');
console.log('Local event:', localEvent.format('YYYY-MM-DD HH:mm:ss'));
console.log('As UTC:', localEvent.utc().format('YYYY-MM-DD HH:mm:ss [UTC]'));
console.log('Back to local:', localEvent.utc().local().format('YYYY-MM-DD HH:mm:ss'));

// UTC mode operations
console.log('\n[ UTC Mode Operations ]');
const utcDate = kairos.utc('2024-06-15 00:00:00');
console.log('UTC date:', utcDate.format('YYYY-MM-DD HH:mm:ss'));
console.log('Add 5 hours:', utcDate.add(5, 'hours').format('YYYY-MM-DD HH:mm:ss'));
console.log('Still in UTC mode:', utcDate.isUTC());

// Timezone offset manipulation
console.log('\n[ Timezone Offsets ]');
const baseTime = kairos('2024-06-15 12:00:00');
const offset = baseTime.utcOffset();

console.log('Base time:', baseTime.format('YYYY-MM-DD HH:mm:ss'));
console.log('Current offset:', offset, 'minutes');
console.log('As hours:', offset / 60, 'hours');

// Different offset example
const differentOffset = baseTime.clone().utcOffset(-300); // EST (UTC-5)
console.log('With -5 hours offset:', differentOffset.format('YYYY-MM-DD HH:mm:ss'));

// ISO string with timezone
console.log('\n[ ISO Strings ]');
const localIso = kairos('2024-06-15 14:30:00');
const utcIso = kairos.utc('2024-06-15 14:30:00');

console.log('Local ISO:', localIso.toISOString());
console.log('UTC ISO:', utcIso.toISOString());
console.log('Local formatted:', localIso.format('YYYY-MM-DDTHH:mm:ss.SSSZ'));

// Unix timestamps (always UTC)
console.log('\n[ Unix Timestamps ]');
const timestamp = Date.now();
const fromTimestamp = kairos(timestamp);
const fromTimestampUtc = kairos.utc(timestamp);

console.log('Timestamp:', timestamp);
console.log('Local from timestamp:', fromTimestamp.format('YYYY-MM-DD HH:mm:ss'));
console.log('UTC from timestamp:', fromTimestampUtc.format('YYYY-MM-DD HH:mm:ss'));
console.log('Both have same valueOf():', fromTimestamp.valueOf() === fromTimestampUtc.valueOf());

// Daylight Saving Time considerations
console.log('\n[ DST Considerations ]');
const beforeDST = kairos('2024-03-09 12:00:00'); // Before DST (in US)
const afterDST = kairos('2024-03-11 12:00:00');  // After DST (in US)

console.log('Before DST:', beforeDST.format('YYYY-MM-DD HH:mm:ss'));
console.log('UTC offset:', beforeDST.utcOffset(), 'minutes');
console.log('After DST:', afterDST.format('YYYY-MM-DD HH:mm:ss'));
console.log('UTC offset:', afterDST.utcOffset(), 'minutes');

// Scheduling across timezones
console.log('\n[ Cross-Timezone Scheduling ]');
const meetingUTC = kairos.utc('2024-06-15 15:00:00'); // 3 PM UTC
console.log('Meeting time (UTC):', meetingUTC.format('HH:mm [UTC]'));

// Convert to different "timezones" (using offset)
const newYork = meetingUTC.clone().utcOffset(-240); // EDT (UTC-4)
const london = meetingUTC.clone().utcOffset(60);    // BST (UTC+1)
const tokyo = meetingUTC.clone().utcOffset(540);    // JST (UTC+9)

console.log('New York (EDT):', newYork.format('HH:mm [EDT]'));
console.log('London (BST):', london.format('HH:mm [BST]'));
console.log('Tokyo (JST):', tokyo.format('HH:mm [JST]'));

// Server timestamps
console.log('\n[ Server Timestamps ]');
const serverTime = kairos.utc(); // Always store in UTC
const clientDisplay = serverTime.local(); // Convert for display

console.log('Server stores:', serverTime.format('YYYY-MM-DD HH:mm:ss [UTC]'));
console.log('Client sees:', clientDisplay.format('YYYY-MM-DD HH:mm:ss [Local]'));
console.log('Database value:', serverTime.valueOf());

// UTC start/end of day
console.log('\n[ UTC Day Boundaries ]');
const utcDay = kairos.utc('2024-06-15 14:30:00');
console.log('UTC time:', utcDay.format('YYYY-MM-DD HH:mm:ss'));
console.log('Start of UTC day:', utcDay.startOf('day').format('YYYY-MM-DD HH:mm:ss [UTC]'));
console.log('End of UTC day:', utcDay.endOf('day').format('YYYY-MM-DD HH:mm:ss [UTC]'));

// Comparing across timezones
console.log('\n[ Timezone Comparisons ]');
const utcEvent = kairos.utc('2024-06-15 12:00:00');
const localEvent2 = kairos('2024-06-15 12:00:00');

console.log('UTC event:', utcEvent.format('YYYY-MM-DD HH:mm:ss [UTC]'));
console.log('Local event:', localEvent2.format('YYYY-MM-DD HH:mm:ss [Local]'));
console.log('Same wall time:', utcEvent.format('HH:mm') === localEvent2.format('HH:mm'));
console.log('Same moment:', utcEvent.valueOf() === localEvent2.valueOf());

// Best practices
console.log('\n[ Best Practices ]');
console.log('1. Store in UTC:', kairos.utc().toISOString());
console.log('2. Display in local:', kairos.utc().local().format('YYYY-MM-DD HH:mm:ss'));
console.log('3. Use ISO for APIs:', kairos().toISOString());
console.log('4. Use Unix for sorting:', kairos().valueOf());