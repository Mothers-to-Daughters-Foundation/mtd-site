import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSubscriptionByUserId } from '@/lib/models/Subscription';
import { getTierById } from '@/lib/models/SubscriptionTier';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscription = await getSubscriptionByUserId(session.user.id);
    if (!subscription) {
      return NextResponse.json({ subscription: null, tier: null });
    }

    const tier = await getTierById(subscription.tierId);
    return NextResponse.json({ subscription, tier });
  } catch (error) {
    console.error('[subscriptions/me GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
