export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  email: string;
  username: string;
  id: number;
}

export interface UserProfile {
  email?: string;
  id: number;
  username: string;
  avatar?: string | null;
  bio?: string;
  baseStars?: number;
  subscriberCount?: number;
}
