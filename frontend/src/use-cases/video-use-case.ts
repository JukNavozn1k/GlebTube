import { UseCases } from "@/use-cases/use-case";
import api from "@/api/client";
import { VideoApi } from "@/api/video-api";
import type { Video } from "@/types/video";

export class VideoUseCase extends UseCases<Video> {
  private videoApi: VideoApi;

  constructor() {
    const videoApi = new VideoApi(api);
    super({
      list: () => videoApi.list(),
      get: (id: string) => videoApi.get(id),
      create: (data: unknown) => videoApi.create(data),
      update: (id: string, data: unknown) => videoApi.update(id, data),
      delete: (id: string) => videoApi.delete(id),
    });
    this.videoApi = videoApi;
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
