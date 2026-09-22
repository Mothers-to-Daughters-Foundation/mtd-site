"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAuditLog } from "@/lib/audit";
import { notifyUser } from "@/lib/notifications";

import type {
  SessionStatus,
  SessionType,
} from "@/lib/models/session";

/* =========================================================
   Types
========================================================= */

interface CreateSessionData {
  mentorship_id: string;
  mentor_id: string;
  mentee_id: string;

  title: string;
  description?: string;

  scheduled_start: string;
  scheduled_end: string;

  duration_minutes: number;
  timezone?: string;

  meeting_type: SessionType;
  meeting_link?: string;
  location?: string;
}

interface UpdateSessionData {
  title?: string;
  description?: string;

  scheduled_start?: string;
  scheduled_end?: string;

  duration_minutes?: number;
  timezone?: string;

  meeting_type?: SessionType;
  meeting_link?: string;
  location?: string;

  mentor_notes?: string;
  mentee_notes?: string;
}

/* =========================================================
   Helpers
========================================================= */

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    supabase,
    user,
  };
}

async function getUserRole(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return profile?.role as "admin" | "mentor" | "mentee";
}

/* =========================================================
   Create Session
========================================================= */

export async function createSession(
  data: CreateSessionData
) {
  const { supabase, user } =
    await getAuthenticatedUser();

  const role = await getUserRole(supabase);

  /*
   * Only admins and mentors can currently create
   * sessions.
   */

  if (role !== "admin" && role !== "mentor") {
    throw new Error(
      "Only admins and mentors can create sessions."
    );
  }

  if (!data.mentorship_id) {
    throw new Error("Mentorship is required.");
  }

  if (!data.mentor_id || !data.mentee_id) {
    throw new Error(
      "Both mentor and mentee are required."
    );
  }

  if (!data.title?.trim()) {
    throw new Error("Session title is required.");
  }

  if (!data.scheduled_start) {
    throw new Error(
      "Session start time is required."
    );
  }

  if (!data.scheduled_end) {
    throw new Error(
      "Session end time is required."
    );
  }

  const start = new Date(data.scheduled_start);
  const end = new Date(data.scheduled_end);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    throw new Error(
      "Invalid session date or time."
    );
  }

  if (end <= start) {
    throw new Error(
      "Session end time must be after the start time."
    );
  }

  if (data.duration_minutes <= 0) {
    throw new Error(
      "Session duration must be greater than zero."
    );
  }

  /*
   * Mentors may only create sessions involving
   * themselves.
   */

  if (
    role === "mentor" &&
    data.mentor_id !== user.id
  ) {
    throw new Error(
      "You can only create sessions assigned to yourself."
    );
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      mentorship_id: data.mentorship_id,
      mentor_id: data.mentor_id,
      mentee_id: data.mentee_id,

      title: data.title.trim(),
      description:
        data.description?.trim() || null,

      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),

      duration_minutes: data.duration_minutes,

      timezone:
        data.timezone?.trim() || "UTC",

      meeting_type: data.meeting_type,

      meeting_link:
        data.meeting_link?.trim() || null,

      location:
        data.location?.trim() || null,

      status: "scheduled",
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    userId: user.id,
    action: "create",
    tableName: "sessions",
    recordId: session.id,
    description: `Created session "${data.title}"`,
    newValues: {
      mentorship_id: data.mentorship_id,
      mentor_id: data.mentor_id,
      mentee_id: data.mentee_id,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      meeting_type: data.meeting_type,
    },
  });

  /*
   * Notify the other participant.
   */

  if (user.id === data.mentor_id) {
    await notifyUser(
      data.mentee_id,
      "session_scheduled",
      "New Session Scheduled",
      `A new session "${data.title}" has been scheduled.`,
      session.id
    );
  } else {
    await notifyUser(
      data.mentor_id,
      "session_scheduled",
      "New Session Scheduled",
      `A new session "${data.title}" has been scheduled.`,
      session.id
    );
  }

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentee");

  return {
    success: true,
    session,
  };
}

/* =========================================================
   Update Session
========================================================= */

