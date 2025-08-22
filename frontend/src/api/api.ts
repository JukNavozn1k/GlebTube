import type { AxiosInstance } from "axios"
import type { Paginated, PaginationParams } from "@/types/pagination"

export abstract class Api<T> {
  prefix: string
  apiClient: AxiosInstance

  constructor(prefix: string, apiClient: AxiosInstance) {
    this.prefix = prefix
    this.apiClient = apiClient
  }

  async list(params?: PaginationParams): Promise<Paginated<T>> {
    const res = await this.apiClient.get<Paginated<T>>(`/${this.prefix}/`, { params })
    return res.data
  }

  /**
   * Fetch by absolute/relative 'next' URL from DRF pagination
   */
  async fetchNext(nextUrl: string): Promise<Paginated<T>> {
    const res = await this.apiClient.get<Paginated<T>>(nextUrl)
    return res.data
  }

  async get(id: string): Promise<T> {
    try {
      const res = await this.apiClient.get<T>(`/${this.prefix}/${id}`)
      return res.data
    } catch (error: any) {
      if (error.response) {
        console.error("API GET error:", error.response.status, error.response.data)
        throw error.response.data
      } else {
        console.error("API GET error:", error)
        throw error
      }
    }
  }

  async create(data: unknown): Promise<T> {
  const res = await this.apiClient.post<T>(`/${this.prefix}/`, data)
    return res.data
  }

  async update(id: string, data: unknown): Promise<T> {
  const res = await this.apiClient.put<T>(`/${this.prefix}/${id}/`, data)
    return res.data
  }

  async delete(id: string): Promise<any> {
  const res = await this.apiClient.delete(`/${this.prefix}/${id}/`)
    return res.data
  }
}
