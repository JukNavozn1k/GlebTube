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

  // Override list to add debug logging during development.
  async fetchList() {
    console.log("VideoUseCase: calling API list()")
    const res = await this.videoApi.list()
    console.log("VideoUseCase: API list returned count=", Array.isArray(res) ? res.length : typeof res)

    // Map backend shape to frontend `Video` shape.
    const mapped = (res || []).map((v: any) => {
      const author = v.author || v.channel || null

      const channel = author
        ? {
            id: String(author.id ?? author.pk ?? "unknown"),
            name: author.username ?? author.name ?? "Unknown",
            avatar: author.avatar ?? undefined,
            bio: author.bio ?? undefined,
            subscriberCount: author.subscriberCount ?? undefined,
          }
        : { id: "unknown", name: "Unknown" }

      const video = {
        id: String(v.id ?? v.pk ?? ""),
        title: v.title ?? "",
        channel,
        views: v.views ?? 0,
        createdAt: v.createdAt ?? v.created_at ?? "",
        duration: v.duration ?? "",
        src: v.src ?? v.hls ?? "",
        thumbnail: v.thumbnail ?? "",
        description: v.description ?? "",
        baseStars: v.baseStars ?? 0,
        starred: v.starred ?? false,
        tags: v.tags ?? [],
      }

      return video
  })

  return mapped as unknown as Video[]
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
