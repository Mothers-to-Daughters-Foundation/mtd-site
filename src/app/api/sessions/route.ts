import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createSession,
  getSessionsByMentorId,
  getSessionsByMenteeId,
  getUpcomingSessions,
  updateSession,
} from '@/lib/models/Session';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const filter = searchParams.get('filter');

    if (filter === 'upcoming') {
      const sessions = await getUpcomingSessions(userId, userRole === 'mentor' ? 'mentor' : 'mentee');
      return NextResponse.json(sessions);
    }

    const sessions = userRole === 'mentor'
      ? await getSessionsByMentorId(userId)
      : await getSessionsByMenteeId(userId);

    return NextResponse.json(sessions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { mentorId, menteeId, title, description, scheduledDate, duration, location, meetingLink } = body;

    if (!mentorId || !menteeId || !title || !scheduledDate || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newSession = await createSession({
      mentorId,
      menteeId,
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      duration,
      status: 'scheduled',
      location,
      meetingLink,
    });

    return NextResponse.json(newSession);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, updates } = body;

    if (!sessionId || !updates) {
      return NextResponse.json(
        { error: 'sessionId and updates are required' },
        { status: 400 }
      );
    }

    const updatedSession = await updateSession(sessionId, updates);
    
    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: 500 }
    );
  }
}
