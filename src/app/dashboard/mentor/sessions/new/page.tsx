import { createClient } from "@/lib/supabase/server";
import ScheduleSessionForm from "../ScheduleSessionForm";

export const metadata = {
  title: "Schedule Session",
};

export default async function NewSessionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  /*
   * Get the mentor's active mentorship relationships.
   *
   * Each mentorship gives us:
   * - mentorship.id
   * - mentee_id
   * - mentee profile name
   *
   * The mentorship ID is kept internally and will be
   * automatically submitted when the mentor selects
   * a mentee.
   */
  const { data: mentorships, error } = await supabase
    .from("mentorships")
    .select(`
      id,
      mentee_id,
      user_profiles!mentorships_mentee_id_fkey (
        id,
        full_name
      )
    `)
    .eq("mentor_id", user.id)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  const mentees =
    mentorships?.map((mentorship) => {
      const profile = Array.isArray(
        mentorship.user_profiles
      )
        ? mentorship.user_profiles[0]
        : mentorship.user_profiles;

      return {
        id: mentorship.mentee_id,
        full_name: profile?.full_name ?? null,
        mentorship_id: mentorship.id,
      };
    }) ?? [];

  return (
    <ScheduleSessionForm
      mentorId={user.id}
      mentees={mentees}
    />
  );
}