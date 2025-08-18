import type { AxiosInstance } from "axios";
import type { Video } from "@/types/video";
import { Api } from "@/api/api";
import api from "@/api/client";

export class VideoApi extends Api<Video> {
  constructor(apiClient: AxiosInstance, prefix: string = "video") {
    super(prefix, apiClient);
  }

  /**
   * Create a new video.
   * Accepts only the required fields for POST: title, description, thumbnail, src
   */
  async createVideo(data: { title: string; description: string; thumbnail: string; src: string }): Promise<Video> {
    const res = await this.apiClient.post<Video>(`/${this.prefix}/`, data);
    return res.data;
  }

  /**
   * Update an existing video (partial fields allowed): title, description, thumbnail
   */
  async updateVideo(id: string, data: { title?: string; description?: string; thumbnail?: string }): Promise<Video> {
    const res = await this.apiClient.put<Video>(`/${this.prefix}/${id}`, data);
    return res.data;
  }

  /**
   * Fetch watch history
   */
  async fetchHistory(): Promise<Video[]> {
    const res = await this.apiClient.get<Video[]>(`/${this.prefix}/history`);
    return res.data;
  }

  /**
   * Clear watch history
   */
  async clearHistory(): Promise<void> {
    await this.apiClient.delete(`/${this.prefix}/history/`);
  }

  /**
   * Fetch starred videos
   * GET /video/?starred=true
   */
  async fetchStarred(): Promise<Video[]> {
    const res = await this.apiClient.get<Video[]>(`/${this.prefix}/`, {
      params: { starred: true },
    });
    return res.data;
  }

  /**
   * Fetch videos by channel with optional starred filter
   * GET /video/?channel=<id>&starred=<true|false|''>
   */
  async fetchByChannel(channel: number | string, opts?: { starred?: boolean }): Promise<Video[]> {
    const starredParam = typeof opts?.starred === "boolean" ? opts.starred : "";
    const res = await this.apiClient.get<Video[]>(`/${this.prefix}/`, {
      params: { channel, starred: starredParam },
    });
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

export const videoApi = new VideoApi(api, "video");
