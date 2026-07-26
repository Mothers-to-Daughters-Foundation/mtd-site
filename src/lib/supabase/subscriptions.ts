import { createClient } from "./server";



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

  stripe_subscription_id: string | null;

  created_at: string;

  updated_at: string;
}

export async function getAllSubscriptions() {
  const supabase = await createClient();

  const { data, error } = await supabase
  .from("subscriptions")
  .select(`
    *,
    user_profiles!subscriptions_user_fkey(
      id,
      full_name
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


  return data;
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