import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_SECRET_PASSKEY } from '@/lib/admin-constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, passkey, role } = body;

    // 1. Validate fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide a full administrator name.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid administrator email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 2. Validate Authorization Passkey
    const normalizedPasskey = (passkey || '').trim().toUpperCase();
    if (normalizedPasskey !== ADMIN_SECRET_PASSKEY) {
      return NextResponse.json(
        { success: false, message: 'Invalid Secret Passkey. Valid authorization is required to register an administrator.' },
        { status: 403 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Connect to Supabase Auth Admin Client
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Supabase credentials are not configured on server.' },
        { status: 500 }
      );
    }

    // 4. Check if user already exists in Supabase Authentication -> Users
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Supabase listUsers error:', listError);
      return NextResponse.json(
        { success: false, message: `Failed to check Supabase Auth: ${listError.message}` },
        { status: 500 }
      );
    }

    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    let authUser: any = null;

    if (existingUser) {
      // User exists in Supabase Auth -> Update password and assign admin RBAC claims in app_metadata
      const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        {
          password: password,
          email_confirm: true,
          app_metadata: {
            ...existingUser.app_metadata,
            role: 'admin',
            roles: ['admin'],
            claims_admin: true
          },
          user_metadata: {
            ...existingUser.user_metadata,
            role: 'admin',
            full_name: name.trim(),
            name: name.trim()
          }
        }
      );

      if (updateError) {
        console.error('Supabase updateUser error:', updateError);
        return NextResponse.json(
          { success: false, message: `Failed to update user in Supabase Auth: ${updateError.message}` },
          { status: 500 }
        );
      }
      authUser = updated.user;
    } else {
      // Create new user in Supabase Authentication -> Users
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: password,
        email_confirm: true, // auto-confirm email so they can log in immediately
        app_metadata: {
          role: 'admin',
          roles: ['admin'],
          claims_admin: true,
          provider: 'email',
          providers: ['email']
        },
        user_metadata: {
          role: 'admin',
          full_name: name.trim(),
          name: name.trim()
        }
      });

      if (createError) {
        console.error('Supabase createUser error:', createError);
        return NextResponse.json(
          { success: false, message: `Failed to create Supabase Auth User: ${createError.message}` },
          { status: 500 }
        );
      }
      authUser = created.user;
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully in Supabase Authentication.',
      user: {
        id: authUser.id, // Supabase Auth User ID (UUID)
        name: authUser.user_metadata?.full_name || name.trim(),
        email: authUser.email,
        role: 'admin',
        created_at: authUser.created_at
      }
    });
  } catch (err: any) {
    console.error('API /admin/auth/register error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
