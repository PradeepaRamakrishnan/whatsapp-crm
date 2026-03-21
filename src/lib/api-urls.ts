/**
 * Centralized API URL configuration.
 *
 * Automatically derives the base URL from whichever service URL is already
 * configured in Railway (auth or users). No extra env vars required.
 *
 * Priority order for base:
 *   1. NEXT_PUBLIC_API_BASE_URL       (explicit override)
 *   2. Derived from NEXT_PUBLIC_AUTH_API_URL  (strip /auth)
 *   3. Derived from NEXT_PUBLIC_USERS_API_URL (strip /users)
 *
 * Individual service URLs can still be overridden:
 *   NEXT_PUBLIC_CAMPAIGNS_API_URL, NEXT_PUBLIC_FILES_API_URL, etc.
 */
function deriveBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/+$/, '');
  }
  const auth = process.env.NEXT_PUBLIC_AUTH_API_URL || '';
  if (auth) {
    return auth.replace(/\/auth\/?$/, '').replace(/\/+$/, '');
  }
  const users = process.env.NEXT_PUBLIC_USERS_API_URL || '';
  if (users) {
    return users.replace(/\/users\/?$/, '').replace(/\/+$/, '');
  }
  return '';
}

const BASE = deriveBase();

export const API_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_API_URL || `${BASE}/auth`,
  users: process.env.NEXT_PUBLIC_USERS_API_URL || `${BASE}/users`,
  files: process.env.NEXT_PUBLIC_FILES_API_URL || `${BASE}/files`,
  campaigns: process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL || `${BASE}/campaigns`,
  settings: process.env.NEXT_PUBLIC_SETTINGS_API_URL || `${BASE}/settings`,
  leads: process.env.NEXT_PUBLIC_LEADS_API_URL || `${BASE}/leads`,
  businessLeads: process.env.NEXT_PUBLIC_LEADS_API_URL
    ? process.env.NEXT_PUBLIC_LEADS_API_URL.replace(/\/leads\/?$/, '/business-leads')
    : `${BASE}/business-leads`,
  leadGenerationSchedulers: process.env.NEXT_PUBLIC_LEADS_API_URL
    ? process.env.NEXT_PUBLIC_LEADS_API_URL.replace(/\/leads\/?$/, '/lead-generation-schedulers')
    : `${BASE}/lead-generation-schedulers`,
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_API_URL || `${BASE}/business-whatsapp`,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_API_URL || `${BASE}/instagram`,
  email: process.env.NEXT_PUBLIC_EMAIL_API_URL || `${BASE}/email-business`,
} as const;
