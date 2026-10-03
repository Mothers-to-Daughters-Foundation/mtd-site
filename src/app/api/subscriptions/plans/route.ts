import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPublicPlans, type Plan } from "@/lib/supabase/plans";

function planFeatures(plan: Plan): string[] {
  const features = [
    plan.mentor_limit === 1
      ? "1 dedicated mentor"
      : `Up to ${plan.mentor_limit} mentors`,
    plan.session_limit == null
      ? "Unlimited sessions"
      : `${plan.session_limit} sessions per month`,
  ];
  if (plan.resource_access) features.push("Resource library access");
  if (plan.priority_support) features.push("Priority support");
  return features;
}

/**
 * Active membership plans in the shape the subscription page expects.
 * Mentee-accessible (uses the same data as the public membership page); the
 * admin tiers route returns 403 to mentees, so do not use it here.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const plans = await getPublicPlans();

    const tiers = plans.map((plan) => ({
      _id: plan.id,
      name: plan.name,
      description: plan.description ?? "",
      pricePerMonth: plan.monthly_price,
      features: planFeatures(plan),
      isActive: plan.is_active,
      zeffyUrl: plan.zeffy_url ?? undefined,
    }));

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("[subscriptions/plans GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
