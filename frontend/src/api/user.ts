import  {type User, type UserUpdateData} from "@/types/user"
import type { AxiosInstance } from "axios"
import { Api } from "@/api/api"
import api from "@/api/client"
import type { UpdateUserProfilePayload } from "@/types/upload"

export class UserApi extends Api<User> {
  constructor(apiClient: AxiosInstance, prefix: string = "user") {
    super(prefix, apiClient)
  }

  async updateMe(data: UserUpdateData): Promise<User> {
    const res = await this.apiClient.put<User>(`/${this.prefix}/me/`, data)
    return res.data
  }

  /**
   * Update current user via multipart/form-data (bio and/or avatar)
   */
  async updateMyProfile(data: UpdateUserProfilePayload): Promise<User> {
    const form = new FormData()
    if (typeof data.bio === "string") form.append("bio", data.bio)
    if (data.avatar) form.append("avatar", data.avatar)
    const res = await this.apiClient.put<User>(`/${this.prefix}/me/`, form)
    return res.data
  }

  /**
   * List users with optional filters. For subscriptions page we use: { subscribed: true, username?: prefix }
   */
  async listByFilter(params: { username?: string; subscribed?: boolean }): Promise<User[]> {
    const query = new URLSearchParams()
    if (typeof params.username === "string") query.append("username", params.username)
    if (typeof params.subscribed === "boolean") query.append("subscribed", String(params.subscribed))
    const qs = query.toString()
    const url = qs ? `/${this.prefix}/?${qs}` : `/${this.prefix}/`
    const res = await this.apiClient.get<User[]>(url)
    return res.data
  }

  /**
   * Toggle subscription for a channel
   * POST /user/<channel_id>/subscribe/
   */
  async subscribe(channel_id: string | number): Promise<{ channel_id: number; subscribed: boolean }> {
    const res = await this.apiClient.post<{ channel_id: number; subscribed: boolean }>(
      `/${this.prefix}/${channel_id}/subscribe/`
    )
    return res.data
  }
}

export const userApi = new UserApi(api, "user")