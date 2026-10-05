import { NextRequest, NextResponse } from "next/server";
import {
  getPlanById,
  updatePlan,
  deactivatePlan,
} from "@/lib/supabase/plans";
import { requireAdmin } from "@/lib/auth-guards";
import { z } from "zod";

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
  pricePerMonth: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  maxMentees: z.number().min(1).optional(),
  zeffyUrl: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    const parsed = updatePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const plan = await updatePlan(
      params.id,
      parsed.data
    );

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("[admin/plans PATCH]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();

  if (!auth.ok) return auth.response;

  try {
    const plan = await getPlanById(params.id);

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    await deactivatePlan(params.id);

    return NextResponse.json({
      message: "Plan deactivated",
    });
  } catch (error) {
    console.error("[admin/plans DELETE]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}