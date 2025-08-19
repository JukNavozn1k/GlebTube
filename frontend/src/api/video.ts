import type { AxiosInstance } from "axios";
import type { Video } from "@/types/video";
import type { UploadVideoPayload, UpdateVideoPayload } from "@/types/upload";
import { Api } from "@/api/api";
import api from "@/api/client";

export class VideoApi extends Api<Video> {
  constructor(apiClient: AxiosInstance, prefix: string = "video") {
    super(prefix, apiClient);
  }

  /**
   * Create a new video via multipart/form-data
   */
  async createVideo(data: UploadVideoPayload): Promise<Video> {
    const form = new FormData();
    form.append("title", data.title);
    form.append("description", data.description);
    form.append("src", data.src);
    if (data.thumbnail) form.append("thumbnail", data.thumbnail);
    const res = await this.apiClient.post<Video>(`/${this.prefix}/`, form);
    return res.data;
  }

  /**
   * Update an existing video via multipart/form-data (partial fields allowed)
   */
  async updateVideo(id: string, data: UpdateVideoPayload): Promise<Video> {
    const form = new FormData();
    if (typeof data.title === "string") form.append("title", data.title);
    if (typeof data.description === "string") form.append("description", data.description);
    if (data.thumbnail) form.append("thumbnail", data.thumbnail);
    const res = await this.apiClient.put<Video>(`/${this.prefix}/${id}/`, form);
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

  /**
   * Search videos by query
   * GET /video/search/?q=<query>
   */
  async search(query: string): Promise<Video[]> {
    const res = await this.apiClient.get<Video[]>(`/${this.prefix}/search/`, {
      params: { q: query },
    });
    return res.data;
  }

  // Keep compatibility with base Api create/update if needed
  async create(data: unknown): Promise<Video> {
    return this.createVideo(data as UploadVideoPayload);
  }

  async update(id: string, data: unknown): Promise<Video> {
    return this.updateVideo(id, data as UpdateVideoPayload);
  }
}

export const videoApi = new VideoApi(api, "video");
