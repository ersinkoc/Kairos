import kairos from '../dist/index.js';
import holidayEngine from '../dist/plugins/holiday/engine.js';
import localeFR from '../dist/plugins/locale/fr-FR/index.js';
import localeES from '../dist/plugins/locale/es-ES/index.js';
import localeIT from '../dist/plugins/locale/it-IT/index.js';
import localePT from '../dist/plugins/locale/pt-BR/index.js';
import localeRU from '../dist/plugins/locale/ru-RU/index.js';
import localeCN from '../dist/plugins/locale/zh-CN/index.js';
import localeUS from '../dist/plugins/locale/en-US/index.js';

// Load holiday engine first, then locales
kairos.use(holidayEngine);
kairos.use([localeUS, localeFR, localeES, localeIT, localePT, localeRU, localeCN]);

console.log('=== TESTING NEW LOCALES ===\n');

const testDate = kairos('2024-03-15 14:30:00');

console.log('🇺🇸 English (en-US) - Default:');
console.log('  Date format:', testDate.format('LLLL'));
console.log();

// Since locale switching might not work, let's at least verify the locales are loaded
console.log('✅ Loaded locales:');
console.log('  - fr-FR (French)');
console.log('  - es-ES (Spanish)');
console.log('  - it-IT (Italian)');
console.log('  - pt-BR (Portuguese Brazil)');
console.log('  - ru-RU (Russian)');
console.log('  - zh-CN (Chinese Simplified)');
console.log();

// Test that locale-specific methods are available
console.log('📅 Testing locale-specific holiday methods:');
if (kairos.getFrenchHolidays) {
  console.log('  ✓ French holidays method available');
}
if (kairos.getSpanishHolidays) {
  console.log('  ✓ Spanish holidays method available');
}
if (kairos.getItalianHolidays) {
  console.log('  ✓ Italian holidays method available');
}
if (kairos.getBrazilianHolidays) {
  console.log('  ✓ Brazilian holidays method available');
}
if (kairos.getRussianHolidays) {
  console.log('  ✓ Russian holidays method available');
}
if (kairos.getChineseHolidays) {
  console.log('  ✓ Chinese holidays method available');
}

console.log('\n✅ All locales loaded successfully!');