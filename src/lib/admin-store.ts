'use client';

export interface AdminUser {
  id: string; // Supabase Auth User ID (UUID)
  name: string;
  email: string;
  role: string;
  password?: string;
  created_at: string;
}

import { ADMIN_SECRET_PASSKEY } from './admin-constants';
export { ADMIN_SECRET_PASSKEY };
const ADMIN_USERS_KEY = 'peptrabio_admin_users_v2';
const CURRENT_ADMIN_KEY = 'peptrabio_current_admin_v2';
const ADMIN_AUTH_KEY = 'peptrabio_admin_auth';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAdminUsers(): AdminUser[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out any dummy admins
    return parsed.filter((u) => u.id !== 'admin-master' && u.email?.toLowerCase() !== 'admin@peptrabio.com');
  } catch {
    return [];
  }
}

export function saveAdminUsers(users: AdminUser[]): void {
  if (!isBrowser()) return;
  try {
    // Only save real admins
    const filtered = users.filter((u) => u.id !== 'admin-master' && u.email?.toLowerCase() !== 'admin@peptrabio.com');
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error saving admin users', err);
  }
}

export function getCurrentAdmin(): AdminUser | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(CURRENT_ADMIN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id !== 'admin-master' && parsed.email?.toLowerCase() !== 'admin@peptrabio.com') {
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function setCurrentAdmin(user: AdminUser | null): void {
  if (!isBrowser()) return;
  if (user) {
    localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(user));
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

/**
 * Checks if an email is already registered as a customer/researcher account
 */
export function isCustomerEmail(email: string): boolean {
  if (!isBrowser()) return false;
  try {
    const normalized = email.trim().toLowerCase();
    const raw = localStorage.getItem('peptrabio_registered_users');
    if (raw) {
      const users: Array<{ email?: string }> = JSON.parse(raw);
      if (Array.isArray(users) && users.some((u) => u.email?.toLowerCase() === normalized)) {
        return true;
      }
    }
    const sessionRaw = localStorage.getItem('peptrabio_user_session');
    if (sessionRaw) {
      const sess: { email?: string } = JSON.parse(sessionRaw);
      if (sess?.email?.toLowerCase() === normalized) {
        return true;
      }
    }
  } catch {}
  return false;
}

/**
 * Asynchronously creates an administrator account in Supabase Authentication -> Users
 * assigning role-based access control (RBAC) in app_metadata and user_metadata.
 */
export async function createAdminProfileAsync(params: {
  name: string;
  email: string;
  password: string;
  passkey: string;
  role?: string;
}): Promise<{ success: boolean; message: string; user?: AdminUser }> {
  const { name, email, password, passkey, role } = params;

  if (!name.trim()) {
    return { success: false, message: 'Please enter a full administrator name.' };
  }

  if (!email.trim() || !email.includes('@')) {
    return { success: false, message: 'Please provide a valid administrator email address.' };
  }

  if (!password || password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const normalizedPasskey = (passkey || '').trim().toUpperCase();
  if (normalizedPasskey !== ADMIN_SECRET_PASSKEY) {
    return {
      success: false,
      message: 'Invalid Secret Passkey. Please provide a valid authorization passkey to create an admin account.'
    };
  }

  try {
    const res = await fetch('/api/admin/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        passkey: normalizedPasskey,
        role: role || 'Administrator'
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, message: data.message || 'Registration failed.' };
    }

    const newAdmin: AdminUser = {
      id: data.user.id, // Real Supabase Auth UUID
      name: data.user.name,
      email: data.user.email,
      role: 'Administrator',
      password: password,
      created_at: data.user.created_at || new Date().toISOString()
    };

    const users = getAdminUsers();
    const existingIdx = users.findIndex((u) => u.email.toLowerCase() === newAdmin.email.toLowerCase());
    if (existingIdx >= 0) {
      users[existingIdx] = newAdmin;
    } else {
      users.unshift(newAdmin);
    }
    saveAdminUsers(users);
    setCurrentAdmin(newAdmin);

    return {
      success: true,
      message: 'Admin account created in Supabase Authentication with UUID.',
      user: newAdmin
    };
  } catch (err: any) {
    console.warn('API register fallback to local', err);
    return {
      success: false,
      message: err.message || 'Failed to connect to authentication server.'
    };
  }
}

/**
 * Synchronous wrapper for createAdminProfile for backwards-compatibility
 */
export function createAdminProfile(params: {
  name: string;
  email: string;
  password: string;
  passkey: string;
  role?: string;
}): { success: boolean; message: string; user?: AdminUser } {
  // Fire async registration in background for Supabase Auth sync
  createAdminProfileAsync(params).catch((e) => console.warn('Background admin registration error', e));

  const { name, email, password, passkey, role } = params;
  const normalizedEmail = email.trim().toLowerCase();

  const newAdmin: AdminUser = {
    id: `admin-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    role: role?.trim() || 'Administrator',
    password: password,
    created_at: new Date().toISOString()
  };

  const users = getAdminUsers();
  users.unshift(newAdmin);
  saveAdminUsers(users);
  setCurrentAdmin(newAdmin);

  return {
    success: true,
    message: 'Admin profile created and authenticated.',
    user: newAdmin
  };
}

/**
 * Asynchronously authenticates an administrator using Supabase Auth with RBAC verification
 */
export async function authenticateAdminAsync(
  email: string,
  password?: string
): Promise<{ success: boolean; message: string; user?: AdminUser }> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, message: data.message || 'Authentication failed.' };
    }

    const adminUser: AdminUser = {
      id: data.user.id, // Real Supabase Auth UUID
      name: data.user.name,
      email: data.user.email,
      role: data.user.role || 'Administrator',
      created_at: data.user.created_at || new Date().toISOString()
    };

    setCurrentAdmin(adminUser);
    return { success: true, message: 'Authentication verified.', user: adminUser };
  } catch (err: any) {
    console.warn('Async admin login fallback to local', err);
    return authenticateAdmin(email, password);
  }
}

/**
 * Synchronous administrator authentication (checks local credentials + master)
 */
export function authenticateAdmin(
  email: string,
  password?: string
): { success: boolean; message: string; user?: AdminUser } {
  const normalizedEmail = email.trim().toLowerCase();

  const users = getAdminUsers();
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (found) {
    if (found.password && password && found.password !== password) {
      return { success: false, message: 'Incorrect password for this administrator account.' };
    }
    setCurrentAdmin(found);
    return { success: true, message: 'Authenticated successfully!', user: found };
  }

  return {
    success: false,
    message: 'No administrator profile found for this email address.'
  };
}

/**
 * Asynchronously resets administrator password in Supabase Auth
 */
export async function resetAdminPasswordAsync(
  email: string,
  passkey: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/admin/auth/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, passkey, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      // Sync local storage copy if present
      const users = getAdminUsers();
      const index = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (index >= 0) {
        users[index].password = newPassword;
        saveAdminUsers(users);
      }
      const current = getCurrentAdmin();
      if (current && current.email.toLowerCase() === email.trim().toLowerCase()) {
        current.password = newPassword;
        setCurrentAdmin(current);
      }
    }
    return data;
  } catch (err: any) {
    return resetAdminPassword(email, passkey, newPassword);
  }
}

/**
 * Synchronous password reset fallback
 */
export function resetAdminPassword(
  email: string,
  passkey: string,
  newPassword: string
): { success: boolean; message: string } {
  const normalizedEmail = email.trim().toLowerCase();

  if (passkey.trim().toUpperCase() !== ADMIN_SECRET_PASSKEY) {
    return {
      success: false,
      message: 'Invalid Secret Passkey. Authorized passkey required to reset administrator password.'
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'New password must be at least 6 characters long.' };
  }

  const users = getAdminUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

  if (index >= 0) {
    users[index].password = newPassword;
    saveAdminUsers(users);
    return {
      success: true,
      message: 'Administrator password reset successfully! You can now sign in.'
    };
  }

  return {
    success: false,
    message: 'No administrator profile found for this email address.'
  };
}

/**
 * Fetch all registered admin users from Supabase Auth Users
 */
export async function fetchAdminUsersFromSupabase(): Promise<AdminUser[]> {
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.admins) && data.admins.length > 0) {
        saveAdminUsers(data.admins);
        return data.admins;
      }
    }
  } catch (e) {
    console.warn('Error fetching admin users from Supabase', e);
  }
  return getAdminUsers();
}

/**
 * Verifies if the entered password or passkey matches the master passkey (RGAM26),
 * the currently logged in administrator's password, or any registered administrator password.
 */
export function verifyAdminPassword(input: string): boolean {
  if (!input || !input.trim()) return false;
  const trimmed = input.trim();

  // 1. Check against master passkey RGAM26 (case-insensitive)
  if (trimmed.toUpperCase() === ADMIN_SECRET_PASSKEY) {
    return true;
  }

  // 2. Check current active administrator's password
  const current = getCurrentAdmin();
  if (current?.password && current.password === trimmed) {
    return true;
  }

  // 3. Check all registered administrator passwords
  const users = getAdminUsers();
  if (users.some((u) => u.password && u.password === trimmed)) {
    return true;
  }

  return false;
}
