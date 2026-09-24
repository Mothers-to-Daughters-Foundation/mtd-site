import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAllMentorships,
  createMentorship,
  updateMentorship,
} from "@/lib/supabase/mentorships";
import { z } from "zod";

const createMatchSchema = z.object({
  mentor_id: z.string().uuid(),
  mentee_id: z.string().uuid(),
});

const updateMatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "active",
    "paused",
    "completed",
    "cancelled",
  ]),
});

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {};
}

export async function GET() {
  const auth = await requireAdmin();

  if (auth.error) return auth.error;

  try {
    const matches = await getAllMentorships();

    return NextResponse.json({ matches });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();

  if (auth.error) return auth.error;

  try {
    const body = await req.json();

    const parsed = createMatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const match = await createMentorship({
      mentor_id: parsed.data.mentor_id,
      mentee_id: parsed.data.mentee_id,
    });

    return NextResponse.json(
      { match },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();

  if (auth.error) return auth.error;

  try {
    const body = await req.json();

    const parsed = updateMatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const match = await updateMentorship(
      parsed.data.id,
      {
        status: parsed.data.status,
      }
    );

    return NextResponse.json({ match });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}