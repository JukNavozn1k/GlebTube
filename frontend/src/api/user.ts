import  {type User, type UserUpdateData} from "@/types/user"
import type { AxiosInstance } from "axios"
import { Api } from "@/api/api"
import api from "@/api/client"

export class UserApi extends Api<User> {
  constructor(apiClient: AxiosInstance, prefix: string = "user") {
    super(prefix, apiClient)
  }

  async updateMe(data: UserUpdateData): Promise<User> {
    const res = await this.apiClient.put<User>(`/${this.prefix}/me/`, data)
    return res.data
  }
}

export const userApi = new UserApi(api, "user")