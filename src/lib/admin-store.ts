'use client';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  created_at: string;
}

export const ADMIN_SECRET_PASSKEY = 'RGAM26';
const ADMIN_USERS_KEY = 'peptrabio_admin_users_v1';
const CURRENT_ADMIN_KEY = 'peptrabio_current_admin_v1';
const ADMIN_AUTH_KEY = 'peptrabio_admin_auth';

const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-master',
  name: 'Master Administrator',
  email: 'admin@peptrabio.com',
  role: 'Administrator',
  created_at: new Date().toISOString()
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAdminUsers(): AdminUser[] {
  if (!isBrowser()) return [DEFAULT_ADMIN];
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
      return [DEFAULT_ADMIN];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [DEFAULT_ADMIN];
    }
    return parsed;
  } catch {
    return [DEFAULT_ADMIN];
  }
}

export function saveAdminUsers(users: AdminUser[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving admin users', err);
  }
}

export function getCurrentAdmin(): AdminUser {
  if (!isBrowser()) return DEFAULT_ADMIN;
  try {
    const raw = localStorage.getItem(CURRENT_ADMIN_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return DEFAULT_ADMIN;
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
 * Creates a new administrator profile with required secret passkey verification
 */
export function createAdminProfile(params: {
  name: string;
  email: string;
  password: string;
  passkey: string;
  role?: string;
}): { success: boolean; message: string; user?: AdminUser } {
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

  const normalizedEmail = email.trim().toLowerCase();

  // Prevent customer accounts from being registered as admin
  if (isCustomerEmail(normalizedEmail)) {
    return {
      success: false,
      message: 'This email is already registered as a Customer/Researcher account and cannot be used for administrative access.'
    };
  }

  // Verify secret passkey (RGAM26)
  const normalizedPasskey = passkey.trim().toUpperCase();
  if (normalizedPasskey !== ADMIN_SECRET_PASSKEY) {
    return {
      success: false,
      message: 'Invalid Secret Passkey. Please provide a valid authorization passkey to create an admin account.'
    };
  }

  const users = getAdminUsers();

  // Check if admin email already exists
  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return {
      success: false,
      message: 'An administrator account with this email address already exists.'
    };
  }

  const newAdmin: AdminUser = {
    id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    email: normalizedEmail,
    role: role?.trim() || 'Administrator',
    password: password,
    created_at: new Date().toISOString()
  };

  users.push(newAdmin);
  saveAdminUsers(users);
  setCurrentAdmin(newAdmin);

  return {
    success: true,
    message: 'Admin profile created and authenticated successfully!',
    user: newAdmin
  };
}

/**
 * Authenticate existing administrator
 */
export function authenticateAdmin(
  email: string,
  password?: string
): { success: boolean; message: string; user?: AdminUser } {
  const normalizedEmail = email.trim().toLowerCase();

  // Block customer emails from admin login if they do not have an explicit admin profile
  const users = getAdminUsers();
  const isAdminUser = users.some((u) => u.email.toLowerCase() === normalizedEmail);

  if (isCustomerEmail(normalizedEmail) && !isAdminUser) {
    return {
      success: false,
      message: 'This email is registered as a customer/researcher account. Please sign in through the customer portal.'
    };
  }

  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (found) {
    if (found.password && password && found.password !== password) {
      return { success: false, message: 'Incorrect password for this administrator account.' };
    }
    setCurrentAdmin(found);
    return { success: true, message: 'Authenticated successfully!', user: found };
  }

  // Fallback demo matching for admin@peptrabio.com or dedicated admin addresses
  if (normalizedEmail === 'admin@peptrabio.com') {
    const fallbackUser: AdminUser = {
      id: `admin-${Date.now()}`,
      name: 'Administrator',
      email: normalizedEmail,
      role: 'Administrator',
      created_at: new Date().toISOString()
    };
    setCurrentAdmin(fallbackUser);
    return { success: true, message: 'Authenticated successfully!', user: fallbackUser };
  }

  return {
    success: false,
    message: 'No administrator found with this email. Please check your credentials or create an admin profile.'
  };
}

/**
 * Resets administrator password with required secret passkey verification
 */
export function resetAdminPassword(
  email: string,
  passkey: string,
  newPassword: string
): { success: boolean; message: string } {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { success: false, message: 'Please enter your administrator email address.' };
  }

  // Validate secret passkey (RGAM26)
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

  if (normalizedEmail === 'admin@peptrabio.com') {
    const updatedUser: AdminUser = {
      id: 'admin-master',
      name: 'Master Administrator',
      email: 'admin@peptrabio.com',
      role: 'Administrator',
      password: newPassword,
      created_at: new Date().toISOString()
    };
    users.push(updatedUser);
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

  // 4. Fallback default administrator credentials
  if (trimmed === 'admin123' || trimmed === 'peptrabio2026') {
    return true;
  }

  return false;
}
