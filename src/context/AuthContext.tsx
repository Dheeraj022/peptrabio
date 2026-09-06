'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, LoginCredentials, RegisterCredentials } from '@/types/auth';

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
    // Check localStorage active session
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse user session:', e);
    } finally {
      setIsLoading(false);
    }
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
      await new Promise((resolve) => setTimeout(resolve, 350));

      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password || '';

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
      await new Promise((resolve) => setTimeout(resolve, 400));

      const email = credentials.email.trim().toLowerCase();
      const users = getRegisteredUsers();

      // Check if user already exists
      const existing = users.find((u) => u.email.toLowerCase() === email);
      if (existing) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.'
        };
      }

      const newUser: StoredUserRecord = {
        id: `usr_${Date.now()}`,
        email: credentials.email.trim(),
        name: credentials.name.trim(),
        phone: credentials.phone?.trim() || '',
        institution: credentials.institution?.trim() || '',
        passwordHash: credentials.password || '',
        role: 'researcher',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
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
