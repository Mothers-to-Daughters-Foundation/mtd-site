import { NextRequest, NextResponse } from "next/server";
import {
  getAllUsers,
  getUsersByRole,
} from "@/lib/supabase/users";
import { requireAdmin } from "@/lib/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { rollbackNewUser, saveNewUserProfile } from "@/lib/supabase/new-user";
import {
  CAREER_GOAL_OPTIONS,
  INTEREST_CATEGORIES,
  MOTIVATION_OPTIONS,
  OPPORTUNITY_OPTIONS,
  SUCCESS_OPTIONS,
  optionValues,
} from "@/lib/onboarding-options";
import { z } from "zod";

const createMentorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Temporary password must be at least 8 characters"),
  careerAreas: z.array(z.enum(INTEREST_CATEGORIES)).default([]),
  motivations: z.array(z.enum(optionValues(MOTIVATION_OPTIONS))).default([]),
  careerGoals: z.array(z.enum(optionValues(CAREER_GOAL_OPTIONS))).default([]),
  successValues: z.array(z.enum(optionValues(SUCCESS_OPTIONS))).default([]),
  opportunityValues: z.array(z.enum(optionValues(OPPORTUNITY_OPTIONS))).default([]),
  expertise: z.string().trim().max(500).optional(),
  bio: z.string().trim().max(2000).optional(),
  maxMentees: z.number().int().positive().nullable().default(null),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role") as
      | "admin"
      | "mentor"
      | "mentee"
      | null;

    const users = role
      ? await getUsersByRole(role)
      : await getAllUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[admin/users GET]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Create a mentor account. Mentors cannot self-register; an admin sets up the
 * login, matching profile and capacity, then shares the temporary password.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const parsed = createMentorSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const {
      name,
      email,
      password,
      careerAreas,
      motivations,
      careerGoals,
      successValues,
      opportunityValues,
      expertise,
      bio,
      maxMentees,
    } = parsed.data;

    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authError || !authData.user) {
      const exists =
        authError?.code === "email_exists" || /already/i.test(authError?.message ?? "");
      return NextResponse.json(
        {
          error: exists
            ? "An account with this email already exists"
            : authError?.message ?? "Could not create the account",
        },
        { status: exists ? 409 : 400 }
      );
    }

    const { error: profileError } = await saveNewUserProfile(admin, {
      id: authData.user.id,
      full_name: name,
      role: "mentor",
      career_areas: careerAreas,
      motivations,
      career_goals: careerGoals,
      success_values: successValues,
      opportunity_values: opportunityValues,
      expertise: expertise || null,
      bio: bio || null,
      max_mentees: maxMentees,
    });

    if (profileError) {
      console.error("[admin/users POST] profile", profileError);
      await rollbackNewUser(admin, authData.user.id);
      return NextResponse.json(
        { error: "Failed to create the mentor profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { user: { id: authData.user.id, name, email, role: "mentor" } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[admin/users POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
