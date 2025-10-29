# Date Manipulation

Adding, subtracting, and manipulating dates

## Example

```typescript
const date = kairos('2024-06-15');

// Add different units
const results = {
  tomorrow: date.add(1, 'day'),
  nextWeek: date.add(1, 'week'),
  nextMonth: date.add(1, 'month'),
  nextYear: date.add(1, 'year')
};

// Chain operations
const complex = date
  .add(1, 'month')
  .subtract(2, 'days')
  .add(3, 'hours');

console.log(results.tomorrow.format('YYYY-MM-DD'));
console.log(complex.format('YYYY-MM-DD HH:mm'));
```

