const BASE_URL = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : "http://127.0.0.1:8000/api";

export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/jwt/create/',
    REGISTER: '/auth/users/',
    PROFILE: '/user/me/'
} as const;

export const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token'
} as const;

export { BASE_URL };