/** biome-ignore-all lint/style/useNamingConvention: <axios> */
import axios, { AxiosError } from 'axios';
import type { User } from '../types/auth.types';

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AUTH_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export const authApi = {
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await axiosClient<User>({
        method: 'POST',
        url: `/login`,
        data: { email, password },
        withCredentials: true,
      });

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to call login API');
      }
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await axios<User>({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_USERS_API_URL}/me`,
        withCredentials: true,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch current user');
      }
      throw error;
    }
  },

  changePassword: async (): Promise<unknown> => {
    try {
      const response = await axiosClient({
        method: 'PATCH',
        url: `/change-password`,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to change password');
      }
      throw error;
    }
  },

  logout: async (): Promise<unknown> => {
    try {
      const response = await axiosClient({
        method: 'POST',
        url: `/logout`,
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to logout');
      }
      throw error;
    }
  },
};
