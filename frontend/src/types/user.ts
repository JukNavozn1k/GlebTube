export type User = {
  id: string
  username: string
  email?: string
  avatar?: string
  bio?: string
  subscriberCount?: number
  baseStars?: number
  videoCount?: number
  joinedAt?: string
  location?: string
  website?: string
  subscribed: boolean // Новое поле для упрощения подписок
}

export type AuthState = {
  loggedIn: boolean
  username: string
  // currentUser is the latest profile returned by the use-case (null when not authenticated)
  currentUser?: User | null
}

export type UserUpdateData = Partial<Pick<User, "bio" | "avatar">>