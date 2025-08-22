const BASE_URL = import.meta.env.VITE_APP_API_URL || "/api";
const PAGE_SIZE = Number(import.meta.env.VITE_API_PAGE_SIZE) || 8;

export const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token'
} as const;

export { BASE_URL, PAGE_SIZE };