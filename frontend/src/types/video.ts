export type Video = {
  id: string
  title: string
  channel: string
  views: number
  createdAt: string
  duration: string
  src: string
  thumbnail: string
  description: string
  baseStars: number
  tags: string[]
}

export type UploadedVideo = Video & {
  uploaderId: string
  isUploaded: true
}
