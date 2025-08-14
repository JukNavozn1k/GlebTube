const BASE_URL = typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL
  : "http://localhost:8000";

export { BASE_URL };