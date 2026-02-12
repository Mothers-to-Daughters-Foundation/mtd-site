import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Badge {
  _id?: string;
  name: string;
  description: string;
  icon?: string;
  criteria: string;
  points?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBadge {
  _id?: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  createdAt: Date;
}

export async function createBadge(badgeData: Omit<Badge, '_id' | 'createdAt' | 'updatedAt'>): Promise<Badge> {
  const db = await getDb();
  const badges = db.collection<Badge>('badges');

  const newBadge: Badge = {
    ...badgeData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await badges.insertOne(newBadge as any);
  return { ...newBadge, _id: result.insertedId.toString() };
}

export async function getAllBadges(): Promise<Badge[]> {
  const db = await getDb();
  const badges = db.collection<Badge>('badges');
  return await badges.find({}).sort({ createdAt: -1 }).toArray();
}

export async function getBadgeById(badgeId: string): Promise<Badge | null> {
  const db = await getDb();
  const badges = db.collection<Badge>('badges');
  return await badges.findOne({ _id: new ObjectId(badgeId) } as any);
}

export async function awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
  const db = await getDb();
  const userBadges = db.collection<UserBadge>('user_badges');

  // Check if user already has this badge
  const existing = await userBadges.findOne({ userId, badgeId });
  if (existing) {
    throw new Error('User already has this badge');
  }

  const newUserBadge: UserBadge = {
    userId,
    badgeId,
    earnedAt: new Date(),
    createdAt: new Date(),
  };

  const result = await userBadges.insertOne(newUserBadge as any);
  return { ...newUserBadge, _id: result.insertedId.toString() };
}

export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const db = await getDb();
  const userBadges = db.collection<UserBadge>('user_badges');
  return await userBadges.find({ userId }).sort({ earnedAt: -1 }).toArray();
}

export async function getUserBadgesWithDetails(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
  const db = await getDb();
  const userBadges = db.collection<UserBadge>('user_badges');
  
  const badges = await userBadges.aggregate([
    { $match: { userId } },
    {
      $lookup: {
        from: 'badges',
        localField: 'badgeId',
        foreignField: '_id',
        as: 'badgeDetails'
      }
    },
    { $unwind: '$badgeDetails' },
    { $sort: { earnedAt: -1 } }
  ]).toArray();

  return badges.map((item: any) => ({
    _id: item._id?.toString(),
    userId: item.userId,
    badgeId: item.badgeId,
    earnedAt: item.earnedAt,
    createdAt: item.createdAt,
    badge: item.badgeDetails
  }));
}
