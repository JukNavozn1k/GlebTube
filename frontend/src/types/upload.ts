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

// User profile upload/update payloads (separate from UserUpdateData in types/user.ts)
export type UploadUserProfilePayload = {
  bio?: string
  avatar?: File | null
}

export type UpdateUserProfilePayload = {
  bio?: string
  avatar?: File | null
}
