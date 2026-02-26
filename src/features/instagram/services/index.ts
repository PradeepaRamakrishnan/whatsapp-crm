import axios, { AxiosError } from 'axios';

function handleAxiosError(error: unknown, defaultMessage: string): never {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || data?.error || error.message || defaultMessage;
    throw new Error(status ? `[${status}] ${message}` : message);
  }
  throw error;
}

import type {
  InstagramAccount,
  InstagramConversation,
  InstagramMessage,
  InstagramTemplate,
} from '../types';

const usersClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_USERS_API_URL}`,
  withCredentials: true,
});

const axiosUrl = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_INSTAGRAM_API_URL}`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
});

let meCache: { id: string; accessToken: string } | null = null;
type ApiResponse = Record<string, unknown>;
type SyncInstagramMessagesResponse = ApiResponse & { storedMessages?: number };
type InstagramTemplateMutationInput = {
  name: string;
  accountId: string;
  category: string;
  language: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
  buttonLabel2?: string;
  buttonUrl2?: string;
  isCustom: boolean;
  status?: string;
  footer?: string;
  headerType?: string;
  headerText?: string;
};

async function getMe(): Promise<{ id: string; accessToken: string }> {
  if (meCache) return meCache;
  const res = await usersClient.get('/me');
  meCache = { id: res.data.id as string, accessToken: res.data.accessToken as string };
  return meCache;
}

// Attach Bearer token to every Instagram API request
axiosUrl.interceptors.request.use(async (config) => {
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
    const response = await axiosUrl.get('/accounts', { params: { userId } });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to fetch Instagram accounts');
  }
}

export async function getInstagramConversations(
  accountId?: string,
): Promise<InstagramConversation[]> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.get('/messages/usernames', {
      params: { userId, ...(accountId ? { id: accountId } : {}) },
    });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to fetch conversations');
  }
}

export async function getInstagramMessagesByUsername(
  username: string,
  accountId?: string,
): Promise<InstagramMessage[]> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.get('/messages/by-username', {
      params: { userId, username, ...(accountId ? { id: accountId } : {}) },
    });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to fetch messages');
  }
}

export async function getInstagramMessagesByPeerId(
  peerId: string,
  accountId?: string,
): Promise<InstagramMessage[]> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.get('/messages/by-peer-id', {
      params: { userId, peerId, ...(accountId ? { id: accountId } : {}) },
    });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to fetch messages');
  }
}

export async function connectInstagramAccount(accessToken: string): Promise<InstagramAccount> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.post('/connect', { accessToken, userId });
    return response.data?.data ?? response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to connect Instagram account');
  }
}

export async function disconnectInstagramAccount(id: string): Promise<{ message: string }> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.post(`/accounts/${id}/disconnect`, { userId });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to disconnect Instagram account');
  }
}

export async function refreshInstagramToken(id: string): Promise<{ message: string }> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.post(`/accounts/${id}/refresh-token`, { userId });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to refresh Instagram token');
  }
}

export async function sendInstagramMessage(
  accountId: string,
  to: string,
  message: string,
): Promise<InstagramMessage> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.post('/send', { accountId, to, message, userId });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to send Instagram message');
  }
}

export async function syncInstagramTemplates(id: string): Promise<ApiResponse> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.get(`/accounts/${id}/templates`, {
      params: { userId },
    });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to sync Instagram templates');
  }
}

export async function getInstagramTemplates(id: string): Promise<InstagramTemplate[]> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.get(`/accounts/${id}/templates/stored`, {
      params: { userId },
    });
    return response.data?.data ?? response.data ?? [];
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to fetch Instagram templates');
  }
}
export async function syncInstagramMessages(
  accountId: string,
): Promise<SyncInstagramMessagesResponse> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.post('/receive', { accountId, userId });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to sync Instagram messages');
  }
}

export async function createCustomInstagramTemplate(
  accountId: string,
  data: InstagramTemplateMutationInput,
): Promise<ApiResponse> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.post(`/accounts/${accountId}/templates/custom`, {
      ...data,
      userId,
    });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to create custom template');
  }
}

export async function updateInstagramTemplate(
  accountId: string,
  templateId: string,
  data: InstagramTemplateMutationInput,
): Promise<ApiResponse> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.patch(`/accounts/${accountId}/templates/${templateId}`, {
      ...data,
      userId,
    });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to update template');
  }
}

export async function updateInstagramAutomation(
  accountId: string,
  data: { enabled: boolean; templateId: string | null },
): Promise<ApiResponse> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.patch(`/accounts/${accountId}/automation`, {
      ...data,
      userId,
    });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to update automation settings');
  }
}

export async function deleteInstagramTemplate(
  accountId: string,
  templateId: string,
): Promise<ApiResponse> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.delete(`/accounts/${accountId}/templates/${templateId}`, {
      params: { userId },
    });
    return response.data;
  } catch (error: unknown) {
    handleAxiosError(error, 'Failed to delete template');
  }
}
