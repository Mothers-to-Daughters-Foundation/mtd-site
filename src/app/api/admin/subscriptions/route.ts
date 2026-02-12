import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllSubscriptions,
  getSubscriptionStats,
  createSubscription,
  updateSubscription,
} from '@/lib/models/Subscription';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = await getSubscriptionStats();
      return NextResponse.json(stats);
    }

    const subscriptions = await getAllSubscriptions();
    return NextResponse.json(subscriptions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, type, amount, currency, paymentMethod } = body;

    if (!userId || !type || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const startDate = new Date();
    let endDate: Date | undefined;
    
    if (type === 'monthly') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (type === 'yearly') {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await createSubscription({
      userId,
      status: 'active',
      type,
      startDate,
      endDate,
      amount,
      currency,
      paymentMethod,
    });

    return NextResponse.json(subscription);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subscriptionId, updates } = body;

    if (!subscriptionId || !updates) {
      return NextResponse.json(
        { error: 'subscriptionId and updates are required' },
        { status: 400 }
      );
    }

    const updatedSubscription = await updateSubscription(subscriptionId, updates);
    
    if (!updatedSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSubscription);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
