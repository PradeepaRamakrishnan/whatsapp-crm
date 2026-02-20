const API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;
const ACCESS_TOKEN_KEY = 'crm_access_token';
const LEGACY_ACCESS_TOKEN_KEYS = ['access_token', 'accessToken'] as const;

const getAuthToken = () => {
  if (typeof window === 'undefined') return '';

  const current = localStorage.getItem(ACCESS_TOKEN_KEY) || '';
  if (current) return current;

  for (const legacyKey of LEGACY_ACCESS_TOKEN_KEYS) {
    const candidate = localStorage.getItem(legacyKey) || '';
    // App auth token should be JWT. Ignore non-JWT third-party tokens.
    if (candidate && candidate.split('.').length === 3) return candidate;
  }

  return '';
};

const request = async (url: string, init: RequestInit = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('App auth token missing. Please logout and login again.');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
    'x-access-token': token,
    'x-auth-token': token,
  };

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// POST /business-whatsapp/connect
export const connectWaba = async (accessToken: string, wabaId?: string) => {
  return request(`${API_URL}/connect`, {
    method: 'POST',
    body: JSON.stringify({ accessToken, ...(wabaId ? { wabaId } : {}) }),
  });
};

// GET /business-whatsapp/accounts/:id/phone-numbers
export const getPhoneNumbers = async (accountId: string) => {
  return request(`${API_URL}/accounts/${accountId}/phone-numbers`);
};

// POST /business-whatsapp/accounts/:id/register-phone
export const registerPhone = async (accountId: string, phoneNumberId: string) => {
  return request(`${API_URL}/accounts/${accountId}/register-phone`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumberId }),
  });
};

// GET /business-whatsapp/accounts
export const getAllAccounts = async () => {
  return request(`${API_URL}/accounts`);
};

// POST /business-whatsapp/accounts/:id/disconnect
export const disconnectAccount = async (accountId: string) => {
  return request(`${API_URL}/accounts/${accountId}/disconnect`, {
    method: 'POST',
  });
};

// POST /business-whatsapp/send
export const sendMessage = async (payload: {
  accountId: string;
  to: string;
  type: 'text' | 'template';
  content?: string;
  templateName?: string;
  language?: string;
}) => {
  return request(`${API_URL}/send`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
