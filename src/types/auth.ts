export interface User {
  id: string;
  _id: string;
  email: string;
  role: 'admin' | 'agent' | 'customer' | 'designer' | 'merchant';
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
    phone: string;
  };
  status: {
    isOnline: boolean;
    lastSeen: string;
  };
  settings: {
    notifications: { email: boolean; push: boolean };
    theme: 'light' | 'dark';
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role?: 'admin' | 'agent' | 'customer' | 'designer' | 'merchant';
  firstName?: string;
  lastName?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  theme?: 'light' | 'dark';
}
