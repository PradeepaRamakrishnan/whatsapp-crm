import axios, { AxiosError } from 'axios';
import type { InstagramAccount, InstagramConversation, InstagramMessage } from '../types';

const usersClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_USERS_API_URL}`,
  withCredentials: true,
});

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_INSTAGRAM_API_URL}`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

// Fetch userId + accessToken from /me and cache per tab reload
let meCache: { id: string; accessToken: string } | null = null;

async function getMe(): Promise<{ id: string; accessToken: string }> {
  if (meCache) return meCache;
  const res = await usersClient.get('/me');
  meCache = { id: res.data.id as string, accessToken: res.data.accessToken as string };
  return meCache;
}

// Attach Bearer token to every Instagram API request
axiosClient.interceptors.request.use(async (config) => {
  try {
    const { accessToken } = await getMe();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  } catch {
    /* ignore — request will fail with 401 if no token */
  }
  return config;
});

export async function getInstagramAccounts(): Promise<InstagramAccount[]> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosClient.get('/accounts', { params: { userId } });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      throw new Error(
        `[${status}] ${data?.message || data?.error || JSON.stringify(data) || 'Failed to fetch Instagram accounts'}`,
      );
    }
    throw error;
  }
}

export async function getInstagramConversations(
  accountId?: string,
): Promise<InstagramConversation[]> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosClient.get('/usernames', {
      params: { userId, ...(accountId ? { id: accountId } : {}) },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      throw new Error(
        `[${status}] ${data?.message || data?.error || JSON.stringify(data) || 'Failed to fetch conversations'}`,
      );
    }
    throw error;
  }
}

export async function connectInstagramAccount(accessToken: string): Promise<InstagramAccount> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosClient.post('/connect', { accessToken, userId });
    return response.data?.data ?? response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      throw new Error(
        `[${status}] ${data?.message || data?.error || JSON.stringify(data) || 'Failed to connect Instagram account'}`,
      );
    }
    throw error;
  }
}

export async function disconnectInstagramAccount(id: string): Promise<{ message: string }> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosClient.post(`/accounts/${id}/disconnect`, { userId });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to disconnect Instagram account');
    }
    throw error;
  }
}

export async function refreshInstagramToken(id: string): Promise<{ message: string }> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosClient.post(`/accounts/${id}/refresh-token`, { userId });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to refresh Instagram token');
    }
    throw error;
  }
}

export async function sendInstagramMessage(
  accountId: string,
  to: string,
  message: string,
): Promise<InstagramMessage> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosClient.post('/send', { accountId, to, message, userId });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to send Instagram message');
    }
    throw error;
  }
}
