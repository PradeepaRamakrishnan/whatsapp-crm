const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const deriveFallbackWhatsappApiUrl = () => {
  const usersApiUrl = process.env.NEXT_PUBLIC_USERS_API_URL || '';
  if (!usersApiUrl) return '';

  const usersBase = trimTrailingSlash(usersApiUrl);
  if (!usersBase) return '';

  const origin = usersBase.endsWith('/users') ? usersBase.slice(0, -'/users'.length) : usersBase;
  return `${origin}/business-whatsapp`;
};

const API_URL =
  trimTrailingSlash(process.env.NEXT_PUBLIC_WHATSAPP_API_URL || '') ||
  deriveFallbackWhatsappApiUrl();
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
  if (!API_URL) {
    throw new Error(
      'WhatsApp API URL is not configured. Set NEXT_PUBLIC_WHATSAPP_API_URL or NEXT_PUBLIC_USERS_API_URL.',
    );
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
    'x-access-token': token,
    'x-auth-token': token,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch (error) {
    const fallbackApiUrl = deriveFallbackWhatsappApiUrl();
    const shouldRetryWithFallback =
      error instanceof TypeError && !!fallbackApiUrl && fallbackApiUrl !== API_URL;

    if (!shouldRetryWithFallback) throw error;

    const fallbackUrl = url.startsWith(`${API_URL}/`)
      ? `${fallbackApiUrl}${url.slice(API_URL.length)}`
      : url;

    res = await fetch(fallbackUrl, {
      ...init,
      headers,
      credentials: 'include',
    });
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

type ConnectWabaPayload = {
  accessToken: string;
  redirectUri?: string;
  wabaId?: string;
  phoneNumberId?: string;
};

export type ConnectSystemNumberPayload = {
  accountId: string;
  phoneNumber: string;
  otpForwardingNumber: string;
  verifiedName: string;
  displayName?: string;
  category: string;
  description?: string;
};

export type VerifySystemNumberPayload = {
  phoneNumberId: string;
  code: string;
};

type WhatsappTemplatePayload = {
  externalTemplateId?: string;
  name: string;
  language: string;
  category?: string;
  status?: string;
  components?: Record<string, unknown>[];
  accountId?: string;
};

type SubmitTemplatePayload = {
  accountId: string;
  name: string;
  language: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  components: Record<string, unknown>[];
};

// POST /business-whatsapp/connect
export const connectWaba = async (payload: ConnectWabaPayload) => {
  return request(`${API_URL}/connect`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// POST /business-whatsapp/connect-system-number
export const connectViaSystemNumber = async (payload: ConnectSystemNumberPayload) => {
  return request(`${API_URL}/connect-system-number`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// POST /business-whatsapp/verify-system-number
export const verifySystemNumber = async (payload: VerifySystemNumberPayload) => {
  return request(`${API_URL}/verify-system-number`, {
    method: 'POST',
    body: JSON.stringify(payload),
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

// GET /business-whatsapp/accounts/:id
export const getAccountById = async (accountId: string) => {
  return request(`${API_URL}/accounts/${accountId}`);
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

// GET /business-whatsapp/templates
export const getAllTemplates = async (accountId?: string) => {
  const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
  return request(`${API_URL}/templates${query}`);
};

// POST /business-whatsapp/templates
export const createTemplate = async (payload: WhatsappTemplatePayload) => {
  return request(`${API_URL}/templates`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// POST /business-whatsapp/templates/submit  (sends to Meta → PENDING)
export const submitTemplate = async (payload: SubmitTemplatePayload) => {
  return request(`${API_URL}/templates/submit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// PATCH /business-whatsapp/templates/:id
export const updateTemplate = async (
  templateId: string,
  payload: Partial<Omit<WhatsappTemplatePayload, 'externalTemplateId'>>,
) => {
  return request(`${API_URL}/templates/${templateId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

// POST /business-whatsapp/templates/sync
export const syncTemplates = async (payload: { accountId: string }) => {
  return request(`${API_URL}/templates/sync`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ─── Phone Number Management ──────────────────────────────────────────────────

// GET /business-whatsapp/accounts/:id/phones
export const listPhoneNumbers = async (accountId: string) =>
  request(`${API_URL}/accounts/${accountId}/phones`);

// GET /business-whatsapp/accounts/:id/phones/available
export const fetchAvailableFromMeta = async (accountId: string) =>
  request(`${API_URL}/accounts/${accountId}/phones/available`);

// POST /business-whatsapp/accounts/:id/phones
export const addPhoneNumber = async (accountId: string, phoneNumberId: string) =>
  request(`${API_URL}/accounts/${accountId}/phones`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumberId }),
  });

// PATCH /business-whatsapp/accounts/:id/phones/:pid/default
export const setDefaultPhone = async (accountId: string, phoneNumberId: string) =>
  request(`${API_URL}/accounts/${accountId}/phones/${phoneNumberId}/default`, {
    method: 'PATCH',
  });

// DELETE /business-whatsapp/accounts/:id/phones/:pid
export const removePhoneNumber = async (accountId: string, phoneNumberId: string) =>
  request(`${API_URL}/accounts/${accountId}/phones/${phoneNumberId}`, {
    method: 'DELETE',
  });

// ─── OTP Verification ─────────────────────────────────────────────────────────

// POST /business-whatsapp/verify/send-otp
export const sendOtp = async (payload: { accountId: string; phoneNumberId: string }) =>
  request(`${API_URL}/verify/send-otp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/verify/check-otp
export const verifyOtp = async (payload: {
  accountId: string;
  phoneNumberId: string;
  code: string;
}) =>
  request(`${API_URL}/verify/check-otp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/verify/resend-otp
export const resendOtp = async (payload: { accountId: string; phoneNumberId: string }) =>
  request(`${API_URL}/verify/resend-otp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── User WhatsApp Linking ────────────────────────────────────────────────────

// POST /business-whatsapp/user-link/initiate
export const initiateUserLink = async (payload: { phoneNumber: string }) =>
  request(`${API_URL}/user-link/initiate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/user-link/verify
export const verifyUserLink = async (payload: { phoneNumber: string; otp: string }) =>
  request(`${API_URL}/user-link/verify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// GET /business-whatsapp/user-link
export const getUserLinks = async () => request(`${API_URL}/user-link`);

// DELETE /business-whatsapp/user-link/:phoneNumber
export const unlinkUser = async (phoneNumber: string) =>
  request(`${API_URL}/user-link/${encodeURIComponent(phoneNumber)}`, {
    method: 'DELETE',
  });

// ─── Conversations / Inbox ────────────────────────────────────────────────────

// GET /business-whatsapp/conversations?page&limit&status&accountId&search
export const getConversations = async (params: {
  page: number;
  limit: number;
  status?: string;
  accountId?: string;
  search?: string;
}) => {
  const q = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.status && params.status !== 'all') q.set('status', params.status);
  if (params.accountId) q.set('accountId', params.accountId);
  if (params.search) q.set('search', params.search);
  return request(`${API_URL}/conversations?${q}`);
};

// GET /business-whatsapp/conversations/:id/messages?page&limit
export const getMessages = async (conversationId: string, page = 1, limit = 50) =>
  request(`${API_URL}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);

// POST /business-whatsapp/conversations/:id/messages/text
export const sendTextMessage = async (
  conversationId: string,
  payload: { accountId: string; to: string; body: string },
) =>
  request(`${API_URL}/conversations/${conversationId}/messages/text`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/conversations/:id/messages/media
export const sendMediaMessage = async (
  conversationId: string,
  payload: {
    accountId: string;
    to: string;
    type: 'image' | 'video' | 'audio' | 'document';
    mediaUrl: string;
    caption?: string;
    filename?: string;
  },
) =>
  request(`${API_URL}/conversations/${conversationId}/messages/media`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/conversations/:id/messages/interactive
export const sendInteractiveMessage = async (
  conversationId: string,
  payload: { accountId: string; to: string; interactive: Record<string, unknown> },
) =>
  request(`${API_URL}/conversations/${conversationId}/messages/interactive`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// PATCH /business-whatsapp/conversations/:id/read
export const markConversationAsRead = async (conversationId: string) =>
  request(`${API_URL}/conversations/${conversationId}/read`, { method: 'PATCH' });

// PATCH /business-whatsapp/conversations/:id/status
export const updateConversationStatus = async (conversationId: string, status: string) =>
  request(`${API_URL}/conversations/${conversationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ─── Contacts ────────────────────────────────────────────────────────────────

// GET /business-whatsapp/contacts?page&limit&search&status
export const getContacts = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}) => {
  const q = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.search) q.set('search', params.search);
  if (params.status && params.status !== 'all') q.set('status', params.status);
  return request(`${API_URL}/contacts?${q}`);
};

// POST /business-whatsapp/contacts
export const createContact = async (payload: {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags?: string[];
  notes?: string;
  assignedAccountId?: string;
}) =>
  request(`${API_URL}/contacts`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// PATCH /business-whatsapp/contacts/:id
export const updateContact = async (
  id: string,
  payload: Partial<{
    name: string;
    phone: string;
    email: string;
    company: string;
    tags: string[];
    notes: string;
    assignedAccountId: string;
    status: string;
    optedIn: boolean;
  }>,
) =>
  request(`${API_URL}/contacts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

// DELETE /business-whatsapp/contacts/:id
export const deleteContact = async (id: string) =>
  request(`${API_URL}/contacts/${id}`, { method: 'DELETE' });

// POST /business-whatsapp/contacts/import
export const importContacts = async (payload: {
  contacts: Array<{ name: string; phone: string; email?: string; company?: string }>;
  accountId: string;
}) =>
  request(`${API_URL}/contacts/import`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Bulk Messaging ────────────────────────────────────────────────────────────

// GET /business-whatsapp/bulk?page&limit&status
export const getBulkCampaigns = async (params: {
  page: number;
  limit: number;
  status?: string;
}) => {
  const q = new URLSearchParams({ page: String(params.page), limit: String(params.limit) });
  if (params.status && params.status !== 'all') q.set('status', params.status);
  return request(`${API_URL}/bulk?${q}`);
};

// GET /business-whatsapp/bulk/:id
export const getBulkCampaign = async (id: string) => request(`${API_URL}/bulk/${id}`);

// GET /business-whatsapp/bulk/:id/contacts?page&limit
export const getBulkCampaignContacts = async (id: string, page = 1, limit = 50) =>
  request(`${API_URL}/bulk/${id}/contacts?page=${page}&limit=${limit}`);

// POST /business-whatsapp/bulk
export const createBulkCampaign = async (payload: {
  name: string;
  accountId: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
  contactIds?: string[];
  scheduledAt?: string;
}) =>
  request(`${API_URL}/bulk`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/bulk/:id/start
export const startBulkCampaign = async (id: string) =>
  request(`${API_URL}/bulk/${id}/start`, { method: 'POST' });

// POST /business-whatsapp/bulk/:id/pause
export const pauseBulkCampaign = async (id: string) =>
  request(`${API_URL}/bulk/${id}/pause`, { method: 'POST' });

// DELETE /business-whatsapp/bulk/:id
export const deleteBulkCampaign = async (id: string) =>
  request(`${API_URL}/bulk/${id}`, { method: 'DELETE' });

// ─── Analytics ────────────────────────────────────────────────────────────────

// GET /business-whatsapp/analytics?period&accountId&startDate&endDate
export const getAnalytics = async (params: {
  period: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const q = new URLSearchParams({ period: params.period });
  if (params.accountId) q.set('accountId', params.accountId);
  if (params.startDate) q.set('startDate', params.startDate);
  if (params.endDate) q.set('endDate', params.endDate);
  return request(`${API_URL}/analytics?${q}`);
};

// GET /business-whatsapp/analytics/stats?period&accountId
export const getMessageStats = async (params: { period: string; accountId?: string }) => {
  const q = new URLSearchParams({ period: params.period });
  if (params.accountId) q.set('accountId', params.accountId);
  return request(`${API_URL}/analytics/stats?${q}`);
};

// ─── Webhook Settings ─────────────────────────────────────────────────────────

// GET /business-whatsapp/settings/webhook
export const getWebhookConfig = async () => request(`${API_URL}/settings/webhook`);

// PUT /business-whatsapp/settings/webhook
export const updateWebhookConfig = async (payload: {
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
}) =>
  request(`${API_URL}/settings/webhook`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/settings/webhook/test
export const testWebhook = async () =>
  request(`${API_URL}/settings/webhook/test`, { method: 'POST' });

// GET /business-whatsapp/settings/webhook/logs?page&limit
export const getWebhookLogs = async (page = 1, limit = 20) =>
  request(`${API_URL}/settings/webhook/logs?page=${page}&limit=${limit}`);

// ─── API Keys ─────────────────────────────────────────────────────────────────

// GET /business-whatsapp/settings/api-keys
export const getApiKeys = async () => request(`${API_URL}/settings/api-keys`);

// POST /business-whatsapp/settings/api-keys
export const createApiKey = async (payload: {
  name: string;
  scopes: string[];
  expiresAt?: string;
}) =>
  request(`${API_URL}/settings/api-keys`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// DELETE /business-whatsapp/settings/api-keys/:id
export const revokeApiKey = async (id: string) =>
  request(`${API_URL}/settings/api-keys/${id}`, { method: 'DELETE' });

// ─── Sandbox ──────────────────────────────────────────────────────────────────

// POST /business-whatsapp/sandbox/send
export const sendSandboxMessage = async (payload: {
  accountId: string;
  type: string;
  body?: string;
  mediaUrl?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParams?: string[];
}) =>
  request(`${API_URL}/sandbox/send`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// POST /business-whatsapp/sandbox/simulate-incoming
export const simulateIncoming = async (payload: {
  accountId: string;
  from: string;
  body: string;
}) =>
  request(`${API_URL}/sandbox/simulate-incoming`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// GET /business-whatsapp/sandbox/messages?accountId&limit
export const getSandboxMessages = async (accountId: string, limit = 50) =>
  request(`${API_URL}/sandbox/messages?accountId=${encodeURIComponent(accountId)}&limit=${limit}`);

// DELETE /business-whatsapp/sandbox/messages?accountId
export const clearSandboxMessages = async (accountId: string) =>
  request(`${API_URL}/sandbox/messages?accountId=${encodeURIComponent(accountId)}`, {
    method: 'DELETE',
  });
