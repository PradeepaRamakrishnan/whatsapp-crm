import type {
  ConnectProviderPayload,
  EmailAccount,
  EmailConversation,
  EmailMessage,
  SendEmailPayload,
} from '../types';

const trimSlash = (s: string) => s.replace(/\/+$/, '');
const API_URL = trimSlash(
  process.env.NEXT_PUBLIC_EMAIL_API_URL || 'http://localhost:3013/email-business',
);
const ACCESS_TOKEN_KEY = 'crm_access_token';

const getToken = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
};

const request = async (url: string, init: RequestInit = {}): Promise<unknown> => {
  const token = getToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      'x-access-token': token,
    },
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Request failed');
  return data;
};

// ─── Accounts ────────────────────────────────────────────────────────────────

export const connectEmailAccount = (payload: ConnectProviderPayload): Promise<EmailAccount> =>
  request(`${API_URL}/accounts`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<EmailAccount>;

export const listEmailAccounts = (): Promise<EmailAccount[]> =>
  request(`${API_URL}/accounts`) as Promise<EmailAccount[]>;

export const disconnectEmailAccount = (id: string): Promise<{ message: string }> =>
  request(`${API_URL}/accounts/${id}`, { method: 'DELETE' }) as Promise<{ message: string }>;

export const testEmailAccount = (id: string): Promise<{ message: string }> =>
  request(`${API_URL}/accounts/${id}/test`, { method: 'POST' }) as Promise<{ message: string }>;

export const syncEmailAccount = (id: string): Promise<{ synced: number }> =>
  request(`${API_URL}/accounts/${id}/sync`, { method: 'POST' }) as Promise<{ synced: number }>;

// ─── Send ─────────────────────────────────────────────────────────────────────

export const sendEmail = (payload: SendEmailPayload): Promise<{ message: string }> =>
  request(`${API_URL}/send`, { method: 'POST', body: JSON.stringify(payload) }) as Promise<{
    message: string;
  }>;

// ─── Inbox ────────────────────────────────────────────────────────────────────

export const getEmailConversations = (accountId: string): Promise<EmailConversation[]> =>
  request(`${API_URL}/conversations?accountId=${encodeURIComponent(accountId)}`) as Promise<
    EmailConversation[]
  >;

export const getEmailMessages = (
  accountId: string,
  contactEmail: string,
): Promise<EmailMessage[]> =>
  request(
    `${API_URL}/conversations/messages?accountId=${encodeURIComponent(accountId)}&contactEmail=${encodeURIComponent(contactEmail)}`,
  ) as Promise<EmailMessage[]>;
