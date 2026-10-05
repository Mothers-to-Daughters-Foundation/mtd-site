export function computeExpiry(
  startedAt: Date,
  billingCycle: 'monthly' | 'yearly'
): string {
  const d = new Date(startedAt.getTime());
  const day = d.getUTCDate();

  if (billingCycle === 'yearly') {
    d.setUTCFullYear(d.getUTCFullYear() + 1);
  } else {
    d.setUTCMonth(d.getUTCMonth() + 1);
  }

  // If the day rolled over into the following month (e.g. Jan 31 -> Mar 3),
  // clamp back to the last day of the intended month.
  if (d.getUTCDate() < day) {
    d.setUTCDate(0);
  }

  return d.toISOString();
}
