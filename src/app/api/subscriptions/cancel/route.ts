import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_current", true)
      .maybeSingle();

    if (error) throw error;

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        is_current: false,
      })
      .eq("id", subscription.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("[subscriptions/cancel POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
