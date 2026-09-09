'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { createClient } from '@/lib/supabase/client';

interface StoredUserRecord extends UserProfile {
  passwordHash?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'peptrabio_user_session';
const USERS_DB_KEY = 'peptrabio_registered_users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check Supabase session first, then localStorage
    const initAuth = async () => {
      try {
        const supabase = createClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const sbUser = data.session.user;
            const profile: UserProfile = {
              id: sbUser.id,
              email: sbUser.email || '',
              name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Researcher',
              phone: sbUser.user_metadata?.phone || '',
              institution: sbUser.user_metadata?.institution || '',
              role: sbUser.user_metadata?.role || 'researcher',
              createdAt: sbUser.created_at,
            };
            setUser(profile);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
            setIsLoading(false);
            return;
          }
        }

        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse user session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const getRegisteredUsers = (): StoredUserRecord[] => {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users: StoredUserRecord[]) => {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users db:', e);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password || '';

      // 1. Try Supabase Auth Login
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!error && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split('@')[0],
            phone: data.user.user_metadata?.phone || '',
            institution: data.user.user_metadata?.institution || '',
            role: data.user.user_metadata?.role || 'researcher',
            createdAt: data.user.created_at,
          };
          setUser(profile);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
          return { success: true };
        } else if (error && !error.message.toLowerCase().includes('failed to fetch')) {
          // If Supabase returned an explicit auth error (e.g. Invalid login credentials)
          // Also check local database fallback if local demo account
          const users = getRegisteredUsers();
          const localUser = users.find((u) => u.email.toLowerCase() === email);
          if (!localUser) {
            return { success: false, error: error.message };
          }
        }
      }

      // 2. Local fallback
      const users = getRegisteredUsers();
      const matchedUser = users.find((u) => u.email.toLowerCase() === email);

      if (!matchedUser) {
        return {
          success: false,
          error: 'No account found with this email address. Please create an account to proceed.'
        };
      }

      if (matchedUser.passwordHash && matchedUser.passwordHash !== password) {
        return {
          success: false,
          error: 'Incorrect password. Please verify your credentials and try again.'
        };
      }

      const userProfile: UserProfile = {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name,
        phone: matchedUser.phone,
        institution: matchedUser.institution,
        role: matchedUser.role || 'researcher',
        createdAt: matchedUser.createdAt,
        address: matchedUser.address,
      };

      setUser(userProfile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const email = credentials.email.trim().toLowerCase();
      const name = credentials.name.trim();
      const phone = credentials.phone?.trim() || '';
      const institution = credentials.institution?.trim() || '';
      const password = credentials.password || '';

      // Prevent using an administrative email for customer registration
      try {
        const rawAdmins = localStorage.getItem('peptrabio_admin_users_v1');
        if (rawAdmins) {
          const adminList: Array<{ email?: string }> = JSON.parse(rawAdmins);
          if (adminList.some((a) => a.email?.toLowerCase() === email)) {
            return {
              success: false,
              error: 'This email address is registered as an Administrator account. Please sign in via the Admin Portal or use a different email.'
            };
          }
        }
      } catch {}

      // Save user profile state
      const newUser: StoredUserRecord = {
        id: `usr_${Date.now()}`,
        email: email,
        name: name,
        phone: phone,
        institution: institution,
        passwordHash: password,
        role: 'researcher',
        createdAt: new Date().toISOString(),
      };

      const users = getRegisteredUsers();
      const existingIdx = users.findIndex((u) => u.email.toLowerCase() === email);
      if (existingIdx >= 0) {
        users[existingIdx] = newUser;
      } else {
        users.push(newUser);
      }
      saveRegisteredUsers(users);

      const userProfile: UserProfile = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        institution: newUser.institution,
        role: newUser.role,
        createdAt: newUser.createdAt,
      };

      setUser(userProfile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    const updated: UserProfile = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));

    // Update record in users db
    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      saveRegisteredUsers(users);
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
