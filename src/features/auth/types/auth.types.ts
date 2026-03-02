export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  role: string;
  accessToken?: string;
  refreshToken?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
