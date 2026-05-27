import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Match {
  _id?: string;
  mentorId: string;
  menteeId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getMatchByMenteeId(menteeId: string): Promise<Match | null> {
  const db = await getDb();
  const matches = db.collection<Match>('matches');
  return await matches.findOne({
    menteeId,
    status: { $in: ['pending', 'active'] },
  }) as Match | null;
}

export async function getMatchesByMentorId(mentorId: string): Promise<Match[]> {
  const db = await getDb();
  const matches = db.collection<Match>('matches');
  return await matches
    .find({ mentorId, status: { $in: ['pending', 'active'] } })
    .toArray() as Match[];
}

export async function getAllMatches(): Promise<Match[]> {
  const db = await getDb();
  const matches = db.collection<Match>('matches');
  return await matches.find({}).sort({ createdAt: -1 }).toArray() as Match[];
}

export async function getMatchById(id: string): Promise<Match | null> {
  const db = await getDb();
  const matches = db.collection<Match>('matches');
  try {
    return await matches.findOne({ _id: new ObjectId(id) as any }) as Match | null;
  } catch {
    return null;
  }
}

export async function createMatch(
  data: Omit<Match, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Match> {
  const db = await getDb();
  const matches = db.collection<Match>('matches');

  const newMatch: Match = {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await matches.insertOne(newMatch);
  return { ...newMatch, _id: result.insertedId.toString() };
}

export async function updateMatch(
  id: string,
  updates: Partial<Match>
): Promise<Match | null> {
  const db = await getDb();
  const matches = db.collection<Match>('matches');

  const updateData = { ...updates, updatedAt: new Date() };
  delete (updateData as any)._id;

  await matches.updateOne(
    { _id: new ObjectId(id) as any },
    { $set: updateData }
  );

  return await getMatchById(id);
}
