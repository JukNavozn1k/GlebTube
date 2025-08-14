export type Comment = {
  id: string
  videoId: string
  parentId?: string
  userId: string
  userName: string
  userHandle: string
  userAvatar: string
  text: string
  createdAt: string
  stars?: number
}
