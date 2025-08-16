import  {type User, type UserUpdateData} from "@/types/user"
import type { AxiosInstance } from "axios"
import { Api } from "@/api/api"
export class UserApi extends Api<User> {
  constructor(apiClient: AxiosInstance) {
    super("user", apiClient)
  }

  async updateMe(data: UserUpdateData): Promise<User> {
    const res = await this.apiClient.put<User>(`/me`, data)
    return res.data
  }
}