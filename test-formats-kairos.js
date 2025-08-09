// Test Kairos with formats
const path = require('path');
process.chdir('D:/AI_Development/Kairos');

// Import test setup
const kairos = require('./tests/setup/cross-platform').default;

const formats = [
  '2024-03-15',
  '2024/03/15',
  '03-15-2024',
  '03/15/2024',
  '15.03.2024',
  '15-Mar-2024',
  'March 15, 2024',
  '2024-03-15T10:30:45',
  '2024-03-15T10:30:45Z',
  '2024-03-15T10:30:45+00:00',
];

formats.forEach(format => {
  const date = kairos(format);
  const valid = date.isValid();
  console.log(`${format.padEnd(30)} => Valid: ${valid}`);
  if (!valid) {
    console.log(`  Failed for: ${format}`);
  }
});