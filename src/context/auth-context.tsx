'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useContext } from 'react';
import { getCurrentUser, login as loginService } from '@/features/auth/services';
import type { LoginCredentials, User } from '@/features/auth/types/auth.types';

interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['users/me'],
    queryFn: async () => {
      const response = await getCurrentUser();
      return response;
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginService(credentials.email, credentials.password);
    await queryClient.invalidateQueries({ queryKey: ['users/me'] });
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
