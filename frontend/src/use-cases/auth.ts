import type { LoginCredentials, RegisterCredentials, AuthTokens, RegisterResponse, UserProfile } from "@/types/auth";
import { authApi,AuthApi } from "@/api/auth";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { parseAxiosError } from "@/types/http";

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
    if (!this.isAuthenticated()) return;
    try {
      await this.loadUserProfile();
    } catch {
      // If initializing fails (expired token etc) clear stored tokens
      this.logout();
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const tokens = await this.authApi.login(credentials);
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, tokens.access);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh);
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
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) throw new Error("No refresh token available");

    try {
      const { access } = await this.authApi.refresh(refreshToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, access);
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
    return !!localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }
}

export const authUseCases = new AuthUseCases(authApi);
// Автообновление access токена каждые 5 минут (300 000 мс)
setInterval(async () => {
  if (authUseCases.isAuthenticated()) {
    try {
      await authUseCases.refreshTokens();
      console.log("Access token refreshed");
    } catch (error) {
      console.warn("Failed to refresh token:", error);
    }
  }
}, 60_60); // 5 минут в миллисекундах