import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { BASE_URL, LOCAL_STORAGE_KEYS } from '@/lib/constants';

// In-memory access token
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
  else localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
}

export function clearAuth() {
  accessToken = null;
  setRefreshToken(null);
}

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
    .post<{ access: string }>('/auth/jwt/refresh/', { refresh })
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

interface AxiosRequestWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestWithRetry | undefined;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && original && !original._retry) {
      original._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        original.headers = original.headers || {};
        (original.headers as any)['Authorization'] = `Bearer ${newAccess}`;
        return api.request(original);
      } catch {
        // Refresh failed
      }
    }

    return Promise.reject(error);
  }
);

export default api;
