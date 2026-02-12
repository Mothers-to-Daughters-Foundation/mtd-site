import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Progress {
  _id?: string;
  userId: string;
  materialId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  timeSpent?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

export async function createProgress(
  progressData: Omit<Progress, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Progress> {
  const db = await getDb();
  const progress = db.collection<Progress>('progress');

  const newProgress: Progress = {
    ...progressData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await progress.insertOne(newProgress as any);
  return { ...newProgress, _id: result.insertedId.toString() };
}

export async function getProgressByUserId(userId: string): Promise<Progress[]> {
  const db = await getDb();
  const progress = db.collection<Progress>('progress');
  return await progress.find({ userId }).sort({ lastAccessedAt: -1 }).toArray();
}

export async function getProgressByUserAndMaterial(
  userId: string,
  materialId: string
): Promise<Progress | null> {
  const db = await getDb();
  const progress = db.collection<Progress>('progress');
  return await progress.findOne({ userId, materialId });
}

export async function updateProgress(
  progressId: string,
  updates: Partial<Progress>
): Promise<Progress | null> {
  const db = await getDb();
  const progress = db.collection<Progress>('progress');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await progress.updateOne(
    { _id: new ObjectId(progressId) },
    { $set: updateData }
  );
  
  return await progress.findOne({ _id: new ObjectId(progressId) });
}

export async function getProgressStats(userId: string) {
  const db = await getDb();
  const progress = db.collection<Progress>('progress');
  
  const total = await progress.countDocuments({ userId });
  const completed = await progress.countDocuments({ userId, status: 'completed' });
  const inProgress = await progress.countDocuments({ userId, status: 'in_progress' });
  const notStarted = await progress.countDocuments({ userId, status: 'not_started' });
  
  const totalTimeSpent = await progress.aggregate([
    { $match: { userId } },
    { $group: { _id: null, total: { $sum: '$timeSpent' } } }
  ]).toArray();
  
  return {
    total,
    completed,
    inProgress,
    notStarted,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    totalTimeSpent: totalTimeSpent.length > 0 ? totalTimeSpent[0].total : 0
  };
}
