import { videoApi, type VideoApi } from "@/api/video";
import type { Video } from "@/types/video";

export class VideoUseCases {
  private videoApi: VideoApi;

  constructor(videoApi: VideoApi) {
    this.videoApi = videoApi;
  }

  // CRUD passthroughs
  async list(): Promise<Video[]> {
    return this.videoApi.list();
  }

  async get(id: string): Promise<Video> {
    return this.videoApi.get(id);
  }

  async create(data: unknown): Promise<Video> {
    return this.videoApi.create(data);
  }

  async update(id: string, data: unknown): Promise<Video> {
    return this.videoApi.update(id, data);
  }

  async delete(id: string): Promise<Record<string, unknown>> {
    return this.videoApi.delete(id);
  }

  /**
   * Create video with required fields
   */
  async createVideo(payload: { title: string; description: string; thumbnail: string; src: string }) {
    return this.videoApi.createVideo(payload);
  }

  /**
   * Update video with allowed fields
   */
  async updateVideo(id: string, payload: { title?: string; description?: string; thumbnail?: string }) {
    return this.videoApi.updateVideo(id, payload);
  }
}

export const videoUseCases = new VideoUseCases(videoApi);
