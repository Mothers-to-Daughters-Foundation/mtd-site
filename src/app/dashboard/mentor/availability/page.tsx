import { createClient } from "@/lib/supabase/server";
import MentorAvailabilityClient, {
  type MentorSlot,
} from "./MentorAvailabilityClient";

export const metadata = { title: "Availability" };

export default async function MentorAvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: slots } = await supabase
    .from("mentor_availability")
    .select(
      `id, starts_at, ends_at, status, request_note, requested_by,
       user_profiles!mentor_availability_requested_by_fkey ( full_name )`,
    )
    .eq("mentor_id", user.id)
    .order("starts_at", { ascending: true });

  const rows: MentorSlot[] = (slots ?? []).map((s) => {
    const profile = Array.isArray(s.user_profiles)
      ? s.user_profiles[0]
      : s.user_profiles;
    return {
      id: s.id,
      startsAt: s.starts_at,
      endsAt: s.ends_at,
      status: s.status,
      requestNote: s.request_note,
      requesterName: profile?.full_name ?? null,
    };
  });

  return <MentorAvailabilityClient slots={rows} />;
}
