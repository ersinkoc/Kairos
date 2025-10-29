# Plugin System

Working with the plugin architecture

## Example

```typescript
import kairos from '@oxog/kairos';
import businessDaysPlugin from '@oxog/kairos/plugins/business';
import holidayPlugin from '@oxog/kairos/plugins/holiday';
import localePlugin from '@oxog/kairos/plugins/locale/en-US';

// Load plugins
kairos.use(businessDaysPlugin);
kairos.use(holidayPlugin);
kairos.use(localePlugin);

// Now you can use plugin features
const date = kairos('2024-06-15');

// Business day calculations
console.log(date.isBusinessDay());    // false (Saturday)
console.log(date.addBusinessDays(5)); // Add 5 business days

// Holiday checks
console.log(date.isHoliday());        // Check if it's a holiday

// Get holidays for a year
const holidays = kairos.getHolidays(2024);
console.log(holidays);

// Locale-specific formatting
kairos.locale('en-US');
console.log(date.format('MMMM Do, YYYY')); // June 15th, 2024
```

