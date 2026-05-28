import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface BillingEntry {
  date: Date;
  amountCents: number;
  status: 'paid' | 'failed' | 'refunded';
  stripeInvoiceId?: string;
  description?: string;
}

export interface Subscription {
  _id?: string;
  userId: string;
  tierId: string;
  paymentProvider: 'stripe' | 'zeffy' | 'manual';
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelledAt?: Date;
  billingHistory: BillingEntry[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
  const db = await getDb();
  const subs = db.collection<Subscription>('subscriptions');
  return await subs.findOne({ userId, status: { $ne: 'cancelled' } }) as Subscription | null;
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const db = await getDb();
  const subs = db.collection<Subscription>('subscriptions');
  try {
    return await subs.findOne({ _id: new ObjectId(id) as any }) as Subscription | null;
  } catch {
    return null;
  }
}

export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const db = await getDb();
  const subs = db.collection<Subscription>('subscriptions');
  return await subs.findOne({ stripeSubscriptionId }) as Subscription | null;
}

export async function getAllSubscriptions(filter: {
  status?: string;
  tierId?: string;
} = {}): Promise<Subscription[]> {
  const db = await getDb();
  const subs = db.collection<Subscription>('subscriptions');
  const query: Record<string, string> = {};
  if (filter.status) query.status = filter.status;
  if (filter.tierId) query.tierId = filter.tierId;
  return await subs.find(query).sort({ createdAt: -1 }).toArray() as Subscription[];
}

export async function createSubscription(
  data: Omit<Subscription, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Subscription> {
  const db = await getDb();
  const subs = db.collection<Subscription>('subscriptions');

  const newSub: Subscription = {
    ...data,
    billingHistory: data.billingHistory ?? [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await subs.insertOne(newSub);
  return { ...newSub, _id: result.insertedId.toString() };
}

export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>
): Promise<Subscription | null> {
  const db = await getDb();
  const subs = db.collection<Subscription>('subscriptions');

  const updateData = { ...updates, updatedAt: new Date() };
  delete (updateData as any)._id;

  await subs.updateOne(
    { _id: new ObjectId(id) as any },
    { $set: updateData }
  );

  return await getSubscriptionById(id);
}

export async function appendBillingEntry(
  subscriptionId: string,
  entry: BillingEntry
): Promise<void> {
  const db = await getDb();
  const subs = db.collection<Subscription>('subscriptions');
  await subs.updateOne(
    { _id: new ObjectId(subscriptionId) as any },
    {
      $push: { billingHistory: entry } as any,
      $set: { updatedAt: new Date() },
    }
  );
}
