import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface TrainingMaterial {
  _id?: string;
  title: string;
  description?: string;
  type: 'video' | 'document' | 'article' | 'course' | 'quiz';
  content?: string;
  url?: string;
  category?: string;
  tags?: string[];
  duration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createTrainingMaterial(
  materialData: Omit<TrainingMaterial, '_id' | 'createdAt' | 'updatedAt'>
): Promise<TrainingMaterial> {
  const db = await getDb();
  const materials = db.collection<TrainingMaterial>('training_materials');

  const newMaterial: TrainingMaterial = {
    ...materialData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await materials.insertOne(newMaterial as any);
  return { ...newMaterial, _id: result.insertedId.toString() };
}

export async function getAllTrainingMaterials(published = true): Promise<TrainingMaterial[]> {
  const db = await getDb();
  const materials = db.collection<TrainingMaterial>('training_materials');
  const query = published ? { isPublished: true } : {};
  return await materials.find(query).sort({ createdAt: -1 }).toArray();
}

export async function getTrainingMaterialById(materialId: string): Promise<TrainingMaterial | null> {
  const db = await getDb();
  const materials = db.collection<TrainingMaterial>('training_materials');
  return await materials.findOne({ _id: new ObjectId(materialId) } as any);
}

export async function updateTrainingMaterial(
  materialId: string,
  updates: Partial<TrainingMaterial>
): Promise<TrainingMaterial | null> {
  const db = await getDb();
  const materials = db.collection<TrainingMaterial>('training_materials');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await materials.updateOne(
    { _id: new ObjectId(materialId) } as any,
    { $set: updateData }
  );
  
  return await materials.findOne({ _id: new ObjectId(materialId) } as any);
}

export async function deleteTrainingMaterial(materialId: string): Promise<boolean> {
  const db = await getDb();
  const materials = db.collection<TrainingMaterial>('training_materials');
  const result = await materials.deleteOne({ _id: new ObjectId(materialId) } as any);
  return result.deletedCount === 1;
}
