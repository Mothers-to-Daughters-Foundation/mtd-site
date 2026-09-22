import { createClient } from "@/lib/supabase/server";

/* =========================================================
   Session Types
========================================================= */

export type SessionType =
  | "google_meet"
  | "zoom"
  | "microsoft_teams"
  | "phone"
  | "in_person"
  | "other";

export type SessionStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

/* =========================================================
   Session Interface
========================================================= */

export interface Session {
  id: string;

  mentorship_id: string;

  mentor_id: string;

  mentee_id: string;

  title: string;

  description: string | null;

  scheduled_start: string;

  scheduled_end: string;

  duration_minutes: number;

  timezone: string;

  meeting_type: SessionType;

  meeting_link: string | null;

  location: string | null;

  status: SessionStatus;

  mentor_notes: string | null;

  mentee_notes: string | null;

  cancelled_by: string | null;

  cancellation_reason: string | null;

  completed_at: string | null;

  created_at: string;

  updated_at: string;
}

/* =========================================================
   Get All Sessions For Current User
========================================================= */

export async function getMySessions(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .order("scheduled_start", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Session[];
}

/* =========================================================
   Get Upcoming Sessions
========================================================= */

export async function getUpcomingSessions(userId: string) {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .eq("status", "scheduled")
    .gte("scheduled_start", now)
    .order("scheduled_start", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Session[];
}

/* =========================================================
   Get Past Sessions
========================================================= */

export async function getPastSessions(userId: string) {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .or(
      `scheduled_start.lt.${now},status.eq.completed,status.eq.cancelled,status.eq.no_show`
    )
    .order("scheduled_start", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Session[];
}

/* =========================================================
   Get Single Session
========================================================= */

export async function getSessionById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Session;
}

/* =========================================================
   Get Sessions For A Mentorship
========================================================= */

export async function getMentorshipSessions(
  mentorshipId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("mentorship_id", mentorshipId)
    .order("scheduled_start", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as Session[];
}