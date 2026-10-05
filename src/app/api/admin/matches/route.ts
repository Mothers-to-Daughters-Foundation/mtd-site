import { NextRequest, NextResponse } from "next/server";
import {
  getAllMentorships,
  createMentorship,
  updateMentorship,
} from "@/lib/supabase/mentorships";
import { requireAdmin } from "@/lib/auth-guards";
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

const reassignSchema = z.object({
  id: z.string().uuid(),
  mentor_id: z.string().uuid(),
});

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.ok) return auth.response;

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

  if (!auth.ok) return auth.response;

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

  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    const reassign = reassignSchema.safeParse(body);
    if (reassign.success) {
      const supabase = auth.supabase;
      const { data, error } = await supabase
        .from('mentorships')
        .update({ mentor_id: reassign.data.mentor_id })
        .eq('id', reassign.data.id)
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ match: data });
    }

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