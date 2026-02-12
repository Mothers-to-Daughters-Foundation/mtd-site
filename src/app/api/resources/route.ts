import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllResources,
  getFeaturedResources,
  getResourceById,
  createResource,
  updateResource,
  incrementDownloads,
} from '@/lib/models/Resource';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const resourceId = searchParams.get('id');

    if (resourceId) {
      const resource = await getResourceById(resourceId);
      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
      return NextResponse.json(resource);
    }

    if (featured === 'true') {
      const resources = await getFeaturedResources();
      return NextResponse.json(resources);
    }

    const resources = await getAllResources();
    return NextResponse.json(resources);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const resource = await createResource({
      ...body,
      isPublished: body.isPublished ?? false,
    });

    return NextResponse.json(resource);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create resource' },
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
    const { resourceId, updates } = body;

    if (!resourceId || !updates) {
      return NextResponse.json(
        { error: 'resourceId and updates are required' },
        { status: 400 }
      );
    }

    const updatedResource = await updateResource(resourceId, updates);
    
    if (!updatedResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(updatedResource);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update resource' },
      { status: 500 }
    );
  }
}
