import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ADMIN_SECRET_PASSKEY } from '@/lib/admin-constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, passkey, newPassword } = body;

    if (!email || !passkey || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedPasskey = passkey.trim().toUpperCase();
    if (normalizedPasskey !== ADMIN_SECRET_PASSKEY) {
      return NextResponse.json(
        { success: false, message: 'Invalid Secret Passkey. Passkey authorization is required to reset password.' },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'Supabase credentials not configured.' },
        { status: 500 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json(
        { success: false, message: listError.message },
        { status: 500 }
      );
    }

    const user = userList?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No administrator account found with this email address.' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Administrator password reset successfully in Supabase Authentication.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
