// Test Kairos with formats
import kairos from './tests/setup/cross-platform';

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