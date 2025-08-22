import type { Paginated, PaginationParams } from "@/types/pagination"

export class UseCases<T> {
  api: {
    list: (params?: PaginationParams) => Promise<Paginated<T>>
    fetchNext: (nextUrl: string) => Promise<Paginated<T>>
    get: (id: string) => Promise<T>
    create: (data: unknown) => Promise<T>
    update: (id: string, data: unknown) => Promise<T>
    delete: (id: string) => Promise<Record<string, unknown>>
  }

  constructor(api: UseCases<T>["api"]) {
    this.api = api
  }

  // Backward-compatible: returns only the items array
  async fetchList(params?: PaginationParams) {
    const page = await this.api.list(params)
    return page.results
  }

  // New: full paginated response
  async fetchListPaginated(params?: PaginationParams): Promise<Paginated<T>> {
    return this.api.list(params)
  }

  async fetchNext(nextUrl: string): Promise<Paginated<T>> {
    return this.api.fetchNext(nextUrl)
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
