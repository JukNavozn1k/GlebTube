import { videoApi, type VideoApi } from "@/api/video";
import type { Video } from "@/types/video";
import type { UploadVideoPayload, UpdateVideoPayload } from "@/types/upload";
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
  async createVideo(payload: UploadVideoPayload) {
    return this.videoApi.createVideo(payload);
  }

  /**
   * Update video with allowed fields
   */
  async updateVideo(id: string, payload: UpdateVideoPayload) {
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

  /**
   * Search videos by text query
   */
  async search(query: string) {
    return this.videoApi.search(query);
  }

  /**
   * Toggle star for a video and return { video_id, starred }
   */
  async rate(id: string) {
    return this.videoApi.rate(id);
  }

  /**
   * Fetch similar videos for a given id
   */
  async fetchSimilar(id: string) {
    return this.videoApi.fetchSimilar(id);
  }
}

export const videoUseCases = new VideoUseCases(videoApi);
