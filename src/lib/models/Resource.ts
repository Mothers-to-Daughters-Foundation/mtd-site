import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Resource {
  _id?: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'docx' | 'audio' | 'link' | 'other';
  url: string;
  fileSize?: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  category?: string;
  tags?: string[];
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createResource(
  resourceData: Omit<Resource, '_id' | 'createdAt' | 'updatedAt' | 'downloads' | 'rating' | 'ratingCount'>
): Promise<Resource> {
  const db = await getDb();
  const resources = db.collection<Resource>('resources');

  const newResource: Resource = {
    ...resourceData,
    downloads: 0,
    rating: 0,
    ratingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await resources.insertOne(newResource as any);
  return { ...newResource, _id: result.insertedId.toString() };
}

export async function getAllResources(published = true): Promise<Resource[]> {
  const db = await getDb();
  const resources = db.collection<Resource>('resources');
  const query = published ? { isPublished: true } : {};
  return await resources.find(query).sort({ rating: -1, downloads: -1 }).toArray();
}

export async function getFeaturedResources(limit = 6): Promise<Resource[]> {
  const db = await getDb();
  const resources = db.collection<Resource>('resources');
  return await resources
    .find({ isPublished: true })
    .sort({ rating: -1, downloads: -1 })
    .limit(limit)
    .toArray();
}

export async function getResourceById(resourceId: string): Promise<Resource | null> {
  const db = await getDb();
  const resources = db.collection<Resource>('resources');
  return await resources.findOne({ _id: new ObjectId(resourceId) } as any);
}

export async function incrementDownloads(resourceId: string): Promise<void> {
  const db = await getDb();
  const resources = db.collection<Resource>('resources');
  await resources.updateOne(
    { _id: new ObjectId(resourceId) } as any,
    { $inc: { downloads: 1 } }
  );
}

export async function rateResource(resourceId: string, rating: number): Promise<Resource | null> {
  const db = await getDb();
  const resources = db.collection<Resource>('resources');
  
  const resource = await resources.findOne({ _id: new ObjectId(resourceId) } as any);
  if (!resource) return null;

  const newRatingCount = resource.ratingCount + 1;
  const newRating = ((resource.rating * resource.ratingCount) + rating) / newRatingCount;

  await resources.updateOne(
    { _id: new ObjectId(resourceId) } as any,
    { 
      $set: { 
        rating: newRating,
        ratingCount: newRatingCount,
        updatedAt: new Date()
      } 
    }
  );

  return await resources.findOne({ _id: new ObjectId(resourceId) } as any);
}

export async function updateResource(
  resourceId: string,
  updates: Partial<Resource>
): Promise<Resource | null> {
  const db = await getDb();
  const resources = db.collection<Resource>('resources');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await resources.updateOne(
    { _id: new ObjectId(resourceId) } as any,
    { $set: updateData }
  );
  
  return await resources.findOne({ _id: new ObjectId(resourceId) } as any);
}
