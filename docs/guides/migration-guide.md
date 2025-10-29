# Migration Guide

## From Moment.js

Kairos provides a similar API to Moment.js but with modern JavaScript features.

### Date Creation

```typescript
// Moment.js
moment('2024-06-15');

// Kairos
kairos('2024-06-15');
```

### Formatting

```typescript
// Moment.js
moment().format('YYYY-MM-DD');

// Kairos
kairos().format('YYYY-MM-DD');
```

### Manipulation

```typescript
// Moment.js
moment().add(1, 'day');

// Kairos
kairos().add(1, 'day');
```

## From Date-fns

### Function vs Class-based

```typescript
// date-fns
import { format, addDays } from 'date-fns';
format(addDays(new Date(), 1), 'yyyy-MM-dd');

// Kairos
kairos().add(1, 'day').format('YYYY-MM-DD');
```

## From Luxon

```typescript
// Luxon
import { DateTime } from 'luxon';
DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd');

// Kairos
kairos().add(1, 'day').format('YYYY-MM-DD');
```

## Key Differences

1. **Immutable**: All operations return new instances
2. **Plugin-based**: Load only what you need
3. **Zero dependencies**: No external dependencies
4. **Tree shakeable**: Better bundle sizes
