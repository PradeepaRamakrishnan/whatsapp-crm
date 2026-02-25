import axios, { AxiosError } from 'axios';
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
  isCustom: boolean;
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
    const response = await axiosUrl.get('/messages/usernames', {
      params: { userId, ...(accountId ? { id: accountId } : {}) },
    });
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? data : [];
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
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      throw new Error(
        `[${status}] ${data?.message || data?.error || JSON.stringify(data) || 'Failed to fetch messages'}`,
      );
    }
    throw error;
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
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data;
      throw new Error(
        `[${status}] ${data?.message || data?.error || JSON.stringify(data) || 'Failed to fetch messages'}`,
      );
    }
    throw error;
  }
}

export async function connectInstagramAccount(accessToken: string): Promise<InstagramAccount> {
  try {
    const { id: userId } = await getMe();
    const response = await axiosUrl.post('/connect', { accessToken, userId });
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
    const response = await axiosUrl.post(`/accounts/${id}/disconnect`, { userId });
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
    const response = await axiosUrl.post(`/accounts/${id}/refresh-token`, { userId });
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
    const response = await axiosUrl.post('/send', { accountId, to, message, userId });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to send Instagram message');
    }
    throw error;
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
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to sync Instagram templates');
    }
    throw error;
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
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Instagram templates');
    }
    throw error;
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
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to sync Instagram messages');
    }
    throw error;
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
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to create custom template');
    }
    throw error;
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
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update template');
    }
    throw error;
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
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to update automation settings');
    }
    throw error;
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
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to delete template');
    }
    throw error;
  }
}
