import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  checkCanRemove,
  deleteUserCompletely,
  setUserActive,
} from "@/lib/supabase/user-admin";
import { createAuditLog } from "@/lib/audit";
import { activateSubscription } from "@/lib/supabase/subscriptions";
import { z } from "zod";

const schema = z.union([
  z.object({ role: z.enum(["admin", "mentor", "mentee"]) }),
  z.object({ active: z.boolean() }),
  z.object({ planId: z.string().uuid() }),
]);

const deleteSchema = z.object({ confirmEmail: z.string().trim().min(1) });

type Ctx = { params: { id: string } };

/** Change a user's role, or deactivate / reactivate them. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const admin = createAdminClient();
  const body = parsed.data;

  // Put a member on a plan by hand, e.g. after a Zeffy payment the site
  // couldn't match. Takes effect on their next page load.
  if ("planId" in body) {
    const result = await activateSubscription({ userId: params.id, planId: body.planId });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    await createAuditLog({
      userId: auth.user.id,
      action: "set_user_plan",
      tableName: "subscriptions",
      recordId: params.id,
      description: "Set a member's plan",
      newValues: { planId: body.planId },
    });
    return NextResponse.json({ planId: body.planId, status: "active" });
  }

  // Deactivating, or taking away admin, must not lock the panel out.
  const removing = "active" in body ? !body.active : body.role !== "admin";
  if (removing) {
    const guard = await checkCanRemove(admin, auth.user.id, params.id);
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  if ("active" in body) {
    const { error } = await setUserActive(admin, params.id, body.active);
    if (error) return NextResponse.json({ error }, { status: 500 });
    await createAuditLog({
      userId: auth.user.id,
      action: body.active ? "reactivate_user" : "deactivate_user",
      tableName: "user_profiles",
      recordId: params.id,
      description: body.active ? "Reactivated a user" : "Deactivated a user",
    });
    return NextResponse.json({ active: body.active });
  }

  const { data, error } = await auth.supabase
    .from("user_profiles")
    .update({ role: body.role })
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * Permanently delete a user and their data. The admin must retype the user's
 * email, so a stray click can't do it.
 */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Type the user's email to confirm." }, { status: 400 });
  }

  const admin = createAdminClient();
  const guard = await checkCanRemove(admin, auth.user.id, params.id);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { data: target } = await admin.auth.admin.getUserById(params.id);
  const email = target?.user?.email ?? "";
  if (!email || email.toLowerCase() !== parsed.data.confirmEmail.toLowerCase()) {
    return NextResponse.json({ error: "The email doesn't match this user." }, { status: 400 });
  }

  const { error } = await deleteUserCompletely(admin, params.id);
  if (error) {
    console.error("[admin/users DELETE]", params.id, error);
    return NextResponse.json({ error }, { status: 500 });
  }

  // No name or email in the log: the point of deleting is that it's gone.
  await createAuditLog({
    userId: auth.user.id,
    action: "delete_user",
    tableName: "user_profiles",
    recordId: params.id,
    description: "Permanently deleted a user and their data",
  });

  return NextResponse.json({ deleted: true });
}
