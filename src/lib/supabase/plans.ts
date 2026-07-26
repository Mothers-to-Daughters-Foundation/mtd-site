import { createClient } from "./server";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;

  monthly_price: number;
  yearly_price: number | null;

  mentor_limit: number;
  session_limit: number | null;

  resource_access: boolean;
  priority_support: boolean;

  is_active: boolean;

  stripe_price_id: string |null;
  zeffy_url: string | null;

  created_at: string;
  updated_at: string;
}

export async function getAllPlans() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("monthly_price");

  if (error) throw error;

  return data as Plan[];
}

export async function getPlanById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  return data as Plan;
}

/**
 * Update a subscription plan
 */
export async function updatePlan(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    description: string;
    pricePerMonth: number;
    isActive: boolean;
    maxMentees: number;
  }>
) {
  const supabase = await createClient();

  const dbUpdates: Record<string, any> = {};

  if (updates.name !== undefined)
    dbUpdates.name = updates.name;

  if (updates.slug !== undefined)
    dbUpdates.slug = updates.slug;

  if (updates.description !== undefined)
    dbUpdates.description = updates.description;

  if (updates.pricePerMonth !== undefined)
    dbUpdates.monthly_price = updates.pricePerMonth;

  if (updates.isActive !== undefined)
    dbUpdates.is_active = updates.isActive;

  if (updates.maxMentees !== undefined)
    dbUpdates.mentor_limit = updates.maxMentees;

  const { data, error } = await supabase
    .from("plans")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as Plan;
}

/**
 * Soft deactivate a plan
 */
export async function deactivatePlan(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("plans")
    .update({
      is_active: false,
    })
    .eq("id", id);

  if (error) throw error;

  return true;
}