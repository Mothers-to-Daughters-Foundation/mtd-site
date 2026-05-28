import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSubscriptionByUserId, updateSubscription } from '@/lib/models/Subscription';
import { updateUserById } from '@/lib/models/User';
import getStripe from '@/lib/stripe';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await getSubscriptionByUserId(session.user.id);
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    if (subscription.stripeSubscriptionId) {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Mark subscription as cancelled in DB
    if (subscription._id) {
      await updateSubscription(subscription._id, {
        status: 'cancelled',
        cancelledAt: new Date(),
      });
    }

    // Update user record
    await updateUserById(session.user.id, {
      subscriptionStatus: 'cancelled',
    });

    return NextResponse.json({ message: 'Subscription cancelled' });
  } catch (error) {
    console.error('[subscriptions/cancel POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
