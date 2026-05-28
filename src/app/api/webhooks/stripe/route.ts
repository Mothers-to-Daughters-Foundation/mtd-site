import { NextRequest, NextResponse } from 'next/server';
import {
  getSubscriptionByStripeId,
  createSubscription,
  updateSubscription,
  appendBillingEntry,
} from '@/lib/models/Subscription';
import { updateUserById, getUserByEmail } from '@/lib/models/User';
import getStripe from '@/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing so we can read raw body for signature verification
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  const rawBody = await req.text();

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, sig ?? '', webhookSecret);
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== 'subscription') break;

        const userId = checkoutSession.metadata?.userId;
        const tierId = checkoutSession.metadata?.tierId;
        const stripeSubscriptionId = checkoutSession.subscription as string;
        const stripeCustomerId = checkoutSession.customer as string;

        if (!userId || !tierId) break;

        // Create or update subscription record
        const existing = stripeSubscriptionId
          ? await getSubscriptionByStripeId(stripeSubscriptionId)
          : null;

        if (!existing) {
          await createSubscription({
            userId,
            tierId,
            paymentProvider: 'stripe',
            status: 'active',
            stripeSubscriptionId,
            stripeCustomerId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            billingHistory: [],
          });
        } else if (existing._id) {
          await updateSubscription(existing._id, { status: 'active' });
        }

        await updateUserById(userId, {
          subscriptionStatus: 'active',
          subscriptionTierId: tierId,
          stripeCustomerId,
          stripeSubscriptionId,
          subscriptionStartDate: new Date(),
          subscriptionRenewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = (invoice as Stripe.Invoice & { subscription?: string }).subscription ?? null;
        if (!stripeSubId) break;

        const sub = await getSubscriptionByStripeId(stripeSubId);
        if (!sub?._id) break;

        await appendBillingEntry(sub._id, {
          date: new Date((invoice.status_transitions?.paid_at ?? Date.now() / 1000) * 1000),
          amountCents: invoice.amount_paid,
          status: 'paid',
          stripeInvoiceId: invoice.id,
          description: `Invoice ${invoice.number}`,
        });

        // Update renewal date
        const periodEnd = (invoice as any).lines?.data?.[0]?.period?.end;
        if (periodEnd) {
          await updateSubscription(sub._id, {
            status: 'active',
            currentPeriodEnd: new Date(periodEnd * 1000),
          });
          await updateUserById(sub.userId, {
            subscriptionStatus: 'active',
            subscriptionRenewDate: new Date(periodEnd * 1000),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const sub = await getSubscriptionByStripeId(stripeSub.id);
        if (!sub?._id) break;

        await updateSubscription(sub._id, {
          status: 'cancelled',
          cancelledAt: new Date(),
        });
        await updateUserById(sub.userId, { subscriptionStatus: 'cancelled' });
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const sub = await getSubscriptionByStripeId(stripeSub.id);
        if (!sub?._id) break;

        const newStatus =
          stripeSub.status === 'active'
            ? 'active'
            : stripeSub.status === 'past_due'
            ? 'past_due'
            : 'paused';

        await updateSubscription(sub._id, { status: newStatus as any });
        await updateUserById(sub.userId, { subscriptionStatus: newStatus === 'past_due' ? 'active' : newStatus as any });
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe webhook] handler error', error);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }
}
