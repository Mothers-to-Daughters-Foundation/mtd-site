export type SlotStatus = 'open' | 'pending' | 'booked';

export type AvailabilitySlot = {
  id: string;
  mentorId: string;
  startsAt: string; // ISO timestamp
  endsAt: string; // ISO timestamp
  status: SlotStatus;
  requestedBy: string | null;
  requestNote: string | null;
  sessionId: string | null;
};

/**
 * Returns an error message if the slot times are invalid, or null when valid.
 * A valid slot has parseable dates, ends after it starts, and does not start
 * in the past.
 */
export function validateSlot(input: {
  startsAt: string;
  endsAt: string;
  now?: Date;
}): string | null {
  const start = new Date(input.startsAt);
  const end = new Date(input.endsAt);
  const now = input.now ?? new Date();

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Invalid date or time.';
  }
  if (end.getTime() <= start.getTime()) {
    return 'The end time must be later than the start time.';
  }
  if (start.getTime() < now.getTime()) {
    return 'The slot cannot start in the past.';
  }
  return null;
}

export function canRequest(slot: { status: SlotStatus }): boolean {
  return slot.status === 'open';
}

export function canApprove(slot: { status: SlotStatus }): boolean {
  return slot.status === 'pending';
}

export function canDecline(slot: { status: SlotStatus }): boolean {
  return slot.status === 'pending';
}

export function canDelete(slot: { status: SlotStatus }): boolean {
  return slot.status !== 'booked';
}
