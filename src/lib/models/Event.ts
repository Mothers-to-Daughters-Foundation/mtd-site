import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Event {
  _id?: string;
  title: string;
  description?: string;
  type: 'workshop' | 'networking' | 'business_hours' | 'concert' | 'sports' | 'exhibition' | 'fair' | 'other';
  date: Date;
  time: string;
  duration?: number; // in minutes
  location?: string;
  meetingLink?: string;
  maxAttendees?: number;
  currentAttendees: number;
  hostId?: string; // mentor user ID for business hours
  hostName?: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRegistration {
  _id?: string;
  eventId: string;
  userId: string;
  registeredAt: Date;
  status: 'registered' | 'attended' | 'cancelled';
}

export async function createEvent(
  eventData: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Event> {
  const db = await getDb();
  const events = db.collection<Event>('events');

  const newEvent: Event = {
    ...eventData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await events.insertOne(newEvent as any);
  return { ...newEvent, _id: result.insertedId.toString() };
}

export async function getAllEvents(published = true): Promise<Event[]> {
  const db = await getDb();
  const events = db.collection<Event>('events');
  const query = published ? { isPublished: true } : {};
  return await events.find(query).sort({ date: 1 }).toArray();
}

export async function getUpcomingEvents(limit = 10): Promise<Event[]> {
  const db = await getDb();
  const events = db.collection<Event>('events');
  return await events
    .find({ isPublished: true, date: { $gte: new Date() } })
    .sort({ date: 1 })
    .limit(limit)
    .toArray();
}

export async function getEventById(eventId: string): Promise<Event | null> {
  const db = await getDb();
  const events = db.collection<Event>('events');
  return await events.findOne({ _id: new ObjectId(eventId) } as any);
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>
): Promise<Event | null> {
  const db = await getDb();
  const events = db.collection<Event>('events');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await events.updateOne(
    { _id: new ObjectId(eventId) } as any,
    { $set: updateData }
  );
  
  return await events.findOne({ _id: new ObjectId(eventId) } as any);
}

export async function registerForEvent(
  userId: string,
  eventId: string
): Promise<EventRegistration> {
  const db = await getDb();
  const registrations = db.collection<EventRegistration>('event_registrations');
  const events = db.collection<Event>('events');

  // Check if already registered
  const existing = await registrations.findOne({ userId, eventId });
  if (existing) {
    throw new Error('Already registered for this event');
  }

  // Check if event is full
  const event = await events.findOne({ _id: new ObjectId(eventId) } as any);
  if (event && event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
    throw new Error('Event is full');
  }

  const registration: EventRegistration = {
    eventId,
    userId,
    registeredAt: new Date(),
    status: 'registered',
  };

  const result = await registrations.insertOne(registration as any);
  
  // Increment attendee count
  await events.updateOne(
    { _id: new ObjectId(eventId) } as any,
    { $inc: { currentAttendees: 1 } }
  );

  return { ...registration, _id: result.insertedId.toString() };
}

export async function getUserRegistrations(userId: string): Promise<EventRegistration[]> {
  const db = await getDb();
  const registrations = db.collection<EventRegistration>('event_registrations');
  return await registrations.find({ userId }).toArray();
}
