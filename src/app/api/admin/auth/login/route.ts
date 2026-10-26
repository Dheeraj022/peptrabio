import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide administrator email and password.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { success: false, message: 'Supabase configuration is missing.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error || !data.user) {
      return NextResponse.json(
        { success: false, message: error?.message || 'Invalid administrator email or password.' },
        { status: 401 }
      );
    }

    const user = data.user;

    // 2. Role-Based Access Control (RBAC) Verification
    // Verify admin role in Supabase Auth app_metadata or user_metadata
    const appRole = user.app_metadata?.role;
    const appRoles = user.app_metadata?.roles;
    const userRole = user.user_metadata?.role;

    const isAdmin =
      appRole === 'admin' ||
      (Array.isArray(appRoles) && appRoles.includes('admin')) ||
      userRole === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied: This account does not possess administrative role privileges.'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Administrator authentication verified.',
      user: {
        id: user.id, // Supabase Auth User ID (UUID)
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'Administrator',
        email: user.email,
        role: 'admin',
        created_at: user.created_at
      },
      session: data.session
        ? {
            access_token: data.session.access_token,
            expires_at: data.session.expires_at
          }
        : undefined
    });
  } catch (err: any) {
    console.error('API /admin/auth/login error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
