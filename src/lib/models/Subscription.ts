import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Subscription {
  _id?: string;
  userId: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending';
  type: 'monthly' | 'yearly' | 'lifetime';
  startDate: Date;
  endDate?: Date;
  amount: number;
  currency: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createSubscription(subscriptionData: Omit<Subscription, '_id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
  const db = await getDb();
  const subscriptions = db.collection<Subscription>('subscriptions');

  const newSubscription: Subscription = {
    ...subscriptionData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await subscriptions.insertOne(newSubscription as any);
  return { ...newSubscription, _id: result.insertedId.toString() };
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
  const db = await getDb();
  const subscriptions = db.collection<Subscription>('subscriptions');
  return await subscriptions.findOne({ userId, status: 'active' });
}

export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<Subscription>
): Promise<Subscription | null> {
  const db = await getDb();
  const subscriptions = db.collection<Subscription>('subscriptions');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await subscriptions.updateOne(
    { _id: new ObjectId(subscriptionId) },
    { $set: updateData }
  );
  
  return await subscriptions.findOne({ _id: new ObjectId(subscriptionId) });
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const db = await getDb();
  const subscriptions = db.collection<Subscription>('subscriptions');
  return await subscriptions.find({}).toArray();
}

export async function getSubscriptionStats() {
  const db = await getDb();
  const subscriptions = db.collection<Subscription>('subscriptions');
  
  const total = await subscriptions.countDocuments();
  const active = await subscriptions.countDocuments({ status: 'active' });
  const inactive = await subscriptions.countDocuments({ status: 'inactive' });
  const cancelled = await subscriptions.countDocuments({ status: 'cancelled' });
  
  return { total, active, inactive, cancelled };
}
