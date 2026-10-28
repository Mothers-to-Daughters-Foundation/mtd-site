import type { ResourceVisibility } from "@/lib/models/resources";

/** Who a shared resource goes to. Mentors can only share with mentees. */
export type ShareAudience = Extract<
  ResourceVisibility,
  "mentee_only" | "mentor_only" | "public"
>;

export const AUDIENCE_LABELS: Record<ShareAudience, string> = {
  mentee_only: "All mentees",
  mentor_only: "All mentors",
  public: "Everyone",
};
