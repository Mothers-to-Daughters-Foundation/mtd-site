import { createClient } from "@/lib/supabase/server";

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  description: string;
  created_at: string;
}

export async function getRecentAuditLogs(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      user_id,
      action,
      table_name,
      record_id,
      description,
      created_at
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as AuditLog[];
}