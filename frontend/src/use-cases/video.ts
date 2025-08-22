import { videoApi, type VideoApi } from "@/api/video";
import type { Video } from "@/types/video";
import type { UploadVideoPayload, UpdateVideoPayload } from "@/types/upload";
import { UseCases } from "@/use-cases/use-cases";
import type { Paginated, PaginationParams } from "@/types/pagination";

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
  async fetchHistory(params?: PaginationParams): Promise<Paginated<Video>> {
    return this.videoApi.fetchHistory(params);
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
  async fetchStarred(params?: PaginationParams): Promise<Paginated<Video>> {
    return this.videoApi.fetchStarred(params);
  }

  /**
   * Fetch videos by channel with optional starred filter
   */
  async fetchByChannel(
    channel: number | string,
    opts?: { starred?: boolean } & PaginationParams
  ): Promise<Paginated<Video>> {
    return this.videoApi.fetchByChannel(channel, opts);
  }

  /**
   * Search videos by text query
   */
  async search(query: string, params?: PaginationParams): Promise<Paginated<Video>> {
    return this.videoApi.search(query, params);
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
  async fetchSimilar(id: string, params?: PaginationParams): Promise<Paginated<Video>> {
    return this.videoApi.fetchSimilar(id, params);
  }

  /**
   * Get HLS playlist URL for a video id (pages should not build URLs directly).
   */
  hlsUrl(id: string) {
    return this.videoApi.hlsUrl(id);
  }

  // passthrough for next page fetching
  async fetchNext(nextUrl: string): Promise<Paginated<Video>> {
    return this.api.fetchNext(nextUrl)
  }
}

export const videoUseCases = new VideoUseCases(videoApi);
