export type UploadVideoPayload = {
  title: string
  description: string
  thumbnail?: File | null
  src: File
}

export type UpdateVideoPayload = {
  title?: string
  description?: string
  thumbnail?: File | null
}
