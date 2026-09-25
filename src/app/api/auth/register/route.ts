import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rateLimit';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['mentor', 'mentee']),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 registrations per IP per hour
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  if (!rateLimit(`register:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const supabase = createAdminClient();

    // Create the auth user via Supabase Admin API (auto-confirms email)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }
      console.error('[register] auth error', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = authData.user;

    // Insert the user profile row so the dashboard can find the role
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: user.id,
      full_name: name,
      role,
    });

    if (profileError) {
      // Roll back the auth user so the state stays consistent
      await supabase.auth.admin.deleteUser(user.id);
      console.error('[register] profile insert error', profileError);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: { id: user.id, name, email, role },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
