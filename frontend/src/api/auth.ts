import type { AxiosInstance } from "axios";
import type { LoginCredentials, RegisterCredentials, AuthTokens, RegisterResponse, UserProfile } from "@/types/auth";

import { Api } from "@/api//api";

export class AuthApi extends Api<AuthTokens> {
  constructor(apiClient: AxiosInstance) {
    super("auth", apiClient);
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await this.apiClient.post<AuthTokens>('/auth/jwt/create/', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const response = await this.apiClient.post<RegisterResponse>('/auth/users/', credentials);
    return response.data;
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await this.apiClient.get<UserProfile>('/user/me/');
    return response.data;
  }
}
