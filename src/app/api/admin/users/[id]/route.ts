import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserById, updateUserById } from '@/lib/models/User';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['admin', 'mentor', 'mentee']).optional(),
  subscriptionStatus: z.enum(['active', 'paused', 'cancelled']).optional(),
  subscriptionTierId: z.string().optional(),
  name: z.string().min(2).optional(),
  profile: z
    .object({
      bio: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional(),
      image: z.string().optional(),
      expertise: z.string().optional(),
      availability: z.string().optional(),
    })
    .optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { password: _pw, ...safeUser } = user as any;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('[admin/users/[id] GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const user = await updateUserById(params.id, parsed.data);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { password: _pw, ...safeUser } = user as any;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('[admin/users/[id] PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
