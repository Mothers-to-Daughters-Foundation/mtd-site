import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllTiers, createTier } from '@/lib/models/SubscriptionTier';
import { z } from 'zod';

const createTierSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().min(1),
  pricePerMonth: z.number().int().min(0),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  stripePriceId: z.string().optional(),
  zeffyUrl: z.string().url().optional().or(z.literal('')),
  maxMentees: z.number().int().min(1).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const tiers = await getAllTiers();
    return NextResponse.json({ tiers });
  } catch (error) {
    console.error('[admin/tiers GET]', error);
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
    const parsed = createTierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const tier = await createTier(parsed.data);
    return NextResponse.json({ tier }, { status: 201 });
  } catch (error) {
    console.error('[admin/tiers POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