export async function updateSession(
  id: string,
  data: UpdateSessionData
) {
  const { supabase, user } =
    await getAuthenticatedUser();

  const role = await getUserRole(supabase);

  const { data: existing, error: fetchError } =
    await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

  if (fetchError || !existing) {
    throw new Error(
      fetchError?.message ||
        "Session not found."
    );
  }

  const isAdmin = role === "admin";
  const isMentor =
    role === "mentor" &&
    existing.mentor_id === user.id;

  const isMentee =
    role === "mentee" &&
    existing.mentee_id === user.id;

  if (!isAdmin && !isMentor && !isMentee) {
    throw new Error(
      "You are not allowed to update this session."
    );
  }

  /*
   * Mentees should only update their notes.
   */

  if (isMentee && !isAdmin && !isMentor) {
    const allowedFields = [
      "mentee_notes",
    ];

    const suppliedFields =
      Object.keys(data);

    const invalidField =
      suppliedFields.find(
        (field) =>
          !allowedFields.includes(field)
      );

    if (invalidField) {
      throw new Error(
        "Mentees can only update their session notes."
      );
    }
  }

  const updatePayload: Record<
    string,
    unknown
  > = {};

  if (data.title !== undefined) {
    updatePayload.title =
      data.title.trim();
  }

  if (data.description !== undefined) {
    updatePayload.description =
      data.description.trim() || null;
  }

  if (data.scheduled_start !== undefined) {
    const start = new Date(
      data.scheduled_start
    );

    if (Number.isNaN(start.getTime())) {
      throw new Error(
        "Invalid session start time."
      );
    }

    updatePayload.scheduled_start =
      start.toISOString();
  }

  if (data.scheduled_end !== undefined) {
    const end = new Date(
      data.scheduled_end
    );

    if (Number.isNaN(end.getTime())) {
      throw new Error(
        "Invalid session end time."
      );
    }

    updatePayload.scheduled_end =
      end.toISOString();
  }

  if (data.duration_minutes !== undefined) {
    if (data.duration_minutes <= 0) {
      throw new Error(
        "Session duration must be greater than zero."
      );
    }

    updatePayload.duration_minutes =
      data.duration_minutes;
  }

  if (data.timezone !== undefined) {
    updatePayload.timezone =
      data.timezone.trim() || "UTC";
  }

  if (data.meeting_type !== undefined) {
    updatePayload.meeting_type =
      data.meeting_type;
  }

  if (data.meeting_link !== undefined) {
    updatePayload.meeting_link =
      data.meeting_link.trim() || null;
  }

  if (data.location !== undefined) {
    updatePayload.location =
      data.location.trim() || null;
  }

  if (data.mentor_notes !== undefined) {
    updatePayload.mentor_notes =
      data.mentor_notes.trim() || null;
  }

  if (data.mentee_notes !== undefined) {
    updatePayload.mentee_notes =
      data.mentee_notes.trim() || null;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error(
      "No changes were provided."
    );
  }

  updatePayload.updated_at =
    new Date().toISOString();

  const { data: updated, error } =
    await supabase
      .from("sessions")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    tableName: "sessions",
    recordId: id,
    description: `Updated session "${existing.title}"`,
    newValues: updatePayload,
  });

  /*
   * Notify the other participant when the session
   * is changed.
   */

  const recipientId =
    user.id === existing.mentor_id
      ? existing.mentee_id
      : existing.mentor_id;

  await notifyUser(
    recipientId,
    "session_updated",
    "Session Updated",
    `The session "${existing.title}" has been updated.`,
    id
  );

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentee");

  return {
    success: true,
    session: updated,
  };
}

/* =========================================================
   Confirm Session
========================================================= */

export async function confirmSession(
  id: string
) {
  const { supabase, user } =
    await getAuthenticatedUser();

  const role = await getUserRole(supabase);

  const { data: session, error: fetchError } =
    await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

  if (fetchError || !session) {
    throw new Error(
      fetchError?.message ||
        "Session not found."
    );
  }

  const isAdmin = role === "admin";

  const isParticipant =
    session.mentor_id === user.id ||
    session.mentee_id === user.id;

  if (!isAdmin && !isParticipant) {
    throw new Error(
      "You are not allowed to confirm this session."
    );
  }

  if (
    session.status !== "scheduled"
  ) {
    throw new Error(
      "Only scheduled sessions can be confirmed."
    );
  }

  const { data: updated, error } =
    await supabase
      .from("sessions")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  const recipientId =
    user.id === session.mentor_id
      ? session.mentee_id
      : session.mentor_id;

  await createAuditLog({
    userId: user.id,
    action: "update",
    tableName: "sessions",
    recordId: id,
    description: `Confirmed session "${session.title}"`,
    newValues: {
      status: "confirmed",
    },
  });

  await notifyUser(
    recipientId,
    "session_updated",
    "Session Confirmed",
    `The session "${session.title}" has been confirmed.`,
    id
  );

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentee");

  return {
    success: true,
    session: updated,
  };
}

/* =========================================================
   Cancel Session
========================================================= */

