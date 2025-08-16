import type { Video } from "@/types/video"
import { Api } from "@/api/api"
import api from "@/api/client" 

export class VideoApi extends Api<Video> {
  constructor() {
    super("video", api) // зависимость прописана один раз
  }

  /**
   * Create a new video.
   * Accepts only the required fields for POST: title, description, thumbnail, src
   */
  async createVideo(data: { title: string; description: string; thumbnail: string; src: string }): Promise<Video> {
    const res = await this.apiClient.post<Video>(`/${this.prefix}/`, data)
    return res.data
  }

  /**
   * Update an existing video (partial fields allowed): title, description, thumbnail
   */
  async updateVideo(id: string, data: { title?: string; description?: string; thumbnail?: string }): Promise<Video> {
    const res = await this.apiClient.put<Video>(`/${this.prefix}/${id}`, data)
    return res.data
  }

  // совместимость с базовыми create/update
  async create(data: unknown): Promise<Video> {
    return this.createVideo(data as { title: string; description: string; thumbnail: string; src: string })
  }

  async update(id: string, data: unknown): Promise<Video> {
    return this.updateVideo(id, data as { title?: string; description?: string; thumbnail?: string })
  }
}

// 👉 Экземпляр создаётся 1 раз и экспортируется
export const videoApi = new VideoApi()
