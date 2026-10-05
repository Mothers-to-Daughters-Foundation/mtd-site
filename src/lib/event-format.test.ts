import { describe, it, expect } from 'vitest';
import { formatEventWhen } from './event-format';

describe('formatEventWhen', () => {
  it('formats a same-day start/end time range', () => {
    expect(formatEventWhen('2026-05-14T18:00:00', '2026-05-14T21:00:00')).toBe(
      'May 14, 2026 · 6:00 PM – 9:00 PM'
    );
  });

  it('formats start only when no endDate', () => {
    expect(formatEventWhen('2026-01-21T19:00:00')).toBe(
      'January 21, 2026 · 7:00 PM'
    );
  });

  it('formats a half-hour start time', () => {
    expect(formatEventWhen('2026-03-31T17:30:00', '2026-03-31T20:00:00')).toBe(
      'March 31, 2026 · 5:30 PM – 8:00 PM'
    );
  });

  it('returns empty string for an unparseable date', () => {
    expect(formatEventWhen('not-a-date')).toBe('');
  });
});