export async function cancelSession(
  id: string,
  reason?: string
) {
  const { supabase, user } =
    await getAuthenticatedUser();

  const role = await getUserRole(supabase);

  const { data: session, error: fetchError } =
    await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

  if (fetchError || !session) {
    throw new Error(
      fetchError?.message ||
        "Session not found."
    );
  }

  const isAdmin = role === "admin";

  const isParticipant =
    session.mentor_id === user.id ||
    session.mentee_id === user.id;

  if (!isAdmin && !isParticipant) {
    throw new Error(
      "You are not allowed to cancel this session."
    );
  }

  if (
    session.status === "completed" ||
    session.status === "cancelled" ||
    session.status === "no_show"
  ) {
    throw new Error(
      "This session can no longer be cancelled."
    );
  }

  const cancellationReason =
    reason?.trim() || null;

  const { data: updated, error } =
    await supabase
      .from("sessions")
      .update({
        status: "cancelled",
        cancelled_by: user.id,
        cancellation_reason:
          cancellationReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  const recipientId =
    user.id === session.mentor_id
      ? session.mentee_id
      : session.mentor_id;

  await createAuditLog({
    userId: user.id,
    action: "update",
    tableName: "sessions",
    recordId: id,
    description: `Cancelled session "${session.title}"`,
    newValues: {
      status: "cancelled",
      cancelled_by: user.id,
      cancellation_reason:
        cancellationReason,
    },
  });

  await notifyUser(
    recipientId,
    "session_cancelled",
    "Session Cancelled",
    `The session "${session.title}" has been cancelled.`,
    id
  );

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentee");

  return {
    success: true,
    session: updated,
  };
}

/* =========================================================
   Complete Session
========================================================= */

export async function completeSession(
  id: string
) {
  const { supabase, user } =
    await getAuthenticatedUser();

  const role = await getUserRole(supabase);

  const { data: session, error: fetchError } =
    await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

  if (fetchError || !session) {
    throw new Error(
      fetchError?.message ||
        "Session not found."
    );
  }

  const isAdmin = role === "admin";

  const isMentor =
    role === "mentor" &&
    session.mentor_id === user.id;

  if (!isAdmin && !isMentor) {
    throw new Error(
      "Only the assigned mentor or an admin can complete a session."
    );
  }

  if (
    session.status !== "scheduled" &&
    session.status !== "confirmed"
  ) {
    throw new Error(
      "Only scheduled or confirmed sessions can be completed."
    );
  }

  const { data: updated, error } =
    await supabase
      .from("sessions")
      .update({
        status: "completed",
        completed_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    tableName: "sessions",
    recordId: id,
    description: `Completed session "${session.title}"`,
    newValues: {
      status: "completed",
    },
  });

  await notifyUser(
    session.mentee_id,
    "session_updated",
    "Session Completed",
    `The session "${session.title}" has been marked as completed.`,
    id
  );

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentee");

  return {
    success: true,
    session: updated,
  };
}

/* =========================================================
   Mark Session As No-Show
========================================================= */

export async function markSessionNoShow(
  id: string
) {
  const { supabase, user } =
    await getAuthenticatedUser();

  const role = await getUserRole(supabase);

  if (role !== "admin" && role !== "mentor") {
    throw new Error(
      "Only admins and mentors can mark a session as no-show."
    );
  }

  const { data: session, error: fetchError } =
    await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

  if (fetchError || !session) {
    throw new Error(
      fetchError?.message ||
        "Session not found."
    );
  }

  if (
    role === "mentor" &&
    session.mentor_id !== user.id
  ) {
    throw new Error(
      "You can only update your own sessions."
    );
  }

  if (
    session.status !== "scheduled" &&
    session.status !== "confirmed"
  ) {
    throw new Error(
      "Only scheduled or confirmed sessions can be marked as no-show."
    );
  }

  const { data: updated, error } =
    await supabase
      .from("sessions")
      .update({
        status: "no_show",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  await createAuditLog({
    userId: user.id,
    action: "update",
    tableName: "sessions",
    recordId: id,
    description: `Marked session "${session.title}" as no-show`,
    newValues: {
      status: "no_show",
    },
  });

  await notifyUser(
    session.mentee_id,
    "session_updated",
    "Session Marked as No-Show",
    `The session "${session.title}" was marked as a no-show.`,
    id
  );

  revalidatePath("/dashboard/sessions");
  revalidatePath("/dashboard/mentor");
  revalidatePath("/dashboard/mentee");

  return {
    success: true,
    session: updated,
  };
}