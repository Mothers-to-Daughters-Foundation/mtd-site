const DATE_OPTS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

/**
 * Human-readable event date + time. Dates are stored without a timezone
 * suffix (local), so parsing and formatting both use local time and are
 * self-consistent. Returns '' for an unparseable start date.
 */
export function formatEventWhen(date: string, endDate?: string): string {
  const start = new Date(date);
  if (Number.isNaN(start.getTime())) return '';

  const dateStr = start.toLocaleDateString('en-US', DATE_OPTS);
  const startTime = start.toLocaleTimeString('en-US', TIME_OPTS);

  if (endDate) {
    const end = new Date(endDate);
    if (!Number.isNaN(end.getTime())) {
      const endTime = end.toLocaleTimeString('en-US', TIME_OPTS);
      if (start.toDateString() === end.toDateString()) {
        return `${dateStr} · ${startTime} – ${endTime}`;
      }
      const endDateStr = end.toLocaleDateString('en-US', DATE_OPTS);
      return `${dateStr} ${startTime} – ${endDateStr} ${endTime}`;
    }
  }
  return `${dateStr} · ${startTime}`;
}
