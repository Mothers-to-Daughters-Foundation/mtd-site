import { describe, it, expect } from 'vitest';
import { ageOn, checkAge, parseBirthDate } from './age';

const today = new Date(Date.UTC(2026, 10, 16)); // 2026-11-16

describe('parseBirthDate', () => {
  it('accepts real dates and rejects impossible ones', () => {
    expect(parseBirthDate('2000-02-29')).not.toBeNull();
    expect(parseBirthDate('2001-02-29')).toBeNull();
    expect(parseBirthDate('2001-13-01')).toBeNull();
    expect(parseBirthDate('11/16/2000')).toBeNull();
  });
});

describe('ageOn', () => {
  it('counts a birthday only once it has happened', () => {
    expect(ageOn(parseBirthDate('2008-11-16')!, today)).toBe(18);
    expect(ageOn(parseBirthDate('2008-11-17')!, today)).toBe(17);
  });
});

describe('checkAge', () => {
  it('allows members who are 18 today', () => {
    expect(checkAge('2008-11-16', today, 18)).toEqual({ ok: true, age: 18, birthYear: 2008 });
  });
  it('turns away members under the minimum with a friendly message', () => {
    const r = checkAge('2008-11-17', today, 18);
    expect(r).toMatchObject({ ok: false, reason: 'too_young' });
  });
  it('rejects missing, future and implausible dates', () => {
    expect(checkAge('', today)).toMatchObject({ ok: false, reason: 'invalid' });
    expect(checkAge('2030-01-01', today)).toMatchObject({ ok: false, reason: 'invalid' });
    expect(checkAge('1850-01-01', today)).toMatchObject({ ok: false, reason: 'invalid' });
  });
  it('respects a different minimum', () => {
    expect(checkAge('2010-01-01', today, 16)).toMatchObject({ ok: true });
  });
});
