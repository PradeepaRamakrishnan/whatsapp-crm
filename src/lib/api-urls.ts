/**
 * Centralized API URL configuration.
 *
 * Set ONE env var in Railway/production:
 *   NEXT_PUBLIC_API_BASE_URL=https://your-ec2-domain.com
 *
 * Individual service URLs can still be overridden:
 *   NEXT_PUBLIC_AUTH_API_URL, NEXT_PUBLIC_CAMPAIGNS_API_URL, etc.
 */
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '');

export const API_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_API_URL || `${BASE}/auth`,
  users: process.env.NEXT_PUBLIC_USERS_API_URL || `${BASE}/users`,
  files: process.env.NEXT_PUBLIC_FILES_API_URL || `${BASE}/files`,
  campaigns: process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL || `${BASE}/campaigns`,
  settings: process.env.NEXT_PUBLIC_SETTINGS_API_URL || `${BASE}/settings`,
  leads: process.env.NEXT_PUBLIC_LEADS_API_URL || `${BASE}/leads`,
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_API_URL || `${BASE}/business-whatsapp`,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_API_URL || `${BASE}/instagram`,
  email: process.env.NEXT_PUBLIC_EMAIL_API_URL || `${BASE}/email-business`,
} as const;
