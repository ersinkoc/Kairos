// Load the built library
const path = require('path');
process.chdir('D:/AI_Development/Kairos');

// Manually test date formats
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
  const date = new Date(format);
  const valid = !isNaN(date.getTime());
  console.log(`${format.padEnd(30)} => Valid: ${valid}, Year: ${date.getFullYear()}, Month: ${date.getMonth() + 1}, Date: ${date.getDate()}`);
});