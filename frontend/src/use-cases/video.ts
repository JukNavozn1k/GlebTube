import { videoApi, type VideoApi } from "@/api/video";
import type { Video } from "@/types/video";
import { UseCases } from "@/use-cases/use-cases";

export class VideoUseCases extends UseCases<Video> {
  private videoApi: VideoApi;

  constructor(videoApi: VideoApi) {
    super(videoApi);
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

  /**
   * Fetch watch history
   */
  async fetchHistory() {
    return this.videoApi.fetchHistory();
  }

  /**
   * Clear watch history
   */
  async clearHistory() {
    return this.videoApi.clearHistory();
  }

  /**
   * Fetch starred videos
   */
  async fetchStarred() {
    return this.videoApi.fetchStarred();
  }

  /**
   * Fetch videos by channel with optional starred filter
   */
  async fetchByChannel(channel: number | string, opts?: { starred?: boolean }) {
    return this.videoApi.fetchByChannel(channel, opts);
  }
}

export const videoUseCases = new VideoUseCases(videoApi);
