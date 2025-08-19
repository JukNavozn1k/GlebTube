import type { User } from "@/types/user"

export type Comment = {
  id: string
  video: string
  parent?: string
  user: User
  text: string
  createdAt: string
  stars?: number
  starred: boolean // Новое поле для упрощения рейтинга
}
