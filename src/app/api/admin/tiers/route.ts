import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { z } from "zod";
import { normalizeZeffyInput } from "@/lib/zeffy";

// Matches what the admin Tiers editor sends (price in cents).
const createPlanSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().optional(),
  pricePerMonth: z.number().min(0),
  maxMentees: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  zeffyUrl: z.string().optional(),
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

  const input = parsed.data;
  const row: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    monthly_price: input.pricePerMonth,
    mentor_limit: input.maxMentees,
    is_active: input.isActive,
  };
  if (input.zeffyUrl !== undefined) {
    const zeffyUrl = normalizeZeffyInput(input.zeffyUrl);
    if (zeffyUrl === null) {
      return NextResponse.json({ error: "Zeffy link must be a zeffy.com address, or paste the embed code Zeffy gives you." }, { status: 400 });
    }
    row.zeffy_url = zeffyUrl;
  }

  const { data, error } = await supabase
    .from("plans")
    .insert(row)
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