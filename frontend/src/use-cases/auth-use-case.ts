import type { LoginCredentials, RegisterCredentials, AuthTokens, RegisterResponse, UserProfile } from "@/types/auth";
import { AuthApi } from "@/api/auth";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import api from "@/api/client";

export class AuthUseCase {
  private authApi: AuthApi;
  private currentUser: UserProfile | null = null;

  constructor() {
    this.authApi = new AuthApi(api);
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
      throw error;
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
      throw error;
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
