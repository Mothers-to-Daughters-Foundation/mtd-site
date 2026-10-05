import { describe, it, expect } from 'vitest';
import {
  validateSlot,
  canRequest,
  canApprove,
  canDecline,
  canDelete,
} from './availability';

const NOW = new Date('2026-10-05T12:00:00.000Z');

describe('validateSlot', () => {
  it('accepts a well-formed future slot', () => {
    expect(
      validateSlot({
        startsAt: '2026-10-06T14:00:00.000Z',
        endsAt: '2026-10-06T15:00:00.000Z',
        now: NOW,
      })
    ).toBeNull();
  });

  it('rejects end <= start', () => {
    expect(
      validateSlot({
        startsAt: '2026-10-06T15:00:00.000Z',
        endsAt: '2026-10-06T15:00:00.000Z',
        now: NOW,
      })
    ).toMatch(/later than the start/i);
  });

  it('rejects a start in the past', () => {
    expect(
      validateSlot({
        startsAt: '2026-10-04T14:00:00.000Z',
        endsAt: '2026-10-04T15:00:00.000Z',
        now: NOW,
      })
    ).toMatch(/past/i);
  });

  it('rejects an invalid date', () => {
    expect(
      validateSlot({ startsAt: 'not-a-date', endsAt: 'also-bad', now: NOW })
    ).toMatch(/invalid/i);
  });
});

describe('transition guards', () => {
  it('canRequest only when open', () => {
    expect(canRequest({ status: 'open' })).toBe(true);
    expect(canRequest({ status: 'pending' })).toBe(false);
    expect(canRequest({ status: 'booked' })).toBe(false);
  });

  it('canApprove / canDecline only when pending', () => {
    expect(canApprove({ status: 'pending' })).toBe(true);
    expect(canApprove({ status: 'open' })).toBe(false);
    expect(canDecline({ status: 'pending' })).toBe(true);
    expect(canDecline({ status: 'booked' })).toBe(false);
  });

  it('canDelete unless booked', () => {
    expect(canDelete({ status: 'open' })).toBe(true);
    expect(canDelete({ status: 'pending' })).toBe(true);
    expect(canDelete({ status: 'booked' })).toBe(false);
  });
});
