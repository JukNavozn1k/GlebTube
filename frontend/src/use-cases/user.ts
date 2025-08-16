import type { User, UserUpdateData } from "@/types/user"
import type { UserApi } from "@/api/user"
import { UseCases } from "@/use-cases/use-cases"

export class UserUseCases extends UseCases<User> {
  private userApi: UserApi

  constructor(userApi: UserApi) {
    super(userApi)
    this.userApi = userApi
  }

  async updateMe(data: UserUpdateData): Promise<User> {
    return this.userApi.updateMe(data)
  }
}
