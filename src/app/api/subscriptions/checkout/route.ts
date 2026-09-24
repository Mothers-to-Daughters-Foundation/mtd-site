import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/supabase/plans";
import { getUserById } from "@/lib/supabase/users";
import getStripe from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  tierId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
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
    const body = await req.json();

    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const plan = await getPlanById(parsed.data.tierId);

    if (!plan || !plan.is_active) {
      return NextResponse.json(
        { error: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    const profile = await getUserById(user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    /**
     * If you are no longer using Stripe,
     * remove everything below this line.
     */

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: "Stripe is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const stripe = getStripe();

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      customer_email: profile.email,

      line_items: [
        {
          price: plan.stripe_price_id ?? undefined,
          quantity: 1,
        },
      ],

      success_url:
        `${baseUrl}/dashboard/mentee/subscription?success=1`,

      cancel_url:
        `${baseUrl}/dashboard/mentee/subscription?cancelled=1`,

      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    });

    return NextResponse.json({
      provider: "stripe",
      url: checkout.url,
    });
  } catch (error) {
    console.error(
      "[subscriptions/checkout POST]",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}