import { createClient } from "@/lib/supabase/server";
import MenteeAvailabilityClient, {
  type MenteeSlot,
} from "./MenteeAvailabilityClient";

export const metadata = { title: "Availability" };

export default async function MenteeAvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Find the mentee's active mentor(s).
  const { data: mentorships } = await supabase
    .from("mentorships")
    .select("mentor_id")
    .eq("mentee_id", user.id)
    .eq("status", "active");
  const mentorIds = (mentorships ?? []).map((m) => m.mentor_id);

  let slots: MenteeSlot[] = [];
  if (mentorIds.length) {
    // RLS lets the mentee read their mentor's slots. Show open slots plus the
    // mentee's own pending/booked ones.
    const { data } = await supabase
      .from("mentor_availability")
      .select("id, starts_at, ends_at, status, requested_by")
      .in("mentor_id", mentorIds)
      .order("starts_at", { ascending: true });

    slots = (data ?? [])
      .filter(
        (s) => s.status === "open" || s.requested_by === user.id,
      )
      .map((s) => ({
        id: s.id,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        status: s.status,
        isMine: s.requested_by === user.id,
      }));
  }

  return (
    <MenteeAvailabilityClient slots={slots} hasMentor={mentorIds.length > 0} />
  );
}
