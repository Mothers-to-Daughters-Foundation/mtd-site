import { describe, it, expect } from 'vitest';
import { needsOnboarding, tierKind } from './onboarding';

describe('needsOnboarding', () => {
  it('is true only for a mentee who has not completed onboarding', () => {
    expect(needsOnboarding('mentee', false)).toBe(true);
  });
  it('is false for a mentee who completed onboarding', () => {
    expect(needsOnboarding('mentee', true)).toBe(false);
  });
  it('is false for mentors and admins regardless', () => {
    expect(needsOnboarding('mentor', false)).toBe(false);
    expect(needsOnboarding('admin', false)).toBe(false);
  });
});

describe('tierKind', () => {
  it('treats price 0 (or missing) as free', () => {
    expect(tierKind(0)).toBe('free');
    expect(tierKind('0.00')).toBe('free');
    expect(tierKind(null)).toBe('free');
    expect(tierKind(undefined)).toBe('free');
  });
  it('treats a positive price as paid', () => {
    expect(tierKind(5000)).toBe('paid');
    expect(tierKind('12000.00')).toBe('paid');
  });
});
