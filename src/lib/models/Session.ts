import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Session {
  _id?: string;
  mentorId: string;
  menteeId: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location?: string;
  meetingLink?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createSession(sessionData: Omit<Session, '_id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
  const db = await getDb();
  const sessions = db.collection<Session>('sessions');

  const newSession: Session = {
    ...sessionData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await sessions.insertOne(newSession as any);
  return { ...newSession, _id: result.insertedId.toString() };
}

export async function getSessionsByMentorId(mentorId: string): Promise<Session[]> {
  const db = await getDb();
  const sessions = db.collection<Session>('sessions');
  return await sessions.find({ mentorId }).sort({ scheduledDate: -1 }).toArray();
}

export async function getSessionsByMenteeId(menteeId: string): Promise<Session[]> {
  const db = await getDb();
  const sessions = db.collection<Session>('sessions');
  return await sessions.find({ menteeId }).sort({ scheduledDate: -1 }).toArray();
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Session>
): Promise<Session | null> {
  const db = await getDb();
  const sessions = db.collection<Session>('sessions');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await sessions.updateOne(
    { _id: new ObjectId(sessionId) },
    { $set: updateData }
  );
  
  return await sessions.findOne({ _id: new ObjectId(sessionId) });
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const db = await getDb();
  const sessions = db.collection<Session>('sessions');
  return await sessions.findOne({ _id: new ObjectId(sessionId) });
}

export async function getUpcomingSessions(userId: string, role: 'mentor' | 'mentee'): Promise<Session[]> {
  const db = await getDb();
  const sessions = db.collection<Session>('sessions');
  const query = role === 'mentor' 
    ? { mentorId: userId, scheduledDate: { $gte: new Date() }, status: 'scheduled' }
    : { menteeId: userId, scheduledDate: { $gte: new Date() }, status: 'scheduled' };
  
  return await sessions.find(query).sort({ scheduledDate: 1 }).toArray();
}
