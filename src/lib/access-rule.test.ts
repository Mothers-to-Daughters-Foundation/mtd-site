import { describe, it, expect } from 'vitest';
import { evaluateMenteeAccess } from './access-rule';

const NOW = new Date('2026-10-03T00:00:00Z');
const future = '2026-12-01T00:00:00Z';
const past = '2026-01-01T00:00:00Z';
const paid = { monthly_price: 5000 };
const free = { monthly_price: 0 };

describe('evaluateMenteeAccess', () => {
  it('allows mentors and admins regardless of subscription', () => {
    expect(evaluateMenteeAccess('mentor', null, null, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
    expect(evaluateMenteeAccess('admin', null, null, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
  });
  it('blocks a mentee with no subscription', () => {
    expect(evaluateMenteeAccess('mentee', null, null, NOW)).toEqual({ hasAccess: false, reason: 'no_subscription' });
  });
  it('blocks a mentee on the free tier', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, free, NOW)).toEqual({ hasAccess: false, reason: 'free_tier' });
  });
  it('allows an active paid mentee', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, paid, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
  });
  it('allows a trialing paid mentee', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'trial', expires_at: future }, paid, NOW)).toEqual({ hasAccess: true, reason: 'ok' });
  });
  it('blocks a paid mentee past expires_at', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: past }, paid, NOW)).toEqual({ hasAccess: false, reason: 'expired' });
  });
  it('blocks cancelled / paused / expired statuses', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'cancelled', expires_at: future }, paid, NOW).reason).toBe('cancelled');
    expect(evaluateMenteeAccess('mentee', { status: 'paused', expires_at: future }, paid, NOW).reason).toBe('paused');
    expect(evaluateMenteeAccess('mentee', { status: 'expired', expires_at: future }, paid, NOW).reason).toBe('expired');
  });
  it('treats monthly_price as a number even if a numeric string', () => {
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, { monthly_price: '5000.00' }, NOW).hasAccess).toBe(true);
    expect(evaluateMenteeAccess('mentee', { status: 'active', expires_at: future }, { monthly_price: '0.00' }, NOW).reason).toBe('free_tier');
  });
});
