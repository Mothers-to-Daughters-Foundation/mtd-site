import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllEvents,
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  registerForEvent,
} from '@/lib/models/Event';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming');
    const eventId = searchParams.get('id');

    if (eventId) {
      const event = await getEventById(eventId);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json(event);
    }

    if (upcoming === 'true') {
      const events = await getUpcomingEvents();
      return NextResponse.json(events);
    }

    const events = await getAllEvents();
    return NextResponse.json(events);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
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
    const { action, eventId } = body;

    // Register for event
    if (action === 'register' && eventId) {
      const userId = (session.user as any).id;
      const registration = await registerForEvent(userId, eventId);
      return NextResponse.json(registration);
    }

    // Create event (admin only)
    if ((session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const event = await createEvent({
      ...body,
      isPublished: body.isPublished ?? false,
      currentAttendees: 0,
    });

    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, updates } = body;

    if (!eventId || !updates) {
      return NextResponse.json(
        { error: 'eventId and updates are required' },
        { status: 400 }
      );
    }

    const updatedEvent = await updateEvent(eventId, updates);
    
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}
