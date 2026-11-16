import { describe, it, expect, vi, afterEach } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';
import { ApiError } from '@google/genai';
import {
  aiRankMentors,
  classifyAiError,
  classifyGeminiError,
  currentPeriod,
  estimateCostUsd,
  getAiConfig,
  type AiConfig,
} from './ai-matching';

const ENABLED: AiConfig = {
  enabled: true,
  provider: 'google',
  model: 'gemini-3.5-flash-lite',
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
  it('knows Gemini Flash-Lite pricing', () => {
    expect(
      estimateCostUsd('gemini-3.5-flash-lite', { input_tokens: 1_000_000, output_tokens: 1_000_000 })
    ).toBeCloseTo(0.3 + 2.5);
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

describe('classifyGeminiError', () => {
  const gemini = (status: number, message: string) => new ApiError({ status, message });
  it('separates a spent quota from a short rate limit', () => {
    expect(classifyGeminiError(gemini(429, 'You exceeded your current quota'))).toBe('quota_exhausted');
    expect(classifyGeminiError(gemini(429, 'Resource has been exhausted'))).toBe('unavailable');
  });
  it('treats server errors and network failures as unavailable', () => {
    expect(classifyGeminiError(gemini(503, 'The model is overloaded'))).toBe('unavailable');
    expect(classifyGeminiError(new TypeError('fetch failed'))).toBe('unavailable');
  });
  it('flags a bad key or model as misconfigured', () => {
    expect(classifyGeminiError(gemini(400, 'API key not valid'))).toBe('misconfigured');
    expect(classifyGeminiError(gemini(404, 'model not found'))).toBe('misconfigured');
  });
});

describe('getAiConfig', () => {
  afterEach(() => vi.unstubAllEnvs());
  const noKeys = () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('AI_MATCHING_PROVIDER', '');
    vi.stubEnv('AI_MATCHING_MODEL', '');
  };

  it('is off without an API key', () => {
    noKeys();
    expect(getAiConfig().enabled).toBe(false);
  });
  it('uses Gemini Flash-Lite when a Google AI Studio key is set', () => {
    noKeys();
    vi.stubEnv('GEMINI_API_KEY', 'test');
    expect(getAiConfig()).toMatchObject({
      enabled: true,
      provider: 'google',
      model: 'gemini-3.5-flash-lite',
    });
  });
  it('uses Claude when only an Anthropic key is set', () => {
    noKeys();
    vi.stubEnv('ANTHROPIC_API_KEY', 'test');
    expect(getAiConfig()).toMatchObject({ enabled: true, provider: 'anthropic' });
  });
  it('honours an explicit provider and model', () => {
    noKeys();
    vi.stubEnv('GEMINI_API_KEY', 'test');
    vi.stubEnv('ANTHROPIC_API_KEY', 'test');
    vi.stubEnv('AI_MATCHING_PROVIDER', 'anthropic');
    expect(getAiConfig().provider).toBe('anthropic');
    vi.stubEnv('AI_MATCHING_PROVIDER', 'google');
    vi.stubEnv('AI_MATCHING_MODEL', 'gemini-3.8-flash');
    expect(getAiConfig()).toMatchObject({ provider: 'google', model: 'gemini-3.8-flash' });
  });
  it('is off when the chosen provider has no key', () => {
    noKeys();
    vi.stubEnv('ANTHROPIC_API_KEY', 'test');
    vi.stubEnv('AI_MATCHING_PROVIDER', 'google');
    expect(getAiConfig().enabled).toBe(false);
  });
  it('can be switched off while keeping the key', () => {
    noKeys();
    vi.stubEnv('GEMINI_API_KEY', 'test');
    vi.stubEnv('AI_MATCHING_ENABLED', 'false');
    expect(getAiConfig().enabled).toBe(false);
  });
  it('reads budget and threshold, ignoring bad values', () => {
    noKeys();
    vi.stubEnv('GEMINI_API_KEY', 'test');
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

describe('aiRankMentors with Gemini (stubbed network)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sends a JSON-schema request and maps the chosen label back to the mentor', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                role: 'model',
                parts: [{ text: '{"choice":"C2","confidence":0.9,"reason":"Finance background."}' }],
              },
              finishReason: 'STOP',
            },
          ],
          usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 50, thoughtsTokenCount: 200 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    const admin = fakeAdmin(0) as unknown as { rpc: ReturnType<typeof vi.fn> };
    admin.rpc.mockResolvedValue({ error: null });

    const result = await aiRankMentors(
      admin as never,
      mentee,
      [mentor, { ...mentor, id: 'm2' }],
      ENABLED
    );

    expect(result).toMatchObject({ status: 'used', mentorId: 'm2', confidence: 0.9 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(String(url)).toContain('gemini-3.5-flash-lite:generateContent');
    const body = JSON.parse(String(init.body));
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.generationConfig.responseJsonSchema.properties.choice).toBeDefined();
    expect(body.systemInstruction).toBeDefined();
    expect(JSON.stringify(body.contents)).not.toContain('m2'); // ids never leave the server
    expect(admin.rpc).toHaveBeenCalledWith(
      'record_ai_usage',
      expect.objectContaining({ p_input: 1000, p_output: 250 })
    );
  });

  it('flags a spent Gemini quota and records no spend', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: { code: 429, message: 'You exceeded your current quota', status: 'RESOURCE_EXHAUSTED' },
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    const admin = fakeAdmin(0) as unknown as { rpc: ReturnType<typeof vi.fn> };

    const result = await aiRankMentors(admin as never, mentee, [mentor], ENABLED);

    expect(result.status).toBe('quota_exhausted');
    expect(admin.rpc).not.toHaveBeenCalled();
  });
});
