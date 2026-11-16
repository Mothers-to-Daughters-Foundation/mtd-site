import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { ApiError, GoogleGenAI } from '@google/genai';
import { z } from 'zod/v4';
import type { createAdminClient } from './supabase/admin';
import type { MatchProfile } from './matching';
import {
  CAREER_GOAL_OPTIONS,
  INTEREST_OPTIONS,
  MOTIVATION_OPTIONS,
  OPPORTUNITY_OPTIONS,
  SUCCESS_OPTIONS,
  type Option,
} from './onboarding-options';

/**
 * Optional AI step for mentor matching. It runs only when the rule-based score is
 * not confident and enough mentors have room for a choice to be meaningful, and it
 * only ranks mentors that already passed the hard rules (capacity),
 * and is skipped (never fatal) when there is no key, the monthly budget is used up,
 * the provider's quota is exhausted, or the API is unavailable. The caller then
 * routes the match to admin review.
 *
 * Settings (server-side environment variables):
 *   GEMINI_API_KEY                Google AI Studio key: turns the AI step on with Gemini
 *   ANTHROPIC_API_KEY             Anthropic key: turns the AI step on with Claude
 *   AI_MATCHING_PROVIDER          "google" or "anthropic"; default: whichever key is set (Google first)
 *   AI_MATCHING_MODEL             default gemini-3.5-flash-lite (Google) / claude-opus-5-5 (Anthropic)
 *   AI_MATCHING_ENABLED           "false" turns it off without removing the key
 *   AI_MATCHING_MONTHLY_BUDGET_USD default 5
 *   AI_MATCHING_MIN_CONFIDENCE    0–1, default 0.8; below this an admin decides
 *   AI_MATCHING_MIN_MENTORS       default 5; with fewer mentors with room, an admin decides
 */

type AdminClient = ReturnType<typeof createAdminClient>;

export type AiProvider = 'google' | 'anthropic';

export type AiStatus =
  | 'not_needed' // rule-based match was confident, or nobody had capacity
  | 'disabled' // no API key, or turned off
  | 'skipped' // left out of a bulk run to stay within the server time limit
  | 'small_pool' // too few mentors with room for AI to add anything
  | 'budget_exhausted' // this month's budget is used up
  | 'quota_exhausted' // the provider account is out of credit or quota
  | 'unavailable' // rate limited, overloaded, timed out or unreachable
  | 'misconfigured' // bad key, no access to the model, or a bad request
  | 'error' // anything else, including a refusal or unusable answer
  | 'used';

/** Human-readable flag for each fallback, shown to admins. */
export const AI_STATUS_LABEL: Record<AiStatus, string> = {
  not_needed: '',
  disabled: 'AI matching is off',
  skipped: 'AI was skipped in a long batch run; run auto-match again to retry',
  small_pool: 'Too few mentors with room for AI to help, so this needs a person',
  budget_exhausted: "This month's AI budget is used up",
  quota_exhausted: "The AI provider's quota or credit is used up",
  unavailable: 'The AI service was unavailable',
  misconfigured: 'AI matching is misconfigured (check the API key and model)',
  error: 'The AI step failed',
  used: '',
};

export type AiConfig = {
  enabled: boolean;
  provider: AiProvider;
  model: string;
  monthlyBudgetUsd: number;
  minConfidence: number;
  minMentors: number;
};

const DEFAULT_MODEL: Record<AiProvider, string> = {
  google: 'gemini-3.5-flash-lite',
  anthropic: 'claude-opus-5-5',
};

function numberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return process.env[name] && Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function getAiConfig(): AiConfig {
  const keys: Record<AiProvider, boolean> = {
    google: Boolean(process.env.GEMINI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
  };
  const requested = process.env.AI_MATCHING_PROVIDER;
  const provider: AiProvider =
    requested === 'google' || requested === 'anthropic'
      ? requested
      : keys.google || !keys.anthropic
        ? 'google'
        : 'anthropic';

  return {
    enabled: keys[provider] && process.env.AI_MATCHING_ENABLED !== 'false',
    provider,
    model: process.env.AI_MATCHING_MODEL || DEFAULT_MODEL[provider],
    monthlyBudgetUsd: numberEnv('AI_MATCHING_MONTHLY_BUDGET_USD', 5),
    minConfidence: Math.min(1, numberEnv('AI_MATCHING_MIN_CONFIDENCE', 0.8)),
    minMentors: Math.max(1, Math.round(numberEnv('AI_MATCHING_MIN_MENTORS', 5))),
  };
}

/**
 * USD per million tokens [input, output], paid tier. Unknown models are priced
 * high so the budget errs safe. Gemini Flash uses its 2027 price (higher).
 */
const PRICES: Record<string, [number, number]> = {
  'gemini-3.8-flash': [1.5, 7.5],
  'gemini-3.6-flash': [1.5, 7.5],
  'gemini-3.5-flash-lite': [0.3, 2.5],
  'gemini-3.1-flash-lite': [0.25, 1.5],
  'gemini-2.5-flash-lite': [0.1, 0.4],
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5],
};
const UNKNOWN_MODEL_PRICE: [number, number] = [10, 50];

