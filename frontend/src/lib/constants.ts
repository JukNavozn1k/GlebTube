const BASE_URL = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : "/api";



export const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token'
} as const;

export { BASE_URL };