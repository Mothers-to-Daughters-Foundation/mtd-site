import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateSubscription } from "@/lib/supabase/subscriptions";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    userId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    planId: z.string().uuid(),
    billingCycle: z.enum(["monthly", "yearly"]).optional(),
  })
  .refine((b) => b.userId || b.email, {
    message: "Either userId or email is required.",
  });

export async function POST(req: NextRequest) {
  const secret = process.env.ZEFFY_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-zeffy-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  let userId = parsed.data.userId ?? null;
  if (!userId && parsed.data.email) {
    const { data: profile } = await admin
      .from("user_profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    userId = profile.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const result = await activateSubscription({
    userId,
    planId: parsed.data.planId,
    billingCycle: parsed.data.billingCycle,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
