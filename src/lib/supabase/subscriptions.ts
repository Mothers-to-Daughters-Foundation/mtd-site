import { createClient } from "./server";
import { createAdminClient } from "./admin";
import { computeExpiry } from "@/lib/subscription-expiry";
import { autoMatchMentee } from "@/lib/matching-service";



export interface Subscription {
  id: string;

  user_id: string;

  plan_id: string;

  status:
    | "active"
    | "trial"
    | "expired"
    | "paused"
    | "cancelled";

  billing_cycle: "monthly" | "yearly";

  started_at: string;

  expires_at: string | null;

  cancelled_at: string | null;

  auto_renew: boolean;

  is_current: boolean;

  created_at: string;

  updated_at: string;
}

export async function getAllSubscriptions() {
  // Admin-only report (the page is role-guarded). subscriptions has no
  // admin-all RLS policy, so read with the service role to see every row.
  const supabase = createAdminClient();

  const { data, error } = await supabase
  .from("subscriptions")
  .select(`
    *,
    user_profiles!subscriptions_user_fkey(
      id,
      full_name,
      email
    ),
    plans!subscriptions_plan_fkey(
      id,
      name
    )
  `)
  .order("created_at", { ascending: false });

  if (error) {
  console.error("Subscriptions Error:", error);
  throw error;
}


  return data ?? [];
}

export async function getSubscriptionByUserId(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();

  if (error) throw error;

  return data;
}


export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

/**
 * Canonical "mark a mentee's subscription active" path. Used by the Zeffy stub
 * webhook and by the admin manual-activation control. Upserts the user's
 * current subscription as active, deactivates any older current rows, and
 * triggers auto-matching. Never throws — returns { ok, error? }.
 */
export async function activateSubscription(input: {
  userId: string;
  planId: string;
  billingCycle?: "monthly" | "yearly";
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const cycle = input.billingCycle ?? "monthly";

    const { data: plan } = await admin
      .from("plans")
      .select("id, is_active")
      .eq("id", input.planId)
      .maybeSingle();
    if (!plan || !plan.is_active) {
      return { ok: false, error: "Plan not found or inactive." };
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAt = computeExpiry(now, cycle);

    const { data: existing } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", input.userId)
      .eq("is_current", true)
      .maybeSingle();

    const fields = {
      user_id: input.userId,
      plan_id: input.planId,
      status: "active" as const,
      billing_cycle: cycle,
      expires_at: expiresAt,
      cancelled_at: null,
      auto_renew: true,
      is_current: true,
      updated_at: nowIso,
    };

    let currentId: string;
    if (existing?.id) {
      const { data: updated, error } = await admin
        .from("subscriptions")
        .update(fields)
        .eq("id", existing.id)
        .select("id")
        .single();
      if (error || !updated) {
        return { ok: false, error: error?.message ?? "Update failed." };
      }
      currentId = updated.id;
    } else {
      const { data: inserted, error } = await admin
        .from("subscriptions")
        .insert({ ...fields, started_at: nowIso })
        .select("id")
        .single();
      if (error || !inserted) {
        return { ok: false, error: error?.message ?? "Insert failed." };
      }
      currentId = inserted.id;
    }

    const { error: deactivateError } = await admin
      .from("subscriptions")
      .update({ is_current: false })
      .eq("user_id", input.userId)
      .neq("id", currentId)
      .eq("is_current", true);
    if (deactivateError) {
      return { ok: false, error: deactivateError.message };
    }

    void autoMatchMentee(input.userId).catch((e) =>
      console.error("[activateSubscription auto-match]", e)
    );

    return { ok: true };
  } catch (error) {
    console.error("[activateSubscription]", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Activation failed.",
    };
  }
}