import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { z } from "zod";

const createPlanSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  monthly_price: z.number().min(0),
  mentor_limit: z.number().int().min(1),
  is_active: z.boolean().default(true),
  zeffy_url: z.string().optional(),
});

export async function GET() {
  const auth = await requireAdmin();

  if (!auth.ok) return auth.response;

  const { supabase } = auth;

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("monthly_price");

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ plans: data });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();

  if (!auth.ok) return auth.response;

  const { supabase } = auth;

  const body = await req.json();

  const parsed = createPlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0].message,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("plans")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { plan: data },
    { status: 201 }
  );
}