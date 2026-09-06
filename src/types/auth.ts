export interface UserProfile {
  id: string;
  email: string;
  name: string;
  institution?: string;
  phone?: string;
  role?: 'customer' | 'researcher' | 'admin';
  createdAt: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  institution?: string;
  phone?: string;
}
