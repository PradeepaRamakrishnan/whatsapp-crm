import type { LoginCredentials } from '../types/auth.types';

export const login = async (credentials: LoginCredentials): Promise<void> => {
  // UI-only implementation
  // TODO: Replace with actual API call when backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API call
      console.info('Login attempt with:', credentials.email);
      resolve();
    }, 500);
  });
};

export const logout = async (): Promise<void> => {
  // UI-only implementation
  // TODO: Replace with actual API call when backend is ready
  return new Promise((resolve) => {
    setTimeout(() => {
      console.info('Logout successful');
      resolve();
    }, 300);
  });
};
