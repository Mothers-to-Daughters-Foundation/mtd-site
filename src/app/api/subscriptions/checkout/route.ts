import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/supabase/plans";
import { z } from "zod";

const checkoutSchema = z.object({
  tierId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const plan = await getPlanById(parsed.data.tierId);
    if (!plan || !plan.is_active) {
      return NextResponse.json(
        { error: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    if (!plan.zeffy_url) {
      return NextResponse.json(
        { error: "This plan has no Zeffy link configured. An admin must set its Zeffy payment link." },
        { status: 400 }
      );
    }

    return NextResponse.json({ provider: "zeffy", zeffyUrl: plan.zeffy_url });
  } catch (error) {
    console.error("[subscriptions/checkout POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
