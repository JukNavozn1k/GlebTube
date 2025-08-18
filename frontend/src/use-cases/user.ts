import type { User, UserUpdateData } from "@/types/user"
import { userApi, type UserApi } from "@/api/user"
import { UseCases } from "@/use-cases/use-cases"

export class UserUseCases extends UseCases<User> {
  private userApi: UserApi

  constructor(userApi: UserApi) {
    super(userApi)
    this.userApi = userApi
  }

  // Specific use-cases
  async updateMe(data: UserUpdateData): Promise<User> {
    return this.userApi.updateMe(data)
  }
}

export const userUseCases = new UserUseCases(userApi)
