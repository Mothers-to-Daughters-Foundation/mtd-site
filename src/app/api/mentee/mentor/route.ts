import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMatchByMenteeId } from '@/lib/models/Match';
import { getUserById } from '@/lib/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'mentee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const match = await getMatchByMenteeId(session.user.id);
    if (!match) {
      return NextResponse.json({ mentor: null });
    }

    const mentor = await getUserById(match.mentorId);
    if (!mentor) {
      return NextResponse.json({ mentor: null });
    }

    const { password: _pw, ...safeMentor } = mentor as any;
    return NextResponse.json({ mentor: safeMentor, matchStatus: match.status });
  } catch (error) {
    console.error('[mentee/mentor GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
