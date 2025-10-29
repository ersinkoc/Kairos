# Date Formatting

Advanced date formatting options

## Example

```typescript
import kairos from '@oxog/kairos';

const date = kairos('2024-06-15T14:30:45');

// Standard formats
console.log(date.format('YYYY-MM-DD'));           // 2024-06-15
console.log(date.format('YYYY/MM/DD HH:mm:ss'));  // 2024/06/15 14:30:45
console.log(date.format('MMMM Do, YYYY'));        // June 15th, 2024

// Time formats
console.log(date.format('HH:mm:ss'));             // 14:30:45
console.log(date.format('h:mm A'));               // 2:30 PM
console.log(date.format('hh:mm:ss A'));           // 02:30:45 PM

// Custom formats
console.log(date.format('[Week] W of YYYY'));     // Week 24 of 2024
console.log(date.format('DDDo [day of the year]')); // 167th day of the year

// Ordinal numbers
console.log(date.format('Do'));                   // 15th
console.log(date.format('Mo'));                   // 6th (month)

// Quarter information
console.log(date.format('Qo [quarter]'));         // 2nd quarter
console.log(date.format('YYYY [Q]Q'));            // 2024 Q2

// ISO formats
console.log(date.format('YYYY-MM-DDTHH:mm:ssZ')); // 2024-06-15T14:30:45Z
console.log(date.toISOString());                  // ISO string
console.log(date.toJSON());                       // JSON format
```

