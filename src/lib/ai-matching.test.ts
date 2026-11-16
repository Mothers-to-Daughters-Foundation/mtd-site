import { describe, it, expect, vi, afterEach } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import {
  aiRankMentors,
  classifyAiError,
  currentPeriod,
  estimateCostUsd,
  getAiConfig,
  type AiConfig,
} from './ai-matching';

const ENABLED: AiConfig = {
  enabled: true,
  model: 'claude-opus-5-5',
  monthlyBudgetUsd: 5,
  minConfidence: 0.8,
};
const mentee = { interests: ['Finance'], careerGoals: [], businessExperience: null };
const mentor = {
  id: 'm1',
  careerAreas: [],
  expertise: null,
  bio: null,
  activeMenteeCount: 0,
  maxMentees: null,
};

/** Minimal stand-in for the Supabase admin client's ai_usage lookup. */
function fakeAdmin(spent: number | null, error: unknown = null) {
  const query = {
    select: () => query,
    eq: () => query,
    maybeSingle: async () => ({ data: spent == null ? null : { cost_usd: spent }, error }),
  };
  return { from: () => query, rpc: vi.fn() } as never;
}

describe('estimateCostUsd', () => {
  it('prices input, output and cache tokens per million', () => {
    expect(
      estimateCostUsd('claude-opus-5-5', { input_tokens: 1_000_000, output_tokens: 100_000 })
    ).toBeCloseTo(4 + 2);
    expect(
      estimateCostUsd('claude-opus-5-5', {
        input_tokens: 0,
        output_tokens: 0,
        cache_creation_input_tokens: 1_000_000,
        cache_read_input_tokens: 1_000_000,
      })
    ).toBeCloseTo(4 * 1.25 + 4 * 0.1);
  });
  it('prices unknown models high so the budget errs safe', () => {
    expect(
      estimateCostUsd('some-new-model', { input_tokens: 1_000_000, output_tokens: 0 })
    ).toBeGreaterThan(estimateCostUsd('claude-opus-5-5', { input_tokens: 1_000_000, output_tokens: 0 }));
  });
});

describe('classifyAiError', () => {
  const headers = new Headers();
  it('treats rate limits, overload and network failures as temporarily unavailable', () => {
    expect(classifyAiError(new Anthropic.RateLimitError(429, {}, 'slow down', headers))).toBe('unavailable');
    expect(classifyAiError(new Anthropic.InternalServerError(529, {}, 'overloaded', headers))).toBe(
      'unavailable'
    );
    expect(classifyAiError(new Anthropic.APIConnectionError({ message: 'offline' }))).toBe('unavailable');
  });
  it('flags billing problems as out of credit', () => {
    expect(classifyAiError(new Anthropic.APIError(402, {}, 'billing', headers, 'billing_error'))).toBe(
      'quota_exhausted'
    );
  });
  it('flags a bad key or model as misconfigured', () => {
    expect(classifyAiError(new Anthropic.AuthenticationError(401, {}, 'bad key', headers))).toBe(
      'misconfigured'
    );
    expect(classifyAiError(new Anthropic.NotFoundError(404, {}, 'no model', headers))).toBe('misconfigured');
  });
  it('falls back to a generic error', () => {
    expect(classifyAiError(new Error('boom'))).toBe('error');
  });
});

describe('getAiConfig', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is off without an API key', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    expect(getAiConfig().enabled).toBe(false);
  });
  it('can be switched off while keeping the key', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-test');
    vi.stubEnv('AI_MATCHING_ENABLED', 'false');
    expect(getAiConfig().enabled).toBe(false);
  });
  it('reads budget and threshold, ignoring bad values', () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-test');
    vi.stubEnv('AI_MATCHING_MONTHLY_BUDGET_USD', '12.5');
    vi.stubEnv('AI_MATCHING_MIN_CONFIDENCE', 'not-a-number');
    expect(getAiConfig()).toMatchObject({ enabled: true, monthlyBudgetUsd: 12.5, minConfidence: 0.8 });
  });
});

describe('aiRankMentors fallbacks (no API call)', () => {
  it('reports disabled when AI is off', async () => {
    const result = await aiRankMentors(fakeAdmin(0), mentee, [mentor], { ...ENABLED, enabled: false });
    expect(result.status).toBe('disabled');
  });
  it('skips when nobody is eligible', async () => {
    expect((await aiRankMentors(fakeAdmin(0), mentee, [], ENABLED)).status).toBe('not_needed');
  });
  it('stops at the monthly budget', async () => {
    const result = await aiRankMentors(fakeAdmin(5), mentee, [mentor], ENABLED);
    expect(result.status).toBe('budget_exhausted');
  });
  it("doesn't spend when usage can't be read", async () => {
    const result = await aiRankMentors(fakeAdmin(null, new Error('no table')), mentee, [mentor], ENABLED);
    expect(result.status).toBe('error');
  });
});

describe('currentPeriod', () => {
  it('is the UTC year and month', () => {
    expect(currentPeriod(new Date('2026-11-30T23:59:59Z'))).toBe('2026-11');
  });
});
