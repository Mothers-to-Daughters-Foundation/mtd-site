import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { getSubscriptionByUserId } from "@/lib/supabase/subscriptions";
import { getPlanById } from "@/lib/supabase/plans";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const subscription =
      await getSubscriptionByUserId(user.id);

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        plan: null,
      });
    }

    const plan = await getPlanById(
      subscription.plan_id
    );

    return NextResponse.json({
      subscription,
      plan,
    });
  } catch (error) {
    console.error(
      "[subscriptions/me GET]",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}