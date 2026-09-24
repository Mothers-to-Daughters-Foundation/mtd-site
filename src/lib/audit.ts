import { createClient } from "@/lib/supabase/server";

interface AuditLogData {
  userId?: string | null;
  action: string;
  tableName: string;
  recordId?: string | null;
  description: string;
  oldValues?: unknown;
  newValues?: unknown;
}

export async function createAuditLog({
  userId,
  action,
  tableName,
  recordId,
  description,
  oldValues,
  newValues,
}: AuditLogData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("audit_logs")
    .insert({
      user_id: userId ?? null,
      action,
      table_name: tableName,
      record_id: recordId ?? null,
      description,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
    });

  if (error) {
    console.error("Audit log failed:", error);
  }
}


export async function getRecentActivity(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}