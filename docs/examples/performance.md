# Performance Tips

Performance optimization techniques

## Example

```typescript
import kairos from '@oxog/kairos';

// Performance tip 1: Cache frequently used dates
const today = kairos(); // Create once, reuse
for (let i = 0; i < 1000; i++) {
  today.format('YYYY-MM-DD'); // Reuse the same instance
}

// Performance tip 2: Use immutable operations efficiently
const dates = [];
let currentDate = kairos('2024-01-01');
for (let i = 0; i < 365; i++) {
  dates.push(currentDate.format('YYYY-MM-DD'));
  currentDate = currentDate.add(1, 'day'); // Chain operations
}

// Performance tip 3: Batch operations when possible
const batchDates = Array.from({ length: 100 }, (_, i) =>
  kairos('2024-01-01').add(i, 'day')
);

// Performance tip 4: Use appropriate format tokens
// Faster
const fastFormat = date.format('YYYY-MM-DD');
// Slower (more complex parsing)
const slowFormat = date.format('dddd, MMMM Do YYYY, h:mm:ss A');

// Performance tip 5: Pre-load plugins once
import businessPlugin from '@oxog/kairos/plugins/business';
kairos.use(businessPlugin); // Load once at startup

// Performance tip 6: Use built-in optimizations
const startDate = kairos('2024-01-01');
const endDate = kairos('2024-12-31');

// Use optimized range operations
const range = startDate.rangeTo(endDate);
const businessDays = range.filter(d => d.isBusinessDay());

// Performance tip 7: Enable performance monitoring
if (process.env.NODE_ENV === 'development') {
  console.time('date-operations');
  // Perform date operations
  console.timeEnd('date-operations');
}
```