/** Claude models that accept server-side refusal fallbacks (re-run on another model if declined). */
const SUPPORTS_FALLBACKS = new Set(['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-2']);

export type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

export function estimateCostUsd(model: string, usage: TokenUsage): number {
  const [inPrice, outPrice] = PRICES[model] ?? UNKNOWN_MODEL_PRICE;
  const input =
    usage.input_tokens +
    (usage.cache_creation_input_tokens ?? 0) * 1.25 +
    (usage.cache_read_input_tokens ?? 0) * 0.1;
  return (input * inPrice + usage.output_tokens * outPrice) / 1_000_000;
}

export function currentPeriod(now = new Date()) {
  return now.toISOString().slice(0, 7);
}

export async function getMonthlySpendUsd(admin: AdminClient): Promise<number> {
  const { data, error } = await admin
    .from('ai_usage')
    .select('cost_usd')
    .eq('period', currentPeriod())
    .maybeSingle();
  if (error) throw error;
  return Number(data?.cost_usd ?? 0);
}

/** Maps an Anthropic SDK error to the fallback flag admins see. */
export function classifyAiError(error: unknown): AiStatus {
  if (error instanceof Anthropic.APIConnectionError) return 'unavailable'; // includes timeouts
  if (error instanceof Anthropic.RateLimitError) return 'unavailable';
  if (error instanceof Anthropic.InternalServerError) return 'unavailable'; // 5xx and 529 overloaded
  if (error instanceof Anthropic.AuthenticationError) return 'misconfigured';
  if (error instanceof Anthropic.PermissionDeniedError) return 'misconfigured';
  if (error instanceof Anthropic.NotFoundError) return 'misconfigured';
  if (error instanceof Anthropic.APIError) {
    if (error.status === 402 || error.type === 'billing_error') return 'quota_exhausted';
    if (error.status === 400) return 'misconfigured';
  }
  return 'error';
}

/**
 * Maps a Google GenAI SDK error to the fallback flag admins see. Gemini returns
 * 429 RESOURCE_EXHAUSTED both for short rate limits and for spent quotas; the
 * SDK exposes no field to tell them apart, so the message is checked for "quota".
 */
export function classifyGeminiError(error: unknown): AiStatus {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return /quota|billing/i.test(error.message) ? 'quota_exhausted' : 'unavailable';
    }
    if (error.status >= 500) return 'unavailable';
    if ([400, 401, 403, 404].includes(error.status)) return 'misconfigured';
    return 'error';
  }
  // fetch failures and timeouts surface as plain errors
  if (error instanceof Error && /abort|timeout|fetch failed|network/i.test(error.message)) {
    return 'unavailable';
  }
  return 'error';
}

export type AiMentee = MatchProfile & { businessExperience: string | null };

export type AiMentor = MatchProfile & {
  id: string;
  activeMenteeCount: number;
  maxMentees: number | null;
};

export type AiRankResult = {
  status: AiStatus;
  model?: string;
  mentorId?: string;
  confidence?: number;
  reason?: string;
};

const AnswerSchema = z.object({
  choice: z.string().describe('The label of the best mentor, e.g. "C2", or "none" if no one fits.'),
  confidence: z.number().describe('How confident you are that this is a good pairing, from 0 to 1.'),
  reason: z.string().describe('One or two sentences an administrator can check.'),
});
type Answer = z.infer<typeof AnswerSchema>;

const SYSTEM = `You help a nonprofit mentorship program pair a mentee with a mentor.
You get the mentee's onboarding answers and a short list of mentors who all have room for another mentee.
Mentors answered the same questions from the mentoring side (what they can help with, why they mentor).
Pick the mentor whose experience best serves the mentee's goals. Judge only on the professional
information given. If no mentor is a reasonable fit, answer "none".
Give a calibrated confidence: an administrator reviews every pick below their threshold, so a lower
honest number is better than an inflated one.`;

const TIMEOUT_MS = 30_000;

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** Stored option values as readable phrases (no emoji) for the model. */
function describe(options: Option[], values: string[], side: 'mentee' | 'mentor') {
  return values.map((v) => {
    const o = options.find((x) => x.value === v);
    return o ? (side === 'mentor' ? o.mentorLabel : o.label) : v;
  });
}

