import type { User } from "@/types/user"

export type Video = {
  id: string
  title: string
  channel: User
  views: number
  createdAt: string
  duration: string
  src: string
  thumbnail: string
  description: string
  baseStars: number
  starred: boolean // Новое поле для упрощения рейтинга
  tags: string[]
  status?: string // e.g. 'completed' | 'processing' | 'failed'; HLS доступен когда status === 'completed'
}

export type UploadedVideo = Video & {
  uploaderId: string
  isUploaded: true
}
