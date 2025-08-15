import type { AxiosInstance } from "axios";
import type { Video } from "@/types/video";
import { Api } from "@/api/api";

export class VideoApi extends Api<Video> {
  constructor(apiClient: AxiosInstance) {
    super("video", apiClient);
  }

  /**
   * Create a new video.
   * Accepts only the required fields for POST: title, description, thumbnail, src
   */
  async createVideo(data: { title: string; description: string; thumbnail: string; src: string }): Promise<Video> {
    const res = await this.apiClient.post<Video>(`${this.prefix}/`, data);
    return res.data;
  }

  /**
   * Update an existing video (partial fields allowed): title, description, thumbnail
   */
  async updateVideo(id: string, data: { title?: string; description?: string; thumbnail?: string }): Promise<Video> {
    const res = await this.apiClient.put<Video>(`${this.prefix}/${id}`, data);
    return res.data;
  }

  // Keep compatibility with base Api create/update if needed
  async create(data: unknown): Promise<Video> {
    return this.createVideo(data as { title: string; description: string; thumbnail: string; src: string });
  }

  async update(id: string, data: unknown): Promise<Video> {
    return this.updateVideo(id, data as { title?: string; description?: string; thumbnail?: string });
  }
}
