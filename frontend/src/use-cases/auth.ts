import type { LoginCredentials, RegisterCredentials, AuthTokens, RegisterResponse, UserProfile } from "@/types/auth";
import { authApi, AuthApi } from "@/api/auth";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { parseAxiosError } from "@/types/http";
import { setAccessToken, setRefreshToken, getRefreshToken, clearAuth, getAccessToken } from "@/api/client";

export class AuthUseCases {
  private authApi: AuthApi;
  private currentUser: UserProfile | null = null;

  constructor(authApi: AuthApi) {
    this.authApi = authApi;
  }

  /**
   * Initialize use-case on app start: if tokens exist, try to load user profile.
   * If profile fetch fails, perform logout to clear tokens.
   */
  async initialize(): Promise<void> {
    // If we have an access token already in memory, try to load the profile.
    // Otherwise, if we have a refresh token, try to refresh and then load profile.
    try {
      if (getAccessToken()) {
        await this.loadUserProfile();
        return;
      }

      const refresh = getRefreshToken();
      if (refresh) {
        await this.refreshTokens();
        await this.loadUserProfile();
      }
    } catch {
      this.logout();
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const tokens = await this.authApi.login(credentials);
      // Keep access in-memory; persist only refresh
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      await this.loadUserProfile();
      return tokens;
    } catch (error) {
      console.error("Login error:", error);
      throw parseAxiosError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await this.authApi.register(credentials);
      // После успешной регистрации сразу логиним пользователя
      await this.login(credentials);
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw parseAxiosError(error);
    }
  }

  private async loadUserProfile(): Promise<UserProfile> {
    try {
      this.currentUser = await this.authApi.getUserProfile();
      return this.currentUser;
    } catch (error) {
      console.error("Get user profile error:", error);
      throw error;
    }
  }
  /** NEW: обновление access токена с использованием refresh */
  async refreshTokens(): Promise<string> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token available");

    try {
      const { access } = await this.authApi.refresh(refreshToken);
      setAccessToken(access);
      return access;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.logout();
      throw parseAxiosError(error);
    }
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    // Consider authenticated if we have an access token in memory or a refresh token persisted
    return !!getAccessToken() || !!getRefreshToken();
  }

  logout(): void {
    this.currentUser = null;
    clearAuth();
    // Ensure refresh token is also cleared from storage
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    }
  }
}

export const authUseCases = new AuthUseCases(authApi);
// Removed periodic refresh in favor of on-demand refresh via Axios interceptor