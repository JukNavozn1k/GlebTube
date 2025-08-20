import type { User } from "@/types/user"

export type Comment = {
  id: string
  video: string
  parent?: string
  channel: User
  text: string
  createdAt: string
  baseStars: number
  starred: boolean
}

// Payload to create a comment
export type CreateCommentPayload = {
  video: string
  text: string
  parent?: string
}

// List query params supported by backend
export type ListCommentsParams = {
  ordering?: "-baseStars" | "baseStars" | "-createdAt" | "createdAt"
  parent?: string
  video?: string
}

// Response for rating endpoint
export type RateCommentResponse = {
  comment_id: string
  starred: boolean
}
