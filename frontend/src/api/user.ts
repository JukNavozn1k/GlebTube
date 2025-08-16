import { Api } from "@/api/api"
import api from "@/api/client"
import type { User, UserUpdateData } from "@/types/user"

export class UserApi extends Api<User> {
  constructor() {
    super("user", api) 
  }

  async updateMe(data: UserUpdateData): Promise<User> {
    const formData = new FormData()

    if (data.bio) {
      formData.append("bio", data.bio)
    }
    if (data.avatarFile) {
      formData.append("avatar", data.avatarFile)
    }

    const res = await this.apiClient.put<User>(`${this.prefix}/me`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  }
}


export const userApi = new UserApi()
