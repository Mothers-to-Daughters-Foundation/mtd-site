import { getDb } from '../db';
import { ObjectId } from 'mongodb';

export interface Payment {
  _id?: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'stripe' | 'paypal' | 'apple_pay';
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export async function createPayment(paymentData: Omit<Payment, '_id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
  const db = await getDb();
  const payments = db.collection<Payment>('payments');

  const newPayment: Payment = {
    ...paymentData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await payments.insertOne(newPayment as any);
  return { ...newPayment, _id: result.insertedId.toString() };
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  const db = await getDb();
  const payments = db.collection<Payment>('payments');
  return await payments.find({ userId }).sort({ createdAt: -1 }).toArray();
}

export async function updatePayment(
  paymentId: string,
  updates: Partial<Payment>
): Promise<Payment | null> {
  const db = await getDb();
  const payments = db.collection<Payment>('payments');
  
  const updateData = {
    ...updates,
    updatedAt: new Date(),
  };
  
  await payments.updateOne(
    { _id: new ObjectId(paymentId) } as any,
    { $set: updateData }
  );
  
  return await payments.findOne({ _id: new ObjectId(paymentId) } as any);
}

export async function getPaymentById(paymentId: string): Promise<Payment | null> {
  const db = await getDb();
  const payments = db.collection<Payment>('payments');
  return await payments.findOne({ _id: new ObjectId(paymentId) } as any);
}
