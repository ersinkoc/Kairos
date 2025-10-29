# Best Practices

## Performance

### Cache Date Instances

```typescript
// Good
const today = kairos();
for (let i = 0; i < 1000; i++) {
  processDate(today);
}

// Bad
for (let i = 0; i < 1000; i++) {
  processDate(kairos()); // Creates new instance each time
}
```

### Chain Operations

```typescript
// Good
const result = date.add(1, 'day').format('YYYY-MM-DD');

// Bad
const temp = date.add(1, 'day');
const result = temp.format('YYYY-MM-DD');
```

## Error Handling

```typescript
// Always validate input
const date = kairos(userInput);
if (!date.isValid()) {
  console.error('Invalid date:', date.getErrors());
  return;
}
```

## Plugin Usage

### Load Plugins Once

```typescript
// At application startup
import businessPlugin from '@oxog/kairos/plugins/business';
kairos.use(businessPlugin);
```

### Check Plugin Availability

```typescript
if (kairos.isPluginLoaded('business')) {
  const businessDays = date.getBusinessDaysInMonth();
}
```

## Internationalization

### Set Default Locale

```typescript
import usLocale from '@oxog/kairos/plugins/locale/en-US';
kairos.use(usLocale);
kairos.locale('en-US');
```

### Handle Missing Translations

```typescript
try {
  const localized = date.format('MMMM');
} catch (error) {
  // Fallback to English
  const fallback = date.format('MM');
}
```
