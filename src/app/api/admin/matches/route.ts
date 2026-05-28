import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createMatch, getAllMatches, updateMatch } from '@/lib/models/Match';
import { z } from 'zod';

const createMatchSchema = z.object({
  mentorId: z.string().min(1),
  menteeId: z.string().min(1),
  notes: z.string().optional(),
});

const updateMatchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'active', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const matches = await getAllMatches();
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('[admin/matches GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createMatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const match = await createMatch({
      ...parsed.data,
      status: 'active',
      startDate: new Date(),
    });
    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    console.error('[admin/matches POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateMatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const match = await updateMatch(id, {
      ...updates,
      endDate: updates.endDate ? new Date(updates.endDate) : undefined,
    });
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    return NextResponse.json({ match });
  } catch (error) {
    console.error('[admin/matches PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
