/** biome-ignore-all lint/style/useNamingConvention: <axios> */
import axios, { AxiosError } from 'axios';
import type { User } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'crm_access_token';
const REFRESH_TOKEN_KEY = 'crm_refresh_token';
const LEGACY_ACCESS_TOKEN_KEYS = ['access_token', 'accessToken'] as const;
const LEGACY_REFRESH_TOKEN_KEYS = ['refresh_token', 'refreshToken'] as const;

type LoginApiResponse =
  | User
  | {
      user?: User;
      data?: User | { user?: User; accessToken?: string; refreshToken?: string; token?: string };
      accessToken?: string;
      refreshToken?: string;
      access_token?: string;
      refresh_token?: string;
      token?: string;
      jwt?: string;
    };

const isBrowser = () => typeof window !== 'undefined';

const isLikelyJwt = (value: string) => value.split('.').length === 3;

const getStoredToken = (key: string, legacyKeys: readonly string[] = []) => {
  if (!isBrowser()) return '';

  const current = localStorage.getItem(key) || '';
  if (current) return current;

  for (const legacyKey of legacyKeys) {
    const candidate = localStorage.getItem(legacyKey) || '';
    if (!candidate) continue;

    // Avoid using third-party OAuth tokens (Meta/Facebook) as app auth tokens.
    if (key === ACCESS_TOKEN_KEY && !isLikelyJwt(candidate)) continue;
    return candidate;
  }

  return '';
};

const saveToken = (key: string, value?: string) => {
  if (!isBrowser() || !value) return;
  localStorage.setItem(key, value);
};

const clearStoredTokens = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  for (const key of LEGACY_ACCESS_TOKEN_KEYS) localStorage.removeItem(key);
  for (const key of LEGACY_REFRESH_TOKEN_KEYS) localStorage.removeItem(key);
};

const isUserPayload = (value: unknown): value is User => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<User>;
  return !!(
    candidate.id &&
    candidate.email &&
    candidate.firstName &&
    candidate.lastName &&
    candidate.role
  );
};

const extractLoginPayload = (payload: LoginApiResponse): User => {
  const nestedData = 'data' in payload ? payload.data : undefined;
  const nestedUser =
    nestedData && typeof nestedData === 'object' && 'user' in nestedData
      ? nestedData.user
      : undefined;

  const maybeUser =
    ('user' in payload && payload.user) ||
    nestedUser ||
    (nestedData && isUserPayload(nestedData) ? nestedData : undefined) ||
    payload;

  if (!isUserPayload(maybeUser)) {
    throw new Error('Invalid login response');
  }

  const accessToken =
    ('accessToken' in payload && payload.accessToken) ||
    ('access_token' in payload && payload.access_token) ||
    ('token' in payload && payload.token) ||
    ('jwt' in payload && payload.jwt) ||
    (nestedData && typeof nestedData === 'object' && 'accessToken' in nestedData
      ? nestedData.accessToken
      : undefined) ||
    (nestedData && typeof nestedData === 'object' && 'token' in nestedData
      ? nestedData.token
      : undefined) ||
    maybeUser.accessToken ||
    '';

  const refreshToken =
    ('refreshToken' in payload && payload.refreshToken) ||
    ('refresh_token' in payload && payload.refresh_token) ||
    (nestedData && typeof nestedData === 'object' && 'refreshToken' in nestedData
      ? nestedData.refreshToken
      : undefined) ||
    maybeUser.refreshToken ||
    '';

  saveToken(ACCESS_TOKEN_KEY, accessToken);
  saveToken(REFRESH_TOKEN_KEY, refreshToken);

  return {
    ...maybeUser,
    accessToken,
    refreshToken,
  };
};

const axiosClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AUTH_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await axiosClient<LoginApiResponse>({
      method: 'POST',
      url: `/login`,
      data: { email, password },
      withCredentials: true,
    });

    return extractLoginPayload(response.data);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to call login API');
    }
    throw error;
  }
}

export async function getCurrentUser(): Promise<User> {
  try {
    const accessToken = getStoredToken(ACCESS_TOKEN_KEY, LEGACY_ACCESS_TOKEN_KEYS);

    const response = await axios<User>({
      method: 'GET',
      url: `${process.env.NEXT_PUBLIC_USERS_API_URL}/me`,
      withCredentials: true,
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to fetch current user');
    }
    throw error;
  }
}

export async function changePassword(): Promise<unknown> {
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
}

export async function logout(): Promise<unknown> {
  try {
    const response = await axiosClient({
      method: 'POST',
      url: `/logout`,
    });
    clearStoredTokens();
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'Failed to logout');
    }
    clearStoredTokens();
    throw error;
  }
}
