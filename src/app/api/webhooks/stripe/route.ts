import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import getStripe from '@/lib/stripe';
import Stripe from 'stripe';

// Disable body parsing so we can read raw body for signature verification
export const runtime = 'nodejs';

function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'trial' | 'expired' | 'paused' | 'cancelled' {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trial';
    case 'past_due':
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      return 'expired';
    case 'paused':
      return 'paused';
    case 'canceled':
      return 'cancelled';
    default:
      return 'expired';
  }
}

function getCurrentPeriodEndSeconds(sub: Stripe.Subscription) {
  const maybeWithPeriodEnd = sub as Stripe.Subscription & {
    current_period_end?: number;
  };
  return maybeWithPeriodEnd.current_period_end ?? null;
}

function getBillingCycle(sub: Stripe.Subscription): 'monthly' | 'yearly' {
  const interval = sub.items.data[0]?.price?.recurring?.interval;
  return interval === 'year' ? 'yearly' : 'monthly';
}

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
    const supabase = createAdminClient();
    const stripe = getStripe();

    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode !== 'subscription') break;

        const userId = checkoutSession.metadata?.userId;
        // Checkout sends `planId`; `tierId` is accepted for sessions created by older code.
        const planId =
          checkoutSession.metadata?.planId ?? checkoutSession.metadata?.tierId;
        const stripeSubscriptionId = checkoutSession.subscription as string;

        if (!userId || !planId || !stripeSubscriptionId) break;

        const stripeSubResponse = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        if ('deleted' in stripeSubResponse && stripeSubResponse.deleted) break;
        const stripeSub = stripeSubResponse as Stripe.Subscription;
        const currentPeriodEnd = getCurrentPeriodEndSeconds(stripeSub);
        const periodEndIso = currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null;
        const nowIso = new Date().toISOString();

        const { data: existing, error: existingError } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', stripeSubscriptionId)
          .maybeSingle();
        if (existingError) throw existingError;

        let currentSubscriptionId: string;

        if (existing?.id) {
          const { data: updated, error: updateError } = await supabase
            .from('subscriptions')
            .update({
              user_id: userId,
              plan_id: planId,
              status: mapStripeStatus(stripeSub.status),
              billing_cycle: getBillingCycle(stripeSub),
              expires_at: periodEndIso,
              cancelled_at: null,
              auto_renew: true,
              is_current: true,
              updated_at: nowIso,
            })
            .eq('id', existing.id)
            .select('id')
            .single();
          if (updateError || !updated) {
            throw updateError ?? new Error('Failed to update subscription');
          }
          currentSubscriptionId = updated.id;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan_id: planId,
              status: mapStripeStatus(stripeSub.status),
              billing_cycle: getBillingCycle(stripeSub),
              started_at: nowIso,
              expires_at: periodEndIso,
              cancelled_at: null,
              auto_renew: true,
              is_current: true,
              stripe_subscription_id: stripeSubscriptionId,
            })
            .select('id')
            .single();
          if (insertError || !inserted) {
            throw insertError ?? new Error('Failed to insert subscription');
          }
          currentSubscriptionId = inserted.id;
        }

        const { error: deactivateError } = await supabase
          .from('subscriptions')
          .update({ is_current: false })
          .eq('user_id', userId)
          .neq('id', currentSubscriptionId)
          .eq('is_current', true);
        if (deactivateError) throw deactivateError;
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = (invoice as Stripe.Invoice & { subscription?: string }).subscription ?? null;
        if (!stripeSubId) break;
        const stripeSubResponse = await stripe.subscriptions.retrieve(stripeSubId);
        if ('deleted' in stripeSubResponse && stripeSubResponse.deleted) break;
        const stripeSub = stripeSubResponse as Stripe.Subscription;
        const mappedStatus = mapStripeStatus(stripeSub.status);
        const firstLine = invoice.lines?.data?.[0] as
          | Stripe.InvoiceLineItem
          | undefined;
        const periodEnd = firstLine?.period?.end;
        const updates: Record<string, unknown> = {
          status: mappedStatus,
          cancelled_at:
            mappedStatus === 'cancelled'
              ? new Date().toISOString()
              : null,
          auto_renew: !stripeSub.cancel_at_period_end,
          is_current: mappedStatus !== 'cancelled',
          updated_at: new Date().toISOString(),
        };
        if (periodEnd) {
          updates.expires_at = new Date(periodEnd * 1000).toISOString();
        }

        const { error: invoiceUpdateError } = await supabase
          .from('subscriptions')
          .update(updates)
          .eq('stripe_subscription_id', stripeSubId);
        if (invoiceUpdateError) throw invoiceUpdateError;
        break;
      }

      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const { error: deletedUpdateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            auto_renew: false,
            is_current: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSub.id);
        if (deletedUpdateError) throw deletedUpdateError;
        break;
      }

      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const mappedStatus = mapStripeStatus(stripeSub.status);
        const currentPeriodEnd = getCurrentPeriodEndSeconds(stripeSub);
        const { error: updatedSubscriptionError } = await supabase
          .from('subscriptions')
          .update({
            status: mappedStatus,
            expires_at: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null,
            cancelled_at:
              mappedStatus === 'cancelled'
                ? new Date().toISOString()
                : null,
            auto_renew: !stripeSub.cancel_at_period_end,
            is_current: mappedStatus !== 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', stripeSub.id);
        if (updatedSubscriptionError) throw updatedSubscriptionError;
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
