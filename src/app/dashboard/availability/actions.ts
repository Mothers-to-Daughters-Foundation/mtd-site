"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMenteeAccess } from "@/lib/access";
import { notifyUser, notifyUsers } from "@/lib/notifications";
import { createSession } from "@/app/dashboard/sessions/actions";
import {
  validateSlot,
  canRequest,
  canApprove,
  canDecline,
  canDelete,
} from "@/lib/availability";
import type { SessionType } from "@/lib/models/session";

type Result = { ok: boolean; error?: string };

async function getUserAndRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null as string | null };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { supabase, user, role: (profile?.role as string | null) ?? null };
}

function revalidate() {
  revalidatePath("/dashboard/mentor/availability");
  revalidatePath("/dashboard/mentee/availability");
  revalidatePath("/dashboard/sessions");
}

/* ---------- Mentor: create a slot ---------- */
export async function createSlot(input: {
  startsAt: string;
  endsAt: string;
}): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can set availability." };

  const invalid = validateSlot({ startsAt: input.startsAt, endsAt: input.endsAt });
  if (invalid) return { ok: false, error: invalid };

  const { error } = await supabase.from("mentor_availability").insert({
    mentor_id: user.id,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: "open",
  });
  if (error) return { ok: false, error: error.message };

  // Notify the mentor's active mentees (mentor -> mentee notifications are RLS-allowed).
  const { data: mentorships } = await supabase
    .from("mentorships")
    .select("mentee_id")
    .eq("mentor_id", user.id)
    .eq("status", "active");
  const menteeIds = (mentorships ?? []).map((m) => m.mentee_id);
  if (menteeIds.length) {
    await notifyUsers(
      menteeIds,
      "availability_published",
      "New availability",
      "Your mentor added a new available time slot.",
    );
  }

  revalidate();
  return { ok: true };
}

/* ---------- Mentor: delete a non-booked slot ---------- */
export async function deleteSlot(slotId: string): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can delete availability." };

  const { data: slot } = await supabase
    .from("mentor_availability")
    .select("status")
    .eq("id", slotId)
    .eq("mentor_id", user.id)
    .single();
  if (!slot) return { ok: false, error: "Slot not found." };
  if (!canDelete(slot)) return { ok: false, error: "A booked slot cannot be deleted." };

  const { error } = await supabase
    .from("mentor_availability")
    .delete()
    .eq("id", slotId)
    .eq("mentor_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidate();
  return { ok: true };
}

/* ---------- Mentee: request an open slot ---------- */
export async function requestSlot(slotId: string, note?: string): Promise<Result> {
  const { user } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };

  const admin = createAdminClient();

  const { data: slot } = await admin
    .from("mentor_availability")
    .select("id, mentor_id, status")
    .eq("id", slotId)
    .single();
  if (!slot || !canRequest(slot)) {
    return { ok: false, error: "This slot is no longer available." };
  }

  const { data: mentorship } = await admin
    .from("mentorships")
    .select("id")
    .eq("mentor_id", slot.mentor_id)
    .eq("mentee_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!mentorship) {
    return { ok: false, error: "You can only request time from your assigned mentor." };
  }

  const access = await getMenteeAccess(user.id);
  if (!access.hasAccess) {
    return { ok: false, error: "An active subscription is required to request a session." };
  }

  // Guard the race with .eq('status','open') so a second requester cannot win.
  const { data: updated, error } = await admin
    .from("mentor_availability")
    .update({
      status: "pending",
      requested_by: user.id,
      request_note: note?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slotId)
    .eq("status", "open")
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!updated || updated.length === 0) {
    return { ok: false, error: "This slot was just taken." };
  }

  // Notify the mentor via admin client (mentee -> mentor notification is RLS-blocked otherwise).
  await admin.from("notifications").insert({
    user_id: slot.mentor_id,
    type: "booking_requested",
    title: "New booking request",
    message: "A mentee requested one of your available time slots.",
    related_id: slotId,
  });

  revalidate();
  return { ok: true };
}

/* ---------- Mentor: approve a pending request (creates a session) ---------- */
export async function approveRequest(input: {
  slotId: string;
  title: string;
  meetingType: SessionType;
  meetingLink?: string;
  description?: string;
}): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can approve requests." };
  if (!input.title?.trim()) return { ok: false, error: "A session title is required." };

  const { data: slot } = await supabase
    .from("mentor_availability")
    .select("id, mentor_id, starts_at, ends_at, status, requested_by, session_id")
    .eq("id", input.slotId)
    .eq("mentor_id", user.id)
    .single();
  if (!slot) return { ok: false, error: "Slot not found." };
  if (!canApprove(slot)) return { ok: false, error: "Only a pending request can be approved." };
  if (!slot.requested_by) return { ok: false, error: "This slot has no pending request." };

  // Find the active mentorship so the session can be linked.
  const { data: mentorship } = await supabase
    .from("mentorships")
    .select("id")
    .eq("mentor_id", user.id)
    .eq("mentee_id", slot.requested_by)
    .eq("status", "active")
    .maybeSingle();
  if (!mentorship) {
    return { ok: false, error: "No active mentorship with this mentee." };
  }

  const start = new Date(slot.starts_at);
  const end = new Date(slot.ends_at);
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

  let sessionId: string;
  try {
    const result = await createSession({
      mentorship_id: mentorship.id,
      mentor_id: user.id,
      mentee_id: slot.requested_by,
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      duration_minutes: durationMinutes,
      meeting_type: input.meetingType,
      meeting_link: input.meetingLink?.trim() || undefined,
    });
    sessionId = result.session.id;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not create the session.",
    };
  }

  const { error } = await supabase
    .from("mentor_availability")
    .update({
      status: "booked",
      session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.slotId)
    .eq("mentor_id", user.id);
  if (error) return { ok: false, error: error.message };

  await notifyUser(
    slot.requested_by,
    "booking_approved",
    "Booking approved",
    `Your requested time was approved and a session "${input.title.trim()}" was scheduled.`,
    sessionId,
  );

  revalidate();
  return { ok: true };
}

/* ---------- Mentor: decline a pending request (reopens the slot) ---------- */
export async function declineRequest(slotId: string): Promise<Result> {
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return { ok: false, error: "Unauthorized" };
  if (role !== "mentor") return { ok: false, error: "Only mentors can decline requests." };

  const { data: slot } = await supabase
    .from("mentor_availability")
    .select("id, status, requested_by")
    .eq("id", slotId)
    .eq("mentor_id", user.id)
    .single();
  if (!slot) return { ok: false, error: "Slot not found." };
  if (!canDecline(slot)) return { ok: false, error: "Only a pending request can be declined." };

  const menteeId = slot.requested_by;

  const { error } = await supabase
    .from("mentor_availability")
    .update({
      status: "open",
      requested_by: null,
      request_note: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slotId)
    .eq("mentor_id", user.id);
  if (error) return { ok: false, error: error.message };

  if (menteeId) {
    await notifyUser(
      menteeId,
      "booking_declined",
      "Booking declined",
      "Your requested time was declined. Please choose another available slot.",
      slotId,
    );
  }

  revalidate();
  return { ok: true };
}
