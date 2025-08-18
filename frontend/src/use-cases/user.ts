import type { User, UserUpdateData } from "@/types/user"
import { userApi, type UserApi } from "@/api/user"

export class UserUseCases {
  private userApi: UserApi

  constructor(userApi: UserApi) {
    this.userApi = userApi
  }

  // CRUD passthroughs
  async list(): Promise<User[]> {
    return this.userApi.list()
  }

  async get(id: string): Promise<User> {
    return this.userApi.get(id)
  }

  async create(data: unknown): Promise<User> {
    return this.userApi.create(data)
  }

  async update(id: string, data: unknown): Promise<User> {
    return this.userApi.update(id, data)
  }

  async delete(id: string): Promise<Record<string, unknown>> {
    return this.userApi.delete(id)
  }

  // Specific use-cases
  async updateMe(data: UserUpdateData): Promise<User> {
    return this.userApi.updateMe(data)
  }
}

export const userUseCases = new UserUseCases(userApi)
