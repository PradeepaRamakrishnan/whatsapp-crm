'use client';

import { createContext, type ReactNode, useContext } from 'react';
import useSWR from 'swr';
import { authApi } from '@/features/auth/services';
import type { LoginCredentials, User } from '@/features/auth/types/auth.types';

interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    data: user,
    isLoading,
    mutate,
  } = useSWR<User>('/api/users/me', authApi.getCurrentUser, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const login = async (credentials: LoginCredentials) => {
    await authApi.login(credentials.email, credentials.password);
    mutate();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
