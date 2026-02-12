import { getDb } from '../db';
import bcrypt from 'bcryptjs';

export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee' | 'donor' | 'admin';
  emailVerified?: boolean;
  subscriptionStatus?: 'active' | 'inactive' | 'pending';
  createdAt?: Date;
  updatedAt?: Date;
  profile?: {
    bio?: string;
    phone?: string;
    location?: string;
    image?: string;
    goals?: string[];
    interests?: string[];
  };
}

export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee' | 'donor' | 'admin';
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
    emailVerified: false,
    subscriptionStatus: userData.role === 'mentee' ? 'pending' : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
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
  const user = await users.findOne({ _id: id as any });
  return user;
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
    { _id: userId as any },
    { $set: updateData }
  );
  
  return await getUserById(userId);
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  const users = db.collection<User>('users');
  return await users.find({}).toArray();
}

export async function getUsersByRole(role: string): Promise<User[]> {
  const db = await getDb();
  const users = db.collection<User>('users');
  return await users.find({ role }).toArray();
}

export async function getUserStats() {
  const db = await getDb();
  const users = db.collection<User>('users');
  
  const total = await users.countDocuments();
  const mentors = await users.countDocuments({ role: 'mentor' });
  const mentees = await users.countDocuments({ role: 'mentee' });
  const donors = await users.countDocuments({ role: 'donor' });
  const admins = await users.countDocuments({ role: 'admin' });
  
  return { total, mentors, mentees, donors, admins };
}
