"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { activateSubscription } from "@/lib/supabase/subscriptions";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user : null;
}

export async function adminActivateSubscription(input: {
  userId: string;
  planId: string;
  billingCycle: "monthly" | "yearly";
}): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const result = await activateSubscription(input);
  if (result.ok) revalidatePath("/dashboard/admin/subscriptions");
  return result;
}

export async function adminCancelSubscription(
  subscriptionId: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Forbidden" };

  const client = createAdminClient();
  const { error } = await client
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      is_current: false,
    })
    .eq("id", subscriptionId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/admin/subscriptions");
  return { ok: true };
}
