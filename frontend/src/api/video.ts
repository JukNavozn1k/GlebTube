import type { AxiosInstance } from "axios";
import type { Video } from "@/types/video";
import type { UploadVideoPayload, UpdateVideoPayload } from "@/types/upload";
import { Api } from "@/api/api";
import api from "@/api/client";
import type { Paginated, PaginationParams } from "@/types/pagination";

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
  async fetchHistory(params?: PaginationParams): Promise<Paginated<Video>> {
    const res = await this.apiClient.get<Paginated<Video>>(`/${this.prefix}/history`, { params });
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
  async fetchStarred(params?: PaginationParams): Promise<Paginated<Video>> {
    const res = await this.apiClient.get<Paginated<Video>>(`/${this.prefix}/`, {
      params: { ...(params || {}), starred: true },
    });
    return res.data;
  }

  /**
   * Fetch videos by channel with optional starred filter
   * GET /video/?channel=<id>&starred=<true|false|''>
   */
  async fetchByChannel(
    channel: number | string,
    opts?: { starred?: boolean } & PaginationParams
  ): Promise<Paginated<Video>> {
    const { page, page_size, starred, ...rest } = opts || {};
    const params: Record<string, any> = { channel, page, page_size, ...rest };
    if (typeof starred === "boolean") params.starred = starred;
    const res = await this.apiClient.get<Paginated<Video>>(`/${this.prefix}/`, { params });
    return res.data;
  }

  /**
   * Search videos by query
   * GET /video/search/?q=<query>
   */
  async search(query: string, params?: PaginationParams): Promise<Paginated<Video>> {
    const res = await this.apiClient.get<Paginated<Video>>(`/${this.prefix}/search/`, {
      params: { q: query, ...(params || {}) },
    });
    return res.data;
  }

  /**
   * Toggle star for a video
   * POST /video/rate/{id}/
   */
  async rate(id: string): Promise<{ video_id: string; starred: boolean }> {
    const res = await this.apiClient.post<{ video_id: string; starred: boolean }>(
      `/${this.prefix}/${id}/rate/`
    );
    return res.data;
  }

  /**
   * Fetch similar videos for a given id
   * GET /video/{id}/similar
   */
  async fetchSimilar(id: string, params?: PaginationParams): Promise<Paginated<Video>> {
    const res = await this.apiClient.get<Paginated<Video>>(`/${this.prefix}/${id}/similar/`, { params });
    return res.data;
  }

  /**
   * Build HLS playlist URL for a given video id.
   * It relies on the Axios client's baseURL so that pages do not import BASE_URL directly.
   */
  hlsUrl(id: string): string {
    const base = (this.apiClient.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${this.prefix}/${id}/hls/`;
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
