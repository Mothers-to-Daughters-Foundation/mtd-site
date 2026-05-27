import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsers } from '@/lib/models/User';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') ?? undefined;
    const subscriptionStatus = searchParams.get('subscriptionStatus') ?? undefined;

    const users = await getAllUsers({ role, subscriptionStatus });
    // Strip passwords (already excluded by projection in getAllUsers)
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[admin/users GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
