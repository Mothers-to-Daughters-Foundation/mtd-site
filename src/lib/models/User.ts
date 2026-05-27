import { getDb } from '../db';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'mentor' | 'mentee';
  createdAt?: Date;
  updatedAt?: Date;
  profile?: {
    bio?: string;
    phone?: string;
    location?: string;
    image?: string;
    expertise?: string;
    availability?: string;
  };
  // Subscription fields
  subscriptionTierId?: string;
  subscriptionStatus?: 'active' | 'paused' | 'cancelled';
  subscriptionStartDate?: Date;
  subscriptionRenewDate?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'mentor' | 'mentee';
}): Promise<User> {
  const db = await getDb();
  const users = db.collection<User>('users');

  // Check if user already exists
  const existingUser = await users.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser: User = {
    email: userData.email,
    password: hashedPassword,
    name: userData.name,
    role: userData.role,
    createdAt: new Date(),
    updatedAt: new Date(),
    subscriptionStatus: 'cancelled',
  };

  const result = await users.insertOne(newUser);
  return { ...newUser, _id: result.insertedId.toString() };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const users = db.collection<User>('users');
  return await users.findOne({ email });
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const users = db.collection<User>('users');
  try {
    const user = await users.findOne({ _id: new ObjectId(id) as any });
    return user;
  } catch {
    return null;
  }
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const db = await getDb();
  const users = db.collection<User>('users');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  delete (updateData as any).password; // Don't allow password updates here
  
  await users.updateOne(
    { _id: new ObjectId(userId) as any },
    { $set: updateData }
  );
  
  return await getUserById(userId);
}

export async function getAllUsers(
  filter: { role?: string; subscriptionStatus?: string } = {}
): Promise<User[]> {
  const db = await getDb();
  const users = db.collection<User>('users');
  const query: Record<string, string> = {};
  if (filter.role) query.role = filter.role;
  if (filter.subscriptionStatus) query.subscriptionStatus = filter.subscriptionStatus;
  return await users
    .find(query, { projection: { password: 0 } })
    .toArray() as User[];
}

export async function updateUserById(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const db = await getDb();
  const users = db.collection<User>('users');

  const updateData = { ...updates, updatedAt: new Date() };
  delete (updateData as any).password;

  await users.updateOne(
    { _id: new ObjectId(userId) as any },
    { $set: updateData }
  );

  return await getUserById(userId);
}
