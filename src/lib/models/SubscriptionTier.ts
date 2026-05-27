import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface SubscriptionTier {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  pricePerMonth: number; // in cents (e.g. 999 = $9.99)
  features: string[];
  isActive: boolean;
  isDefault: boolean;
  stripePriceId?: string;
  zeffyUrl?: string; // optional Zeffy campaign URL
  maxMentees?: number; // optional cap on mentees per mentor at this tier
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getAllTiers(activeOnly = false): Promise<SubscriptionTier[]> {
  const db = await getDb();
  const tiers = db.collection<SubscriptionTier>('subscription_tiers');
  const query = activeOnly ? { isActive: true } : {};
  return await tiers.find(query).sort({ pricePerMonth: 1 }).toArray() as SubscriptionTier[];
}

export async function getTierById(id: string): Promise<SubscriptionTier | null> {
  const db = await getDb();
  const tiers = db.collection<SubscriptionTier>('subscription_tiers');
  try {
    return await tiers.findOne({ _id: new ObjectId(id) as any }) as SubscriptionTier | null;
  } catch {
    return null;
  }
}

export async function getTierBySlug(slug: string): Promise<SubscriptionTier | null> {
  const db = await getDb();
  const tiers = db.collection<SubscriptionTier>('subscription_tiers');
  return await tiers.findOne({ slug }) as SubscriptionTier | null;
}

export async function getDefaultTier(): Promise<SubscriptionTier | null> {
  const db = await getDb();
  const tiers = db.collection<SubscriptionTier>('subscription_tiers');
  return await tiers.findOne({ isDefault: true, isActive: true }) as SubscriptionTier | null;
}

export async function createTier(
  data: Omit<SubscriptionTier, '_id' | 'createdAt' | 'updatedAt'>
): Promise<SubscriptionTier> {
  const db = await getDb();
  const tiers = db.collection<SubscriptionTier>('subscription_tiers');

  // If this tier is being set as default, unset others
  if (data.isDefault) {
    await tiers.updateMany({}, { $set: { isDefault: false } });
  }

  const newTier: SubscriptionTier = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await tiers.insertOne(newTier);
  return { ...newTier, _id: result.insertedId.toString() };
}

export async function updateTier(
  id: string,
  updates: Partial<SubscriptionTier>
): Promise<SubscriptionTier | null> {
  const db = await getDb();
  const tiers = db.collection<SubscriptionTier>('subscription_tiers');

  // If this tier is being set as default, unset others
  if (updates.isDefault) {
    await tiers.updateMany(
      { _id: { $ne: new ObjectId(id) as any } },
      { $set: { isDefault: false } }
    );
  }

  const updateData = { ...updates, updatedAt: new Date() };
  delete (updateData as any)._id;

  await tiers.updateOne(
    { _id: new ObjectId(id) as any },
    { $set: updateData }
  );

  return await getTierById(id);
}

export async function deactivateTier(id: string): Promise<boolean> {
  const db = await getDb();
  const tiers = db.collection<SubscriptionTier>('subscription_tiers');
  const result = await tiers.updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { isActive: false, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}
