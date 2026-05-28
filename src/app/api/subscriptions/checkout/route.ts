import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getTierById } from '@/lib/models/SubscriptionTier';
import { getUserById } from '@/lib/models/User';
import getStripe from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  tierId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const tier = await getTierById(parsed.data.tierId);
    if (!tier || !tier.isActive) {
      return NextResponse.json({ error: 'Tier not found or inactive' }, { status: 404 });
    }

    // If tier uses Zeffy, return the Zeffy URL
    if (tier.zeffyUrl) {
      return NextResponse.json({ provider: 'zeffy', url: tier.zeffyUrl });
    }

    if (!tier.stripePriceId) {
      return NextResponse.json({ error: 'Tier has no payment method configured' }, { status: 400 });
    }

    const stripe = getStripe();
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/mtd-site';

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.stripeCustomerId ? undefined : user.email,
      customer: user.stripeCustomerId ?? undefined,
      line_items: [
        {
          price: tier.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}${basePath}/dashboard/mentee/subscription?success=1`,
      cancel_url: `${baseUrl}${basePath}/dashboard/mentee/subscription?cancelled=1`,
      metadata: {
        userId: session.user.id,
        tierId: parsed.data.tierId,
      },
    });

    return NextResponse.json({ provider: 'stripe', url: stripeSession.url });
  } catch (error) {
    console.error('[subscriptions/checkout POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
