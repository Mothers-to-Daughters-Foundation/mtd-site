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
