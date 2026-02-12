import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface MentorMenteeRelationship {
  _id?: string;
  mentorId: string;
  menteeId: string;
  status: 'active' | 'inactive' | 'completed' | 'pending';
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createRelationship(
  relationshipData: Omit<MentorMenteeRelationship, '_id' | 'createdAt' | 'updatedAt'>
): Promise<MentorMenteeRelationship> {
  const db = await getDb();
  const relationships = db.collection<MentorMenteeRelationship>('mentor_mentee_relationships');

  const newRelationship: MentorMenteeRelationship = {
    ...relationshipData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await relationships.insertOne(newRelationship as any);
  return { ...newRelationship, _id: result.insertedId.toString() };
}

export async function getMenteesByMentorId(mentorId: string): Promise<MentorMenteeRelationship[]> {
  const db = await getDb();
  const relationships = db.collection<MentorMenteeRelationship>('mentor_mentee_relationships');
  return await relationships.find({ mentorId, status: 'active' }).toArray();
}

export async function getMentorsByMenteeId(menteeId: string): Promise<MentorMenteeRelationship[]> {
  const db = await getDb();
  const relationships = db.collection<MentorMenteeRelationship>('mentor_mentee_relationships');
  return await relationships.find({ menteeId, status: 'active' }).toArray();
}

export async function updateRelationship(
  relationshipId: string,
  updates: Partial<MentorMenteeRelationship>
): Promise<MentorMenteeRelationship | null> {
  const db = await getDb();
  const relationships = db.collection<MentorMenteeRelationship>('mentor_mentee_relationships');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await relationships.updateOne(
    { _id: new ObjectId(relationshipId) },
    { $set: updateData }
  );
  
  return await relationships.findOne({ _id: new ObjectId(relationshipId) });
}

export async function getRelationshipById(relationshipId: string): Promise<MentorMenteeRelationship | null> {
  const db = await getDb();
  const relationships = db.collection<MentorMenteeRelationship>('mentor_mentee_relationships');
  return await relationships.findOne({ _id: new ObjectId(relationshipId) });
}
