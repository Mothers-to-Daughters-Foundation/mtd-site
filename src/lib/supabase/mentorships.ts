import { createClient } from "./server";

export interface Mentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: "active" | "paused" | "completed" | "cancelled";
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

export async function getAllMentorships() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mentorships")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Mentorship[];
}

export async function getMentorshipsByMentor(mentorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mentorships")
    .select("*")
    .eq("mentor_id", mentorId);

  if (error) throw error;

  return data as Mentorship[];
}

export async function getMentorshipByMentee(menteeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mentorships")
    .select("*")
    .eq("mentee_id", menteeId)
    .maybeSingle();

  if (error) return null;

  return data as Mentorship | null;
}

export async function createMentorship(data: {
  mentor_id: string;
  mentee_id: string;
}) {
  const supabase = await createClient();

  const { data: result, error } = await supabase
    .from("mentorships")
    .insert({
      mentor_id: data.mentor_id,
      mentee_id: data.mentee_id,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  return result;
}


export async function updateMentorship(
  id: string,
  updates: {
    status?: string;
  }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mentorships")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}
