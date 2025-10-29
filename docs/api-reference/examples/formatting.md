# Date Formatting

Various date formatting options

## Example

```typescript
const date = kairos('2024-06-15T14:30:45');

// Standard formats
console.log(date.format('YYYY-MM-DD'));           // 2024-06-15
console.log(date.format('YYYY/MM/DD HH:mm:ss'));  // 2024/06/15 14:30:45
console.log(date.format('MMMM Do, YYYY'));        // June 15th, 2024

// Time formats
console.log(date.format('HH:mm:ss'));             // 14:30:45
console.log(date.format('h:mm A'));               // 2:30 PM

// Custom formats
console.log(date.format('[Week] W of YYYY'));     // Week 24 of 2024
```

