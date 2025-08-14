import type { AxiosInstance } from "axios";
import type { LoginCredentials, RegisterCredentials, AuthTokens, RegisterResponse, UserProfile } from "@/types/auth";
import { AUTH_ENDPOINTS } from "@/lib/constants";
import { Api } from "./api";

export class AuthApi extends Api<AuthTokens> {
  constructor(apiClient: AxiosInstance) {
    super("auth", apiClient);
  }

  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await this.apiClient.post<AuthTokens>(AUTH_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    const response = await this.apiClient.post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, credentials);
    return response.data;
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await this.apiClient.get<UserProfile>(AUTH_ENDPOINTS.PROFILE);
    return response.data;
  }
}
