# Comprehensive Bug Hunt Report
**Date:** 2025-11-06
**Repository:** Kairos Date/Time Library
**Total Bugs Found:** 6

---

## Bug #1: Dead Code in Unix Timestamp Parser
**File:** `src/plugins/parse/unix.ts`
**Lines:** 54-64
**Severity:** Medium

### Description
The year range validation fallback contains unreachable code. When a timestamp is treated as seconds (< 10^10) and results in a year outside 1970-2100, the code attempts to reinterpret it as milliseconds only if `timestamp > 10^12`. However, if the timestamp was < 10^10 (treated as seconds), it can never be > 10^12, making this fallback dead code.

### Current Code
```typescript
if (year < 1970 || year >= 2100) {
  // Try alternative interpretation
  if (timestamp > 1000000000000) {
    // Maybe it's milliseconds
    date = new Date(timestamp);
    // ...
  } else {
    return null;
  }
}
```

### Impact
Timestamps that should potentially be reinterpreted are immediately rejected.

### Proposed Fix
Remove the dead code since the fallback logic is flawed. The initial interpretation logic is sufficient.

---

## Bug #2: Weekend Customization Ignored in Holiday Engine
**File:** `src/plugins/holiday/engine.ts`
**Line:** 72
**Severity:** Medium

### Description
The `applyObservedRules` method always treats days 0 (Sunday) and 6 (Saturday) as weekends, even when `observedRule.weekends` is explicitly set to different days. This prevents customization of weekend days for different locales/regions.

### Current Code
```typescript
const isWeekend = observedRule.weekends?.includes(weekday) || weekday === 0 || weekday === 6;
```

### Impact
Users cannot customize weekend days (e.g., Friday-Saturday for Middle Eastern countries).

### Reproduction
```typescript
const rule = {
  observedRule: {
    weekends: [5] // Only Friday
  }
};
// Saturday (6) will still be treated as weekend
```

### Proposed Fix
```typescript
const isWeekend = observedRule.weekends
  ? observedRule.weekends.includes(weekday)
  : (weekday === 0 || weekday === 6);
```

---

## Bug #3: Invalid ISO 8601 Duration Format Accepted
**File:** `src/plugins/duration/duration.ts`
**Lines:** 99-101
**Severity:** Low

### Description
The ISO 8601 duration regex allows mixing weeks with other date components (years, months, days), which violates the ISO 8601 standard. According to the spec, weeks cannot be combined with other date components.

### Current Code
```typescript
const isoMatch = input.match(
  /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
);
```

### Impact
Accepts invalid ISO duration strings like `P1Y2M3W4D`.

### Proposed Fix
Create two separate patterns: one for week-based durations, one for date-based durations, and try both.

---

## Bug #4: Range Chunk Size Validation Missing Integer Check
**File:** `src/plugins/range/range.ts`
**Line:** 144
**Severity:** Low

### Description
The `chunk()` method validates that size is positive and finite, but doesn't check if it's an integer. Non-integer sizes lead to unexpected behavior.

### Current Code
```typescript
if (size <= 0 || !Number.isFinite(size)) {
  throw new Error('Chunk size must be a positive finite number');
}
```

### Impact
`chunk(2.5)` is accepted and produces unpredictable results.

### Proposed Fix
```typescript
if (size <= 0 || !Number.isFinite(size) || !Number.isInteger(size)) {
  throw new Error('Chunk size must be a positive integer');
}
```

---

## Bug #5: kairos.utc() with No Arguments Creates Invalid Date
**File:** `src/core/plugin-system.ts`
**Lines:** 1109-1145
**Severity:** Medium

### Description
Calling `kairos.utc()` without arguments creates an invalid date instead of returning the current UTC time. This is inconsistent with `kairos()` which returns the current time, and with similar libraries like moment.js where `moment.utc()` returns current UTC time.

### Current Code
```typescript
(kairos as any).utc = (input?: KairosInput) => {
  let utcDate: Date;
  // ... no handling for arguments.length === 0
  utcDate = new Date(input as any); // undefined creates Invalid Date
```

### Impact
```typescript
kairos();      // Returns current time ✓
kairos.utc();  // Returns Invalid Date ✗
```

### Proposed Fix
Check `arguments.length` like the main kairos function does:
```typescript
(kairos as any).utc = function(input?: KairosInput) {
  if (arguments.length === 0) {
    return new KairosCore(new Date()) with _isUTC = true;
  }
  // ... rest of logic
}
```

---

## Bug #6: Undefined Error in Relative Holiday Calculator
**File:** `src/plugins/holiday/calculators/relative.ts`
**Line:** 52
**Severity:** Medium

### Description
The case-insensitive holiday lookup calls `.toLowerCase()` on `h.name` without checking if `h.name` is defined. If a holiday rule has an undefined `name` field, this throws a runtime error.

### Current Code
```typescript
baseHoliday = this.allHolidays.find((h) => h.name.toLowerCase() === relativeTo.toLowerCase());
```

### Impact
Runtime error: `Cannot read property 'toLowerCase' of undefined`

### Proposed Fix
```typescript
baseHoliday = this.allHolidays.find((h) =>
  h.name && h.name.toLowerCase() === relativeTo.toLowerCase()
);
```

---

## Summary

| Bug # | Severity | Category | File |
|-------|----------|----------|------|
| 1 | Medium | Logic Error | unix.ts |
| 2 | Medium | Logic Error | engine.ts |
| 3 | Low | Validation | duration.ts |
| 4 | Low | Validation | range.ts |
| 5 | Medium | API Inconsistency | plugin-system.ts |
| 6 | Medium | Null Safety | relative.ts |

**Total:** 6 bugs (4 Medium, 2 Low)

All bugs have been verified and reproduction steps documented where applicable.
