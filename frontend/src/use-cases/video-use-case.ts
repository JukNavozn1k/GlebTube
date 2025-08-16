import { UseCases } from "@/use-cases/use-case"
import { videoApi } from "@/api/video-api"
import type { Video } from "@/types/video"

export class VideoUseCase extends UseCases<Video> {
  constructor() {
    super(videoApi)
  }

  async createVideo(payload: { title: string; description: string; thumbnail: string; src: string }) {
    return videoApi.createVideo(payload)
  }

  async updateVideo(id: string, payload: { title?: string; description?: string; thumbnail?: string }) {
    return videoApi.updateVideo(id, payload)
  }
}

export const videoUseCase = new VideoUseCase()