function describeProfile(p: MatchProfile, side: 'mentee' | 'mentor') {
  return {
    interests: describe(INTEREST_OPTIONS, p.interests, side),
    careerGoals: describe(CAREER_GOAL_OPTIONS, p.careerGoals, side),
    motivations: describe(MOTIVATION_OPTIONS, p.motivations, side),
    lookingFor: describe(OPPORTUNITY_OPTIONS, p.opportunityValues, side),
    success: describe(SUCCESS_OPTIONS, p.successValues, side),
  };
}

/** One provider call: the answer (null if unusable) and what it cost. */
type ProviderResult = {
  model: string;
  answer: Answer | null;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
};

async function askClaude(model: string, prompt: string): Promise<ProviderResult> {
  const client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 1 });
  const response = await client.beta.messages.parse({
    model,
    max_tokens: 4000,
    ...(SUPPORTS_FALLBACKS.has(model)
      ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
      : {}),
    output_config: { effort: 'low', format: betaZodOutputFormat(AnswerSchema) },
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  });
  const usage = response.usage;
  return {
    model: response.model,
    answer: response.stop_reason === 'refusal' ? null : response.parsed_output,
    inputTokens:
      usage.input_tokens +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0),
    outputTokens: usage.output_tokens,
    costUsd: estimateCostUsd(response.model, usage),
  };
}

async function askGemini(model: string, prompt: string): Promise<ProviderResult> {
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: TIMEOUT_MS, retryOptions: { attempts: 2 } },
  });
  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(AnswerSchema),
    },
  });

  // Thinking tokens are billed as output on Gemini.
  const usage = response.usageMetadata;
  const inputTokens = usage?.promptTokenCount ?? 0;
  const outputTokens = (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0);

  let answer: Answer | null = null;
  try {
    const parsed = AnswerSchema.safeParse(JSON.parse(response.text ?? ''));
    answer = parsed.success ? parsed.data : null;
  } catch {
    answer = null; // blocked or not JSON
  }

  return {
    model,
    answer,
    inputTokens,
    outputTokens,
    costUsd: estimateCostUsd(model, { input_tokens: inputTokens, output_tokens: outputTokens }),
  };
}

/**
 * Ask the configured model to pick from pre-filtered candidates. Never throws:
 * every failure comes back as a status the caller records and routes to admin
 * review. Candidates are sent with opaque labels and no names or contact details.
 */
export async function aiRankMentors(
  admin: AdminClient,
  mentee: AiMentee,
  mentors: AiMentor[],
  config: AiConfig = getAiConfig()
): Promise<AiRankResult> {
  if (!config.enabled) return { status: 'disabled' };
  if (mentors.length === 0) return { status: 'not_needed' };
  if (mentors.length < config.minMentors) return { status: 'small_pool' };

  try {
    if ((await getMonthlySpendUsd(admin)) >= config.monthlyBudgetUsd) {
      return { status: 'budget_exhausted' };
    }
  } catch (error) {
    // Without the usage table the budget can't be enforced, so don't spend.
    console.error('[aiRankMentors] budget check', error);
    return { status: 'error', reason: 'Could not read AI usage.' };
  }

  const labels = mentors.map((_, i) => `C${i + 1}`);
  // The mentee's "anything else" note is not sent; it only feeds keyword overlap.
  const prompt = JSON.stringify({
    mentee: {
      ...describeProfile(mentee, 'mentee'),
      businessExperience: mentee.businessExperience,
      otherAnswers: mentee.freeText.map((t) => truncate(t, 300)),
    },
    mentors: mentors.map((m, i) => ({
      label: labels[i],
      ...describeProfile(m, 'mentor'),
      expertiseAndBio: m.freeText.map((t) => truncate(t, 600)),
      currentMentees: m.activeMenteeCount,
      capacity: m.maxMentees,
    })),
  });

  let result: ProviderResult;
  try {
    result =
      config.provider === 'google'
        ? await askGemini(config.model, prompt)
        : await askClaude(config.model, prompt);
  } catch (error) {
    const status =
      config.provider === 'google' ? classifyGeminiError(error) : classifyAiError(error);
    console.error(`[aiRankMentors] ${config.provider} ${status}`, error);
    return { status, model: config.model };
  }

  const { error: usageError } = await admin.rpc('record_ai_usage', {
    p_period: currentPeriod(),
    p_input: result.inputTokens,
    p_output: result.outputTokens,
    p_cost: result.costUsd,
  });
  if (usageError) console.error('[aiRankMentors] record usage', usageError);

  if (!result.answer) {
    return { status: 'error', model: result.model, reason: 'The AI gave no usable answer.' };
  }

  const index = labels.indexOf(result.answer.choice.trim().toUpperCase());
  return {
    status: 'used',
    model: result.model,
    mentorId: index >= 0 ? mentors[index].id : undefined,
    confidence: index >= 0 ? Math.max(0, Math.min(1, result.answer.confidence)) : 0,
    reason: result.answer.reason,
  };
}
