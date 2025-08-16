import { UseCases } from "@/use-cases/use-case"
import { userApi } from "@/api/user"
import type { User, UserUpdateData } from "@/types/user"

export class UserUseCases extends UseCases<User> {
  constructor() {
    super(userApi)
  }

  async updateMe(data: UserUpdateData): Promise<User> {
    return userApi.updateMe(data)
  }
}

export const userUseCases = new UserUseCases()
