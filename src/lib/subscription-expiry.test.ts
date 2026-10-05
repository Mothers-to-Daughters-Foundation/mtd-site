import { describe, it, expect } from 'vitest';
import { computeExpiry } from './subscription-expiry';

describe('computeExpiry', () => {
  it('monthly adds one month', () => {
    expect(computeExpiry(new Date('2026-01-15T00:00:00.000Z'), 'monthly')).toBe(
      '2026-02-15T00:00:00.000Z'
    );
  });

  it('yearly adds one year', () => {
    expect(computeExpiry(new Date('2026-01-15T00:00:00.000Z'), 'yearly')).toBe(
      '2027-01-15T00:00:00.000Z'
    );
  });

  it('monthly clamps day overflow (Jan 31 -> Feb 28 in a non-leap year)', () => {
    expect(computeExpiry(new Date('2026-01-31T00:00:00.000Z'), 'monthly')).toBe(
      '2026-02-28T00:00:00.000Z'
    );
  });

  it('yearly clamps a leap day (Feb 29 2024 -> Feb 28 2025)', () => {
    expect(computeExpiry(new Date('2024-02-29T00:00:00.000Z'), 'yearly')).toBe(
      '2025-02-28T00:00:00.000Z'
    );
  });
});
