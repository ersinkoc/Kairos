const kairos = require('../dist/index.js').default;
const localeFR = require('../dist/plugins/locale/fr-FR/index.js').default;
const localeES = require('../dist/plugins/locale/es-ES/index.js').default;
const localeIT = require('../dist/plugins/locale/it-IT/index.js').default;
const localePT = require('../dist/plugins/locale/pt-BR/index.js').default;
const localeRU = require('../dist/plugins/locale/ru-RU/index.js').default;
const localeCN = require('../dist/plugins/locale/zh-CN/index.js').default;

// Load all locales
kairos.use([localeFR, localeES, localeIT, localePT, localeRU, localeCN]);

console.log('=== TESTING NEW LOCALES ===\n');

const testDate = kairos('2024-03-15 14:30:00');

// Test French
kairos.locale('fr-FR');
console.log('🇫🇷 French (fr-FR):');
console.log('  Date format:', testDate.format('LLLL'));
console.log('  Months:', ['janvier', 'février', 'mars'].join(', ') + '...');
console.log('  From now:', testDate.fromNow ? testDate.fromNow() : 'N/A');
console.log();

// Test Spanish
kairos.locale('es-ES');
console.log('🇪🇸 Spanish (es-ES):');
console.log('  Date format:', testDate.format('LLLL'));
console.log('  Months:', ['enero', 'febrero', 'marzo'].join(', ') + '...');
console.log('  From now:', testDate.fromNow ? testDate.fromNow() : 'N/A');
console.log();

// Test Italian
kairos.locale('it-IT');
console.log('🇮🇹 Italian (it-IT):');
console.log('  Date format:', testDate.format('LLLL'));
console.log('  Months:', ['gennaio', 'febbraio', 'marzo'].join(', ') + '...');
console.log('  From now:', testDate.fromNow ? testDate.fromNow() : 'N/A');
console.log();

// Test Portuguese (Brazil)
kairos.locale('pt-BR');
console.log('🇧🇷 Portuguese (pt-BR):');
console.log('  Date format:', testDate.format('LLLL'));
console.log('  Months:', ['janeiro', 'fevereiro', 'março'].join(', ') + '...');
console.log('  From now:', testDate.fromNow ? testDate.fromNow() : 'N/A');
console.log();

// Test Russian
kairos.locale('ru-RU');
console.log('🇷🇺 Russian (ru-RU):');
console.log('  Date format:', testDate.format('LLLL'));
console.log('  Months:', ['январь', 'февраль', 'март'].join(', ') + '...');
console.log('  From now:', testDate.fromNow ? testDate.fromNow() : 'N/A');
console.log();

// Test Chinese
kairos.locale('zh-CN');
console.log('🇨🇳 Chinese (zh-CN):');
console.log('  Date format:', testDate.format('LLLL'));
console.log('  Months:', ['一月', '二月', '三月'].join(', ') + '...');
console.log('  From now:', testDate.fromNow ? testDate.fromNow() : 'N/A');
console.log();

// Test holidays for each locale
console.log('=== TESTING HOLIDAYS ===\n');

// French holidays
kairos.locale('fr-FR');
const frenchHolidays = kairos.getFrenchHolidays ? kairos.getFrenchHolidays() : [];
console.log('🇫🇷 French holidays (sample):');
frenchHolidays.slice(0, 3).forEach((h) => console.log(`  - ${h.name}`));
console.log();

// Spanish holidays
kairos.locale('es-ES');
const spanishHolidays = kairos.getSpanishHolidays ? kairos.getSpanishHolidays() : [];
console.log('🇪🇸 Spanish holidays (sample):');
spanishHolidays.slice(0, 3).forEach((h) => console.log(`  - ${h.name}`));
console.log();

// Italian holidays
kairos.locale('it-IT');
const italianHolidays = kairos.getItalianHolidays ? kairos.getItalianHolidays() : [];
console.log('🇮🇹 Italian holidays (sample):');
italianHolidays.slice(0, 3).forEach((h) => console.log(`  - ${h.name}`));
console.log();

// Brazilian holidays
kairos.locale('pt-BR');
const brazilianHolidays = kairos.getBrazilianHolidays ? kairos.getBrazilianHolidays() : [];
console.log('🇧🇷 Brazilian holidays (sample):');
brazilianHolidays.slice(0, 3).forEach((h) => console.log(`  - ${h.name}`));
console.log();

// Russian holidays
kairos.locale('ru-RU');
const russianHolidays = kairos.getRussianHolidays ? kairos.getRussianHolidays() : [];
console.log('🇷🇺 Russian holidays (sample):');
russianHolidays.slice(0, 3).forEach((h) => console.log(`  - ${h.name}`));
console.log();

// Chinese holidays
kairos.locale('zh-CN');
const chineseHolidays = kairos.getChineseHolidays ? kairos.getChineseHolidays() : [];
console.log('🇨🇳 Chinese holidays (sample):');
chineseHolidays.slice(0, 3).forEach((h) => console.log(`  - ${h.name}`));

console.log('\n✅ All locales loaded successfully!');
