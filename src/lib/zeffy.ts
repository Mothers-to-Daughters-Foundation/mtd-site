/** Public Zeffy organization page for Mothers to Daughters Inc. */
export const ZEFFY_ORGANIZATION_URL =
  'https://www.zeffy.com/en-US/organizations/mothers-to-daughters-inc';

const PLACEHOLDERS = new Set([
  '',
  'https://zeffy.com',
  'https://www.zeffy.com',
  'https://www.zeffy.com/your-payment-page',
]);

/** Use a configured payment link, or the organization page when it is missing or a placeholder. */
export function zeffyPaymentUrl(override?: string | null): string {
  const configured = (override ?? process.env.NEXT_PUBLIC_ZEFFY_URL ?? '').trim();
  if (PLACEHOLDERS.has(configured)) return ZEFFY_ORGANIZATION_URL;
  return configured;
}

/**
 * Accept what an admin pastes for a plan: a Zeffy link, or the embed code
 * Zeffy generates (Campaign → Share → More ways to share → Embed), from which
 * the form address is taken. Returns '' for empty input and null for anything
 * that isn't an https address on zeffy.com.
 */
export function normalizeZeffyInput(raw: string | null | undefined): string | null {
  const text = (raw ?? '').trim();
  if (!text) return '';
  const src = /<iframe[\s\S]*?\ssrc\s*=\s*["']([^"']+)["']/i.exec(text)?.[1] ?? text;
  let url: URL;
  try {
    url = new URL(src.replace(/&amp;/g, '&'));
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || !(host === 'zeffy.com' || host.endsWith('.zeffy.com'))) {
    return null;
  }
  return url.toString();
}

/** An embed address (from Zeffy's embed code) can be shown inside our page. */
export function isZeffyEmbed(url: string | null | undefined): boolean {
  return Boolean(url) && /\/embed\//i.test(url as string);
}
