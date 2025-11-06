/**
 * New Bugs Found in Comprehensive Bug Hunt
 * Test for Bug 21: kairos(undefined) handling
 *
 * Bug 19 (ISO parser validation) has been fixed and is tested in bug-fixes.test.ts
 */

import kairos from '../../src/index.js';

describe('Bug 21: kairos(undefined) Handling', () => {
  it('should return invalid date for undefined input', () => {
    const date = kairos(undefined as any);
    expect(date.isValid()).toBe(false);
  });

  it('should return invalid date for null input', () => {
    const date = kairos(null as any);
    expect(date.isValid()).toBe(false);
  });

  it('should return invalid date for invalid string', () => {
    const date = kairos('not a date');
    expect(date.isValid()).toBe(false);
  });

  it('should return invalid date for NaN', () => {
    const date = kairos(NaN as any);
    expect(date.isValid()).toBe(false);
  });

  it('should return invalid date for empty object', () => {
    const date = kairos({} as any);
    expect(date.isValid()).toBe(false);
  });

  it('should return valid date for valid inputs', () => {
    expect(kairos('2024-06-15').isValid()).toBe(true);
    expect(kairos(new Date()).isValid()).toBe(true);
    expect(kairos().isValid()).toBe(true); // Current time
    expect(kairos(0).isValid()).toBe(true); // Unix epoch
  });
});
