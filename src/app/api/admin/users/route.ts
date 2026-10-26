import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ admins: [] });
    }

    const { data, error } = await supabase.auth.admin.listUsers();
    if (error || !data?.users) {
      return NextResponse.json({ admins: [] });
    }

    // Filter users who have admin role in app_metadata or user_metadata
    const admins = data.users
      .filter((u) => {
        const appRole = u.app_metadata?.role;
        const appRoles = u.app_metadata?.roles;
        const userRole = u.user_metadata?.role;
        return (
          appRole === 'admin' ||
          (Array.isArray(appRoles) && appRoles.includes('admin')) ||
          userRole === 'admin'
        );
      })
      .map((u) => ({
        id: u.id, // Supabase Auth UUID
        name: u.user_metadata?.full_name || u.user_metadata?.name || 'Administrator',
        email: u.email || '',
        role: 'Administrator',
        created_at: u.created_at
      }));

    return NextResponse.json({ admins });
  } catch (err) {
    console.warn('Error fetching admin users from Supabase:', err);
    return NextResponse.json({ admins: [] });
  }
}
