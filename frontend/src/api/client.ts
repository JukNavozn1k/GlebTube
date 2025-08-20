import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { BASE_URL, LOCAL_STORAGE_KEYS } from '@/lib/constants';

// In-memory access token for better security than persisting in localStorage
let accessToken: string | null = null;

// Exported helpers to manage tokens from auth use-cases
export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return typeof window !== 'undefined'
    ? localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN)
    : null;
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
  else localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
}

export function clearAuth() {
  setAccessToken(null);
  setRefreshToken(null);
}

const api = axios.create({ baseURL: BASE_URL });

// Attach access token to requests
api.interceptors.request.use(
  (config) => {
    const token = accessToken; // do not read access from localStorage
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Prevent multiple simultaneous refreshes
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  const refresh = getRefreshToken();
  if (!refresh) {
    clearAuth();
    return Promise.reject(new Error('No refresh token'));
  }

  const refreshClient = axios.create({ baseURL: BASE_URL });
  refreshInFlight = refreshClient
    .post<{ access: string }>(`/auth/jwt/refresh/`, { refresh })
    .then((res) => {
      const newAccess = res.data.access;
      setAccessToken(newAccess);
      return newAccess;
    })
    .catch((err) => {
      clearAuth();
      throw err;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

// Retry original request after refresh when receiving 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        // Set new header and retry
        original.headers = original.headers || {};
        (original.headers as any)['Authorization'] = `Bearer ${newAccess}`;
        return api.request(original);
      } catch (e) {
        // fall through to reject
      }
    }
    return Promise.reject(error);
  }
);

export default api;