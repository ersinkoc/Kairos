# Troubleshooting

## Common Issues

### Invalid Dates

```typescript
const date = kairos('2024-02-30'); // Invalid February date
console.log(date.isValid()); // false
console.log(date.getErrors()); // ['Invalid day: 30 for month: 1']
```

### Plugin Not Found

```typescript
// Check if plugin is loaded
if (!kairos.isPluginLoaded('business')) {
  console.log('Business plugin not loaded');
}
```

### Timezone Issues

```typescript
// Always specify timezone when needed
const date = kairos('2024-06-15', { timezone: 'UTC' });
```

## Performance Issues

### Slow Date Operations

1. Cache frequently used dates
2. Avoid creating many instances in loops
3. Use appropriate format tokens

### Memory Leaks

1. Don't store date instances unnecessarily
2. Clear caches when appropriate
3. Use weak references for large datasets

## Browser Compatibility

Kairos supports all modern browsers. For older browsers:

```javascript
// Include polyfills if needed
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

## Getting Help

- Check the [API Reference](../api/README.md)
- Browse [Examples](../examples/README.md)
- Open an issue on GitHub
- Join our Discord community
