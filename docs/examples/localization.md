# Localization

Working with different locales and formats

## Example

```typescript
import kairos from '@oxog/kairos';
import usLocale from '@oxog/kairos/plugins/locale/en-US';
import turkishLocale from '@oxog/kairos/plugins/locale/tr-TR';
import germanLocale from '@oxog/kairos/plugins/locale/de-DE';

// Load locales
kairos.use(usLocale);
kairos.use(turkishLocale);
kairos.use(germanLocale);

const date = kairos('2024-06-15');

// English (default)
kairos.locale('en-US');
console.log(date.format('MMMM YYYY'));          // June 2024
console.log(date.format('dddd, MMMM Do YYYY')); // Saturday, June 15th 2024

// Turkish
kairos.locale('tr-TR');
console.log(date.format('MMMM YYYY'));          // Haziran 2024
console.log(date.format('dddd, MMMM Do YYYY')); // Cumartesi, Haziran 15 2024

// German
kairos.locale('de-DE');
console.log(date.format('MMMM YYYY'));          // Juni 2024
console.log(date.format('dddd, MMMM Do YYYY')); // Samstag, Juni 15 2024

// Get available locales
console.log(kairos.getAvailableLocales());

// Get current locale
console.log(kairos.getCurrentLocale());
```

