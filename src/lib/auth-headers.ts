const ACCESS_TOKEN_KEY = 'crm_access_token';

/**
 * Returns Authorization header with the JWT token stored in localStorage.
 * Safe to call from client-side code (returns empty if not in browser).
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(ACCESS_TOKEN_KEY) || '';
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
