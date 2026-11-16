import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod/v4';
import type { createAdminClient } from './supabase/admin';

/**
 * Optional AI step for mentor matching. It runs only when the rule-based score is
 * not confident, only ranks mentors that already passed the hard rules (capacity),
 * and is skipped (never fatal) when there is no key, the monthly budget is used up,
 * or the API is unavailable. The caller then routes the match to admin review.
 *
 * Settings (server-side environment variables):
 *   ANTHROPIC_API_KEY             required to turn the AI step on
 *   AI_MATCHING_ENABLED           "false" turns it off without removing the key
 *   AI_MATCHING_MODEL             default claude-opus-5-5
 *   AI_MATCHING_MONTHLY_BUDGET_USD default 5
 *   AI_MATCHING_MIN_CONFIDENCE    0–1, default 0.8; below this an admin decides
 */

type AdminClient = ReturnType<typeof createAdminClient>;

export type AiStatus =
  | 'not_needed' // rule-based match was confident, or nobody had capacity
  | 'disabled' // no API key, or turned off
  | 'skipped' // left out of a bulk run to stay within the server time limit
  | 'budget_exhausted' // this month's budget is used up
  | 'quota_exhausted' // the Anthropic account is out of credit (402)
  | 'unavailable' // rate limited, overloaded, timed out or unreachable
  | 'misconfigured' // bad key, no access to the model, or a bad request
  | 'error' // anything else, including a refusal or unusable answer
  | 'used';

/** Human-readable flag for each fallback, shown to admins. */
export const AI_STATUS_LABEL: Record<AiStatus, string> = {
  not_needed: '',
  disabled: 'AI matching is off',
  skipped: 'AI was skipped in a long batch run; run auto-match again to retry',
  budget_exhausted: "This month's AI budget is used up",
  quota_exhausted: 'The AI account is out of credit',
  unavailable: 'The AI service was unavailable',
  misconfigured: 'AI matching is misconfigured (check the API key and model)',
  error: 'The AI step failed',
  used: '',
};

export type AiConfig = {
  enabled: boolean;
  model: string;
  monthlyBudgetUsd: number;
  minConfidence: number;
};

function numberEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function getAiConfig(): AiConfig {
  return {
    enabled: Boolean(process.env.ANTHROPIC_API_KEY) && process.env.AI_MATCHING_ENABLED !== 'false',
    model: process.env.AI_MATCHING_MODEL || 'claude-opus-5-5',
    monthlyBudgetUsd: numberEnv('AI_MATCHING_MONTHLY_BUDGET_USD', 5),
    minConfidence: Math.min(1, numberEnv('AI_MATCHING_MIN_CONFIDENCE', 0.8)),
  };
}

/** USD per million tokens [input, output]. Unknown models are priced high so the budget errs safe. */
const PRICES: Record<string, [number, number]> = {
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5],
};
const UNKNOWN_MODEL_PRICE: [number, number] = [10, 50];

/** Models that accept server-side refusal fallbacks (re-run on another model if declined). */
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

/** Maps an SDK error to the fallback flag admins see. */
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

export type AiMentee = {
  interests: string[];
  careerGoals: string[];
  businessExperience: string | null;
};

export type AiMentor = {
  id: string;
  careerAreas: string[];
  expertise: string | null;
  bio: string | null;
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

const SYSTEM = `You help a nonprofit mentorship program pair a mentee with a mentor.
You get the mentee's onboarding answers and a short list of mentors who all have room for another mentee.
Pick the mentor whose experience best serves the mentee's goals. Judge only on the professional
information given. If no mentor is a reasonable fit, answer "none".
Give a calibrated confidence: an administrator reviews every pick below their threshold, so a lower
honest number is better than an inflated one.`;

const truncate = (s: string | null, n: number) =>
  s ? (s.length > n ? `${s.slice(0, n)}…` : s) : null;

/**
 * Ask Claude to pick from pre-filtered candidates. Never throws: every failure
 * comes back as a status the caller records and routes to admin review.
 * Candidates are sent with opaque labels and no names or contact details.
 */
export async function aiRankMentors(
  admin: AdminClient,
  mentee: AiMentee,
  mentors: AiMentor[],
  config: AiConfig = getAiConfig()
): Promise<AiRankResult> {
  if (!config.enabled) return { status: 'disabled' };
  if (mentors.length === 0) return { status: 'not_needed' };

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
  const payload = {
    mentee: {
      interests: mentee.interests,
      careerGoals: mentee.careerGoals,
      businessExperience: mentee.businessExperience,
    },
    mentors: mentors.map((m, i) => ({
      label: labels[i],
      careerAreas: m.careerAreas,
      expertise: truncate(m.expertise, 300),
      bio: truncate(m.bio, 600),
      currentMentees: m.activeMenteeCount,
      capacity: m.maxMentees,
    })),
  };

  try {
    const client = new Anthropic({ timeout: 30_000, maxRetries: 1 });
    const response = await client.beta.messages.parse({
      model: config.model,
      max_tokens: 4000,
      ...(SUPPORTS_FALLBACKS.has(config.model)
        ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
        : {}),
      output_config: { effort: 'low', format: betaZodOutputFormat(AnswerSchema) },
      system: SYSTEM,
      messages: [{ role: 'user', content: JSON.stringify(payload) }],
    });

    const { error: usageError } = await admin.rpc('record_ai_usage', {
      p_period: currentPeriod(),
      p_input:
        response.usage.input_tokens +
        (response.usage.cache_creation_input_tokens ?? 0) +
        (response.usage.cache_read_input_tokens ?? 0),
      p_output: response.usage.output_tokens,
      p_cost: estimateCostUsd(response.model, response.usage),
    });
    if (usageError) console.error('[aiRankMentors] record usage', usageError);

    const answer = response.parsed_output;
    if (response.stop_reason === 'refusal' || !answer) {
      return { status: 'error', model: response.model, reason: 'The AI gave no usable answer.' };
    }

    const index = labels.indexOf(answer.choice.trim().toUpperCase());
    const confidence = Math.max(0, Math.min(1, answer.confidence));
    return {
      status: 'used',
      model: response.model,
      mentorId: index >= 0 ? mentors[index].id : undefined,
      confidence: index >= 0 ? confidence : 0,
      reason: answer.reason,
    };
  } catch (error) {
    const status = classifyAiError(error);
    console.error(`[aiRankMentors] ${status}`, error);
    return { status, model: config.model };
  }
}
