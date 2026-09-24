import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMentorshipByMentee } from "@/lib/supabase/mentorships";
import { getUserById } from "@/lib/supabase/users";

export async function GET() {
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Verify mentee role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "mentee") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const mentorship = await getMentorshipByMentee(user.id);

    if (!mentorship) {
      return NextResponse.json({
        mentor: null,
      });
    }

    const mentor = await getUserById(
      mentorship.mentor_id
    );

    if (!mentor) {
      return NextResponse.json({
        mentor: null,
      });
    }

    return NextResponse.json({
      mentor,
      matchStatus: mentorship.status,
    });
  } catch (error) {
    console.error(
      "[mentee/mentor GET]",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}