export class UseCases<T> {
  api: {
    list: () => Promise<T[]>
    get: (id: string) => Promise<T>
    create: (data: unknown) => Promise<T>
    update: (id: string, data: unknown) => Promise<T>
    delete: (id: string) => Promise<Record<string, unknown>>
  }

  constructor(api: UseCases<T>["api"]) {
    this.api = api
  }

  async fetchList() {
    return this.api.list()
  }

  async fetchById(id: string) {
    return this.api.get(id)
  }

  async save(data: unknown, id?: string) {
    if (id) {
      return this.api.update(id, data)
    }
    return this.api.create(data)
  }

  async remove(id: string) {
    return this.api.delete(id)
  }
}
