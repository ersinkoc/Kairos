# Business Days

Business day calculations and holidays

## Example

```typescript
import kairos from '@oxog/kairos';
import businessDaysPlugin from '@oxog/kairos/plugins/business';
import holidayPlugin from '@oxog/kairos/plugins/holiday';

kairos.use(businessDaysPlugin);
kairos.use(holidayPlugin);

const date = kairos('2024-06-14'); // Friday

// Check if it's a business day
console.log(date.isBusinessDay()); // true

// Add business days
const nextBusinessDay = date.addBusinessDays(1);
console.log(nextBusinessDay.format('YYYY-MM-DD')); // 2024-06-17 (Monday)

// Add multiple business days
const dueDate = date.addBusinessDays(10);
console.log(dueDate.format('YYYY-MM-DD'));

// Subtract business days
const previousBusinessDay = date.subtractBusinessDays(1);
console.log(previousBusinessDay.format('YYYY-MM-DD')); // 2024-06-13 (Thursday)

// Get business days in a month
const businessDaysInMonth = date.getBusinessDaysInMonth();
console.log(businessDaysInMonth); // Number of business days

// Check holidays
const holidaysInMonth = date.getHolidaysInMonth();
console.log(holidaysInMonth); // Array of holidays in the month
```

